import os
import hashlib
import requests
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import logging
from gtts import gTTS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://localhost:5173'], supports_credentials=True)

# Configuration
NASA_API_KEY = os.getenv('NASA_API_KEY', 'DEMO_KEY')
AUDIO_CACHE_DIR = 'audio_cache'

# Create audio cache directory
os.makedirs(AUDIO_CACHE_DIR, exist_ok=True)

class TTSManager:
    """Simplified Text-to-Speech manager."""
    
    def __init__(self):
        self.text_storage = {}  # Store text by hash for retrieval
        
    def generate_audio(self, text: str, lang: str = 'en', speed: float = 1.0) -> str:
        """Generate audio file from text."""
        try:
            # Create hash and filename
            text_hash = hashlib.md5(text.encode()).hexdigest()
            audio_file = os.path.join(AUDIO_CACHE_DIR, f"{text_hash}_{lang}_{speed}.mp3")
            
            # Store text for later retrieval
            self.text_storage[text_hash] = text
            
            # Check if audio file already exists
            if os.path.exists(audio_file):
                logger.info(f"📢 Using cached audio: {text_hash}")
                return audio_file
            
            # Clean text
            clean_text = self._clean_text_for_tts(text)
            
            # Generate TTS
            logger.info("🎙️ Generating TTS audio...")
            tts = gTTS(text=clean_text, lang=lang, slow=(speed < 1.0))
            tts.save(audio_file)
            
            logger.info(f"✅ TTS audio generated: {audio_file}")
            return audio_file
            
        except Exception as e:
            logger.error(f"❌ TTS generation failed: {e}")
            raise
    
    def get_text_by_hash(self, text_hash: str) -> str:
        """Retrieve text by hash."""
        return self.text_storage.get(text_hash, '')
    
    def _clean_text_for_tts(self, text: str) -> str:
        """Clean text for better TTS pronunciation."""
        import re
        clean_text = re.sub(r'<[^>]+>', '', text)
        
        # Replace abbreviations
        replacements = {
            'NASA': 'N A S A', 'ESA': 'E S A', 'JPL': 'J P L',
            'ISS': 'I S S', 'UV': 'U V', 'IR': 'I R',
            'km': 'kilometers', 'ly': 'light years', 'AU': 'astronomical units'
        }
        
        for abbr, full in replacements.items():
            clean_text = clean_text.replace(abbr, full)
        
        # Limit length
        if len(clean_text) > 3000:
            clean_text = clean_text[:3000] + "..."
        
        return clean_text
    
    def get_supported_languages(self):
        """Get list of supported TTS languages."""
        return [
            {'code': 'en', 'name': 'English', 'flag': '🇺🇸'},
            {'code': 'es', 'name': 'Spanish', 'flag': '🇪🇸'},
            {'code': 'fr', 'name': 'French', 'flag': '🇫🇷'},
            {'code': 'de', 'name': 'German', 'flag': '🇩🇪'},
            {'code': 'it', 'name': 'Italian', 'flag': '🇮🇹'},
            {'code': 'pt', 'name': 'Portuguese', 'flag': '🇵🇹'},
            {'code': 'ru', 'name': 'Russian', 'flag': '🇷🇺'},
            {'code': 'ja', 'name': 'Japanese', 'flag': '🇯🇵'},
            {'code': 'ko', 'name': 'Korean', 'flag': '🇰🇷'},
            {'code': 'zh', 'name': 'Chinese', 'flag': '🇨🇳'},
            {'code': 'hi', 'name': 'Hindi', 'flag': '🇮🇳'},
            {'code': 'ar', 'name': 'Arabic', 'flag': '🇸🇦'}
        ]

# Initialize TTS manager
tts_manager = TTSManager()

# ===============================
# NASA APOD API
# ===============================

