# apod_test.py
import requests
from dotenv import load_dotenv
import os
from PIL import Image
from io import BytesIO

# Load your API key from .env
load_dotenv()
API_KEY = os.getenv("NASA_API_KEY")

# Call the NASA APOD API
url = f"https://api.nasa.gov/planetary/apod?api_key={API_KEY}"
response = requests.get(url).json()

# Print basic info
print("📅 Date:", response["date"])
print("🖼 Title:", response["title"])
print("📝 Explanation:", response["explanation"])
print("🔗 URL:", response["url"])

# Display image
if response["media_type"] == "image":
    img_data = requests.get(response["url"]).content
    img = Image.open(BytesIO(img_data))
    img.show()
else:
    print("🎥 This is a video. Open in browser:", response["url"])
    print("somnath")
