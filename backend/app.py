from flask import Flask, jsonify
from apod import get_apod_data

app = Flask(__name__)

@app.route('/api/apod', methods=['GET'])
def apod():
    data = get_apod_data()
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
# This file is part of the Astronomy Picture of the Day (APOD) web application.
# It defines the main Flask application and the API endpoint for fetching APOD data.