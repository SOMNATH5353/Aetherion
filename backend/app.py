from flask import Flask, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

NASA_API_KEY = os.getenv("NASA_API_KEY")  # Make sure this is set in your .env

@app.route('/apod', methods=['GET'])
def get_apod():
    try:
        # Check if API key exists
        if not NASA_API_KEY:
            return jsonify({"error": "NASA API key not found"}), 500
            
        url = f"https://api.nasa.gov/planetary/apod?api_key={NASA_API_KEY}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()  # Raise error if request failed
        
        data = response.json()
        
        # Ensure all required fields are present
        apod_data = {
            "title": data.get("title", "Astronomy Picture of the Day"),
            "explanation": data.get("explanation", "No description available"),
            "url": data.get("url", ""),
            "hdurl": data.get("hdurl", data.get("url", "")),
            "date": data.get("date", datetime.now().strftime("%Y-%m-%d")),
            "media_type": data.get("media_type", "image"),
            "copyright": data.get("copyright", None),
            "service_version": data.get("service_version", "v1")
        }
        
        return jsonify(apod_data)
        
    except requests.exceptions.Timeout:
        return jsonify({"error": "Request timeout - NASA API is slow"}), 500
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Connection error - Check your internet connection"}), 500
    except requests.exceptions.HTTPError as e:
        return jsonify({"error": f"NASA API error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

if __name__ == '__main__':
    print(f"NASA API Key loaded: {'Yes' if NASA_API_KEY else 'No'}")
    app.run(debug=True, host='0.0.0.0', port=5000)