from flask import Flask, jsonify, send_file, request
from flask_cors import CORS
import requests
from gtts import gTTS
import os
import re
import tempfile
import logging
from datetime import datetime, timedelta
from functools import lru_cache
from dotenv import load_dotenv
import hashlib

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
NASA_API_KEY = os.getenv("NASA_API_KEY", "DEMO_KEY")
CACHE_DURATION = timedelta(hours=1)
AUDIO_CACHE_DURATION = timedelta(hours=6)

# Simple in-memory cache
apod_cache = {
    'data': None,
    'timestamp': None,
    'audio_cache': {}
}

def clean_text_for_speech(text):
    """
    Clean and optimize text for better text-to-speech output with improved pronunciation.
    """
    if not text:
        return "No description available."
    
    # Remove unwanted patterns
    cleaned_text = text
    
    # Remove APOD anniversary announcements
    cleaned_text = re.sub(r'APOD\s+Turns?\s+\d+!?[:\s]*', '', cleaned_text, flags=re.IGNORECASE)
    
    # Remove lecture announcements
    cleaned_text = re.sub(r'Free\s+Public\s+Lecture.*?(?:\d{1,2}\s*(?:am|pm)|\d{4})', '', cleaned_text, flags=re.IGNORECASE)
    
    # Remove event announcements with dates
    cleaned_text = re.sub(r'(?:on\s+)?(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+[A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)', '', cleaned_text, flags=re.IGNORECASE)
    
    # Remove standalone dates
    cleaned_text = re.sub(r'(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)', '', cleaned_text, flags=re.IGNORECASE)
    
    # Remove city names in event contexts
    cleaned_text = re.sub(r'\bin\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+on\s+', '', cleaned_text, flags=re.IGNORECASE)
    
    # Enhanced pronunciation fixes for more natural speech
    pronunciation_fixes = {
        # Astronomical catalogs - more natural pronunciation
        r'\bNGC\s*(\d+)': r'N G C \1',
        r'\bIC\s*(\d+)': r'I C \1', 
        r'\bHD\s*(\d+)': r'H D \1',
        r'\bHR\s*(\d+)': r'H R \1',
        r'\bGJ\s*(\d+)': r'G J \1',
        
        # Messier objects - proper pronunciation
        r'\bM\s*(\d+)': r'Messier \1',
        
        # Units - more conversational
        r'\bkm/s\b': 'kilometers per second',
        r'\bkm\b': 'kilometers',
        r'\bAU\b': 'astronomical units',
        r'\bly\b': 'light years',
        r'\bμm\b': 'micrometers',
        r'\bnm\b': 'nanometers',
        r'\barcsec\b': 'arc seconds',
        r'\barcmin\b': 'arc minutes',
        r'\bmag\b': 'magnitude',
        
        # Scientific terms - clearer pronunciation
        r'\bH-alpha\b': 'H alpha',
        r'\bH\s*α\b': 'H alpha',
        r'\bHα\b': 'H alpha',
        r'\bCa\s*II\b': 'calcium two',
        r'\bO\s*III\b': 'oxygen three',
        r'\bH\s*II\b': 'H two',
        
        # Common astronomical terms
        r'\bRA\b': 'right ascension',
        r'\bDec\b': 'declination',
        r'\bUTC\b': 'coordinated universal time',
        r'\bGMT\b': 'Greenwich mean time',
        
        # Coordinates - more natural
        r'(\d+)°': r'\1 degrees',
        r'(\d+)\'': r'\1 arc minutes',
        r'(\d+)\"': r'\1 arc seconds',
        
        # Common abbreviations
        r'\betc\.\b': 'and so on',
        r'\be\.g\.\b': 'for example',
        r'\bi\.e\.\b': 'that is',
        r'\bvs\.\b': 'versus',
        
        # Technical measurements - clearer pronunciation
        r'(\d+)\s*x\s*(\d+)': r'\1 by \2',
        r'(\d+)-(\d+)': r'\1 to \2',
    }
    
    # Apply pronunciation fixes
    for pattern, replacement in pronunciation_fixes.items():
        cleaned_text = re.sub(pattern, replacement, cleaned_text, flags=re.IGNORECASE)
    
    # Add natural pauses for better speech flow
    # Add pauses after sentences
    cleaned_text = re.sub(r'([.!?])\s*([A-Z])', r'\1 \2', cleaned_text)
    
    # Add slight pauses after commas for better flow
    cleaned_text = re.sub(r',\s*', ', ', cleaned_text)
    
    # Ensure numbers are pronounced naturally
    cleaned_text = re.sub(r'\b(\d{4})\b', lambda m: f"{m.group(1)[:2]} {m.group(1)[2:]}" if len(m.group(1)) == 4 else m.group(1), cleaned_text)
    
    # Clean up extra whitespace
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text).strip()
    
    # Remove leading/trailing punctuation
    cleaned_text = re.sub(r'^[:\s,.-]+|[:\s,.-]+$', '', cleaned_text)
    
    # Ensure we have reasonable content
    if len(cleaned_text) < 50 and len(text) > 100:
        return text  # Return original if cleaning made it too short
    
    return cleaned_text if cleaned_text else "No description available."

