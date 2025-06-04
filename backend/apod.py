import os
import requests
from dotenv import load_dotenv

load_dotenv()

def get_apod_data():
    api_key = os.getenv("NASA_API_KEY")
    url = f"https://api.nasa.gov/planetary/apod?api_key={api_key}"
    response = requests.get(url)
    return response.json()
