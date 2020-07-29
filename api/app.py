from flask import Flask
import requests
from urllib.parse import urlencode
import json

app = Flask(__name__, static_folder='../build', static_url_path='/')

DEFAULT_BASE_URL = "http://forecaster:8080/%s"


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/api/predict')
def score_text(text, url = None):
    url = (url or (DEFAULT_BASE_URL % "predict"))
    if type(text) == str:
        text = [text]
    payload = urlencode({"json_args" : json.dumps(text)})
    headers = {'content-type': 'application/x-www-form-urlencoded'}
    response = requests.request("POST", url, data=payload, headers=headers)
    return json.loads(response.text)