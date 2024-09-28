from http.server import HTTPServer, BaseHTTPRequestHandler
import socketserver
import threading
import os
import logging
import io
import requests
from picamera2 import Picamera2
from picamera2.encoders import JpegEncoder
from picamera2.outputs import FileOutput
from libcamera import controls

import signal
import sys

def signal_handler(sig, frame):
    print('Gracefully shutting down...')
    # Perform your cleanup operations here
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

# Your script code here


def checkPath(input_hash, ip):
    if input_hash.startswith('/'):
        input_hash = input_hash[1:] 
    print(f"User from: {ip[0]} used Hash: {input_hash}")
    if ip[0] == '127.0.0.1':
        print("Localhost Login True") 
        return True
    if input_hash == "":
        return False
    try:
        response = requests.get('http://localhost:3000/status', cookies={'hash': input_hash, 'websocket': 'yes'})
        response.raise_for_status()  # Raise an exception for 4xx or 5xx status codes
        print(f"IP: {ip} Login {response.json().get('loggedIn')}")  
        return response.json().get('loggedIn')
        # Assuming checkPermission() is a function to handle the permission response
        # You can call it here or handle the permission response as needed
        # setTimeout(()=>{checkPermission()},5000) in JavaScript is equivalent to waiting for 5 seconds in Python
    except requests.exceptions.RequestException as e:
        # Handle exceptions such as network errors or invalid responses
        print("Error:", e)
        print(f"IP: {ip} Login False")  
        return False
    print(f"IP: {ip} Login False") 
    return False

class StreamingOutput(io.BufferedIOBase):
    def __init__(self):
        self.frame = None
        self.condition = threading.Condition()

    def write(self, buf):
        with self.condition:
            self.frame = buf
            self.condition.notify_all()

class StreamingHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Age', 0)
        self.send_header('Cache-Control', 'no-cache, private')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Content-Type', 'multipart/x-mixed-replace; boundary=FRAME')
        self.end_headers()
        if checkPath(self.path,self.client_address):
            try:
                while True:
                    with output.condition:
                        output.condition.wait()
                        frame = output.frame
                    self.wfile.write(b'--FRAME\r\n')
                    self.send_header('Content-Type', 'image/jpeg')
                    self.send_header('Content-Length', len(frame))
                    self.end_headers()
                    self.wfile.write(frame)
                    self.wfile.write(b'\r\n')
            except Exception as e:
                logging.warning('Removed streaming client %s: %s', self.client_address, str(e))

class StreamingServer(socketserver.ThreadingMixIn, HTTPServer):
    allow_reuse_address = True
    daemon_threads = True

picam2 = Picamera2()
os.system("v4l2-ctl --set-ctrl wide_dynamic_range=1 -d /dev/v4l-subdev0")
picam2.set_controls({"FrameRate": 60})
picam2.set_controls({"AfMode": controls.AfModeEnum.Continuous, "AfSpeed": controls.AfSpeedEnum.Fast})
picam2.configure(picam2.create_video_configuration(main={"size": (1280, 720)}))
output = StreamingOutput()
picam2.start_recording(JpegEncoder(), FileOutput(output))

try:
    address = ('', 1809)
    server = StreamingServer(address, StreamingHandler)
    server.serve_forever()
finally:
    picam2.stop_recording()

