from apod import get_apod_data
import json

data = get_apod_data()
print(json.dumps(data, indent=4))
