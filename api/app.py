from flask import Flask
import requests
from urllib.parse import urlencode
import json

app = Flask(__name__)

DEFAULT_BASE_URL = "http://forecaster:8080/%s"


@app.route("/")
def index():
  return """
  <h1>Python Flask in Docker!</h1>
  <p>A sample web-app for running Flask inside Docker.</p>
  """


@app.route('/api/predict')
def score_text(text, url = None):
    url = (url or (DEFAULT_BASE_URL % "predict"))
    if type(text) == str:
        text = [text]
    payload = urlencode({"json_args" : json.dumps(text)})
    headers = {'content-type': 'application/x-www-form-urlencoded'}
    response = requests.request("POST", url, data=payload, headers=headers)
    return json.loads(response.text)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')