@app.route('/apod', methods=['GET'])
def get_apod():
    """Get Astronomy Picture of the Day with TTS support."""
    try:
        date = request.args.get('date')
        nasa_url = f"https://api.nasa.gov/planetary/apod?api_key={NASA_API_KEY}"
        if date:
            nasa_url += f"&date={date}"
        
        response = requests.get(nasa_url, timeout=15)
        
        if response.status_code == 200:
            apod_data = response.json()
            
            # Add TTS capabilities
            apod_data['tts_available'] = True
            apod_data['supported_languages'] = tts_manager.get_supported_languages()
            
            # Store text and generate audio ID
            if 'explanation' in apod_data:
                text_hash = hashlib.md5(apod_data['explanation'].encode()).hexdigest()
                tts_manager.text_storage[text_hash] = apod_data['explanation']
                apod_data['audio_id'] = text_hash
            
            return jsonify(apod_data)
        else:
            return jsonify({'error': f'NASA API returned status {response.status_code}'}), 500
            
    except Exception as e:
        logger.error(f"❌ APOD fetch error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/apod/random', methods=['GET'])
def get_random_apod():
    """Get a random APOD with TTS support."""
    try:
        nasa_url = f"https://api.nasa.gov/planetary/apod?api_key={NASA_API_KEY}&count=1"
        response = requests.get(nasa_url, timeout=15)
        
        if response.status_code == 200:
            apod_data = response.json()[0]
            apod_data['tts_available'] = True
            apod_data['supported_languages'] = tts_manager.get_supported_languages()
            
            if 'explanation' in apod_data:
                text_hash = hashlib.md5(apod_data['explanation'].encode()).hexdigest()
                tts_manager.text_storage[text_hash] = apod_data['explanation']
                apod_data['audio_id'] = text_hash
            
            return jsonify(apod_data)
        else:
            return jsonify({'error': f'Failed to fetch random APOD - Status {response.status_code}'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===============================
# TTS ENDPOINTS
# ===============================

@app.route('/tts/generate', methods=['POST'])
def generate_tts():
    """Generate TTS audio for given text."""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400
        
        text = data['text']
        lang = data.get('language', 'en')
        speed = float(data.get('speed', 1.0))
        
        # Generate audio
        audio_file = tts_manager.generate_audio(text, lang, speed)
        text_hash = hashlib.md5(text.encode()).hexdigest()
        
        return jsonify({
            'success': True,
            'audio_id': text_hash,
            'audio_url': f"/tts/audio/{text_hash}?lang={lang}&speed={speed}",
            'download_url': f"/tts/download/{text_hash}?lang={lang}&speed={speed}",
            'language': lang,
            'speed': speed,
            'file_size': os.path.getsize(audio_file) if os.path.exists(audio_file) else 0
        })
        
    except Exception as e:
        logger.error(f"❌ TTS generation error: {e}")
        return jsonify({'error': f'TTS generation failed: {str(e)}'}), 500

@app.route('/tts/generate-by-hash', methods=['POST'])
def generate_tts_by_hash():
    """Generate TTS for stored text by hash."""
    try:
        data = request.get_json()
        if not data or 'text_hash' not in data:
            return jsonify({'error': 'text_hash is required'}), 400
        
        text_hash = data['text_hash']
        lang = data.get('language', 'en')
        speed = float(data.get('speed', 1.0))
        
        # Get stored text
        text = tts_manager.get_text_by_hash(text_hash)
        if not text:
            return jsonify({'error': 'Text not found for hash'}), 404
        
        # Generate audio
        audio_file = tts_manager.generate_audio(text, lang, speed)
        
        return jsonify({
            'success': True,
            'audio_id': text_hash,
            'audio_url': f"/tts/audio/{text_hash}?lang={lang}&speed={speed}",
            'download_url': f"/tts/download/{text_hash}?lang={lang}&speed={speed}",
            'language': lang,
            'speed': speed
        })
        
    except Exception as e:
        logger.error(f"❌ TTS generation error: {e}")
        return jsonify({'error': f'TTS generation failed: {str(e)}'}), 500

@app.route('/tts/audio/<audio_id>', methods=['GET'])
def stream_tts_audio(audio_id):
    """Stream TTS audio file."""
    try:
        lang = request.args.get('lang', 'en')
        speed = request.args.get('speed', '1.0')
        
        # Find the audio file
        audio_file = os.path.join(AUDIO_CACHE_DIR, f"{audio_id}_{lang}_{speed}.mp3")
        
        if not os.path.exists(audio_file):
            # Try to generate the audio if text exists
            text = tts_manager.get_text_by_hash(audio_id)
            if text:
                logger.info(f"🎙️ Generating missing audio for {audio_id}")
                audio_file = tts_manager.generate_audio(text, lang, float(speed))
            else:
                return jsonify({'error': 'Audio file not found and no text available'}), 404
        
        return send_file(
            audio_file,
            mimetype='audio/mpeg',
            as_attachment=False,
            download_name=f"apod_narration_{audio_id}.mp3"
        )
        
    except Exception as e:
        logger.error(f"❌ Audio streaming error: {e}")
        return jsonify({'error': f'Audio streaming failed: {str(e)}'}), 500

@app.route('/tts/download/<audio_id>', methods=['GET'])
def download_tts_audio(audio_id):
    """Download TTS audio file."""
    try:
        lang = request.args.get('lang', 'en')
        speed = request.args.get('speed', '1.0')
        
        audio_file = os.path.join(AUDIO_CACHE_DIR, f"{audio_id}_{lang}_{speed}.mp3")
        
        if not os.path.exists(audio_file):
            # Try to generate the audio if text exists
            text = tts_manager.get_text_by_hash(audio_id)
            if text:
                audio_file = tts_manager.generate_audio(text, lang, float(speed))
            else:
                return jsonify({'error': 'Audio file not found'}), 404
        
        return send_file(
            audio_file,
            mimetype='audio/mpeg',
            as_attachment=True,
            download_name=f"APOD_Narration_{datetime.now().strftime('%Y%m%d')}.mp3"
        )
        
    except Exception as e:
        logger.error(f"❌ Audio download error: {e}")
        return jsonify({'error': f'Audio download failed: {str(e)}'}), 500

@app.route('/tts/languages', methods=['GET'])
def get_tts_languages():
    """Get supported TTS languages."""
    return jsonify({
        'supported_languages': tts_manager.get_supported_languages(),
        'default_language': 'en',
        'total_languages': len(tts_manager.get_supported_languages())
    })

@app.route('/tts/status', methods=['GET'])
def get_tts_status():
    """Get TTS system status."""
    try:
        cached_files = len([f for f in os.listdir(AUDIO_CACHE_DIR) if f.endswith('.mp3')])
        cache_size = sum(os.path.getsize(os.path.join(AUDIO_CACHE_DIR, f)) 
                        for f in os.listdir(AUDIO_CACHE_DIR) if f.endswith('.mp3'))
        
        return jsonify({
            'tts_available': True,
            'cache_info': {
                'cached_files': cached_files,
                'cache_size_mb': round(cache_size / (1024 * 1024), 2),
                'stored_texts': len(tts_manager.text_storage)
            },
            'supported_languages': len(tts_manager.get_supported_languages())
        })
        
    except Exception as e:
        return jsonify({'tts_available': False, 'error': str(e)}), 500

# ===============================
# UTILITY ENDPOINTS
# ===============================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    try:
        test_response = requests.get(f"https://api.nasa.gov/planetary/apod?api_key={NASA_API_KEY}&date=2023-01-01", timeout=5)
        nasa_status = 'connected' if test_response.status_code == 200 else 'error'
    except:
        nasa_status = 'error'
    
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'services': {
            'nasa_api': nasa_status,
            'tts_system': 'available',
            'audio_cache': 'available'
        },
        'api_key_status': 'valid' if NASA_API_KEY != 'DEMO_KEY' else 'demo'
    })

@app.route('/', methods=['GET'])
def root():
    """Root endpoint."""
    return jsonify({
        'message': 'AETHERION Backend API v3.0',
        'endpoints': {
            'apod': '/apod',
            'random_apod': '/apod/random',
            'generate_tts': '/tts/generate',
            'generate_by_hash': '/tts/generate-by-hash',
            'tts_languages': '/tts/languages',
            'health': '/health'
        },
        'features': ['NASA APOD', 'Text-to-Speech', 'Multi-language support', 'Audio caching']
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    
    print("🚀 Starting AETHERION Backend v3.0...")
    print(f"📡 Port: {port}")
    print(f"🛰️  NASA API: {'✅ Set' if NASA_API_KEY != 'DEMO_KEY' else '⚠️  DEMO_KEY'}")
    print(f"🎙️  Audio Cache: {AUDIO_CACHE_DIR}")
    print("🔗 Endpoints:")
    print(f"   📡 APOD: http://localhost:{port}/apod")
    print(f"   🎙️  Generate TTS: http://localhost:{port}/tts/generate")
    print(f"   🗣️  Generate by Hash: http://localhost:{port}/tts/generate-by-hash")
    print(f"   🌍 Languages: http://localhost:{port}/tts/languages")
    print(f"   ❤️  Health: http://localhost:{port}/health")
    
    app.run(host='0.0.0.0', port=port, debug=True)