def is_cache_valid(timestamp, duration):
    """Check if cache is still valid."""
    if timestamp is None:
        return False
    return datetime.now() - timestamp < duration

@lru_cache(maxsize=128)
def fetch_nasa_apod(date=None):
    """
    Fetch APOD data from NASA API with caching.
    """
    try:
        url = f"https://api.nasa.gov/planetary/apod?api_key={NASA_API_KEY}"
        if date:
            url += f"&date={date}"
        
        logger.info(f"Fetching APOD data from NASA API: {url}")
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        logger.info("Successfully fetched APOD data")
        return data
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching APOD data: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise

@app.route('/apod', methods=['GET'])
def get_apod():
    """
    Fetch the NASA Astronomy Picture of the Day (APOD) data with caching.
    """
    try:
        # Check if cached data is still valid
        if (apod_cache['data'] and 
            is_cache_valid(apod_cache['timestamp'], CACHE_DURATION)):
            logger.info("Returning cached APOD data")
            return jsonify(apod_cache['data'])
        
        # Get date parameter if provided
        date = request.args.get('date')
        
        # Fetch fresh data
        data = fetch_nasa_apod(date)
        
        # Process and structure the response
        response_data = {
            'title': data.get('title', 'Unknown Title'),
            'url': data.get('url', ''),
            'hdurl': data.get('hdurl', data.get('url', '')),
            'explanation': data.get('explanation', 'No explanation available.'),
            'date': data.get('date', datetime.now().strftime('%Y-%m-%d')),
            'media_type': data.get('media_type', 'image'),
            'copyright': data.get('copyright'),
            'service_version': data.get('service_version', 'v1')
        }
        
        # Clean explanation for better display
        if response_data['explanation']:
            response_data['explanation'] = clean_text_for_speech(response_data['explanation'])
        
        # Cache the data
        apod_cache['data'] = response_data
        apod_cache['timestamp'] = datetime.now()
        
        logger.info("Successfully processed and cached APOD data")
        return jsonify(response_data)
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error: {e}")
        return jsonify({
            'error': 'Failed to fetch data from NASA API',
            'message': str(e)
        }), 503
        
    except Exception as e:
        logger.error(f"Server error: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/narrate', methods=['GET'])
def narrate_apod():
    """
    Generate enhanced voice narration for APOD explanation with improved human-like speech.
    """
    try:
        # Get parameters
        date = request.args.get('date')
        voice_speed = request.args.get('speed', 'normal')  # slow, normal, fast
        lang = request.args.get('lang', 'en')
        
        # Fetch APOD data
        data = fetch_nasa_apod(date)
        explanation = data.get('explanation', 'No explanation available today.')
        title = data.get('title', 'Unknown Title')
        
        # Clean text for speech
        clean_explanation = clean_text_for_speech(explanation)
        
        # Create more natural narration with better introduction
        narration_text = f"Welcome to today's Astronomy Picture of the Day. "
        narration_text += f"Today we're exploring: {title}. "
        narration_text += f"Here's what makes this cosmic wonder special. "
        narration_text += clean_explanation
        
        # Create cache key
        cache_key = hashlib.md5(f"{narration_text}_{voice_speed}_{lang}".encode()).hexdigest()
        
        # Check audio cache
        audio_cache = apod_cache.get('audio_cache', {})
        if (cache_key in audio_cache and 
            is_cache_valid(audio_cache[cache_key]['timestamp'], AUDIO_CACHE_DURATION)):
            logger.info("Returning cached audio file")
            return send_file(
                audio_cache[cache_key]['path'], 
                mimetype="audio/mpeg",
                as_attachment=True,
                download_name=f"apod_narration_{data.get('date', 'today')}.mp3"
            )
        
        # Generate new audio with enhanced settings
        logger.info("Generating new enhanced TTS audio")
        
        # Improved TTS settings for more human-like voice
        tts_slow = voice_speed == 'slow'
        
        # Use different TLD for more natural voice (try different accents)
        tld_options = {
            'en': 'co.uk',  # British accent often sounds more natural
            'es': 'com.mx',
            'fr': 'fr',
            'de': 'de',
            'it': 'it',
            'pt': 'com.br'
        }
        
        tld = tld_options.get(lang[:2], 'com')
        
        # Generate speech with enhanced parameters
        tts = gTTS(
            text=narration_text, 
            lang=lang, 
            slow=tts_slow,
            tld=tld  # Use regional TLD for better pronunciation
        )
        
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(
            delete=False, 
            suffix='.mp3',
            prefix='apod_narration_'
        )
        
        # Save audio to temporary file
        tts.save(temp_file.name)
        
        # Cache the audio file info
        if 'audio_cache' not in apod_cache:
            apod_cache['audio_cache'] = {}
            
        apod_cache['audio_cache'][cache_key] = {
            'path': temp_file.name,
            'timestamp': datetime.now()
        }
        
        # Clean up old cache files (keep only last 5)
        if len(apod_cache['audio_cache']) > 5:
            oldest_key = min(
                apod_cache['audio_cache'].keys(),
                key=lambda k: apod_cache['audio_cache'][k]['timestamp']
            )
            old_file = apod_cache['audio_cache'][oldest_key]['path']
            try:
                os.unlink(old_file)
            except OSError:
                pass
            del apod_cache['audio_cache'][oldest_key]
        
        logger.info("Successfully generated enhanced TTS audio")
        
        return send_file(
            temp_file.name, 
            mimetype="audio/mpeg",
            as_attachment=True,
            download_name=f"apod_narration_{data.get('date', 'today')}.mp3"
        )
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error in narration: {e}")
        return jsonify({
            'error': 'Failed to fetch APOD data for narration',
            'message': str(e)
        }), 503
        
    except Exception as e:
        logger.error(f"Error generating narration: {e}")
        return jsonify({
            'error': 'Failed to generate voice narration',
            'message': str(e)
        }), 500

@app.route('/narrate/text', methods=['POST'])
def narrate_custom_text():
    """
    Generate enhanced voice narration for custom text.
    """
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400
        
        text = data.get('text', '')
        lang = data.get('lang', 'en')
        speed = data.get('speed', 'normal')
        
        if not text.strip():
            return jsonify({'error': 'Text cannot be empty'}), 400
        
        # Limit text length
        if len(text) > 5000:
            text = text[:5000] + "... Text truncated for performance."
        
        # Clean text
        clean_text = clean_text_for_speech(text)
        
        # Generate cache key
        cache_key = hashlib.md5(f"{clean_text}_{speed}_{lang}".encode()).hexdigest()
        
        # Check cache
        audio_cache = apod_cache.get('audio_cache', {})
        if (cache_key in audio_cache and 
            is_cache_valid(audio_cache[cache_key]['timestamp'], AUDIO_CACHE_DURATION)):
            return send_file(
                audio_cache[cache_key]['path'], 
                mimetype="audio/mpeg",
                as_attachment=True,
                download_name="custom_narration.mp3"
            )
        
        # Enhanced TTS settings
        tld_options = {
            'en': 'co.uk',
            'es': 'com.mx',
            'fr': 'fr',
            'de': 'de',
            'it': 'it',
            'pt': 'com.br'
        }
        
        tld = tld_options.get(lang[:2], 'com')
        
        # Generate TTS
        tts = gTTS(
            text=clean_text, 
            lang=lang, 
            slow=(speed == 'slow'),
            tld=tld
        )
        
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(
            delete=False, 
            suffix='.mp3',
            prefix='custom_narration_'
        )
        
        tts.save(temp_file.name)
        
        # Cache the result
        if 'audio_cache' not in apod_cache:
            apod_cache['audio_cache'] = {}
            
        apod_cache['audio_cache'][cache_key] = {
            'path': temp_file.name,
            'timestamp': datetime.now()
        }
        
        return send_file(
            temp_file.name, 
            mimetype="audio/mpeg",
            as_attachment=True,
            download_name="custom_narration.mp3"
        )
        
    except Exception as e:
        logger.error(f"Error in custom narration: {e}")
        return jsonify({
            'error': 'Failed to generate custom narration',
            'message': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'cache_status': {
            'apod_cached': apod_cache['data'] is not None,
            'audio_cache_size': len(apod_cache.get('audio_cache', {}))
        }
    })

@app.route('/cache/clear', methods=['POST'])
def clear_cache():
    """Clear all caches (for development/debugging)."""
    try:
        # Clear audio cache files
        audio_cache = apod_cache.get('audio_cache', {})
        for cache_info in audio_cache.values():
            try:
                os.unlink(cache_info['path'])
            except OSError:
                pass
        
        # Reset cache
        apod_cache['data'] = None
        apod_cache['timestamp'] = None
        apod_cache['audio_cache'] = {}
        
        # Clear LRU cache
        fetch_nasa_apod.cache_clear()
        
        logger.info("Cache cleared successfully")
        return jsonify({'message': 'Cache cleared successfully'})
        
    except Exception as e:
        logger.error(f"Error clearing cache: {e}")
        return jsonify({'error': 'Failed to clear cache'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    logger.info("Starting Aetherion Backend Server...")
    app.run(debug=True, host='0.0.0.0', port=5000)