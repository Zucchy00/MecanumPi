import asyncio
import websockets
import json
import subprocess
from datetime import datetime, timedelta, timezone
import requests
import RPi.GPIO as GPIO          
from time import sleep
import signal
import sys

GPIO.setmode(GPIO.BCM)
class motor:

        def __init__(self, in1, in2, en, speed):
                self.in1 = in1
                self.in2 = in2
                self.en = en
                self.speed = speed
                GPIO.setup(self.in1,GPIO.OUT)
                GPIO.setup(self.in2,GPIO.OUT)
                GPIO.setup(self.en,GPIO.OUT)
                GPIO.output(self.in1,GPIO.LOW)
                GPIO.output(self.in1,GPIO.LOW)
                self.p=GPIO.PWM(self.en,1000)
                self.p.start(0)

        def change_speed(self, speed):
                self.speed = int(speed)
                if self.speed < 0:
                        backward(self.in1, self.in2)
                        self.speed = -self.speed
                else:
                        forward(self.in1, self.in2)
                if self.speed < 0 or self.speed > 100:
                        self.speed = 0
                if self.speed < 20:
                        self.speed = 0
                self.p.ChangeDutyCycle(self.speed)
                return 

def forward(in1 , in2):
        GPIO.output(in1,GPIO.HIGH)
        GPIO.output(in2,GPIO.LOW)

def backward(in1, in2):
        GPIO.output(in1,GPIO.LOW)
        GPIO.output(in2,GPIO.HIGH)

def cleanup_gpio(signal, frame):
    print("Cleaning up GPIO...")
    GPIO.cleanup()
    print("GPIO cleanup complete.")
    exit(0)


signal.signal(signal.SIGINT, cleanup_gpio)
signal.signal(signal.SIGTERM, cleanup_gpio)
Bl = motor(24, 25, 23, 0)
Br = motor(27, 22, 17, 0)
Fl = motor(20, 16, 21, 0)
Fr = motor(6, 5, 26, 0)

# Dictionary to store connected clients
connected_clients = {}

FrSpeed = 0.000
FlSpeed = 0.000
BrSpeed = 0.000
BlSpeed = 0.000


def update_day_hours_json():
    global FrSpeed, FlSpeed, BrSpeed, BlSpeed  # Declare variables as global within the function
    current_date = datetime.now().strftime('%Y-%m-%d')
    hours_moving = 0.0
    hours_standby = 0.0
    
    # Calculate hoursMoving and hoursStandby based on the values of Fr, Fl, Br, and Bl
    if FrSpeed != 0 or FlSpeed != 0 or BrSpeed != 0 or BlSpeed != 0:
        hours_moving = 1 / 60 / 60  # Convert one second to hours
    else:
        hours_standby = 1 / 60 / 60

    try:
        with open('DayHours.json', 'r') as file:
            file_content = file.read()
            if file_content:
                data = json.loads(file_content)
            else:
                data = {}
            if current_date in data:
                # Check if the value retrieved is a dictionary or a float
                if isinstance(data[current_date], dict):
                    hours_moving += data[current_date].get('hoursMoving', 0)
                    hours_standby += data[current_date].get('hoursStandby', 0)
                else:
                    # Initialize a new dictionary with the existing value as a float
                    hours_moving += data[current_date]
            data[current_date] = {'hoursMoving': hours_moving, 'hoursStandby': hours_standby}

            if len(data) > 7:
                oldest_date = min(data.keys(), key=lambda x: datetime.strptime(x, '%Y-%m-%d'))
                del data[oldest_date]
    except FileNotFoundError:
        data = {current_date: {'hoursMoving': hours_moving, 'hoursStandby': hours_standby}}

    with open('DayHours.json', 'w') as file:
        json.dump(data, file)

async def check_and_update():
    while True:
        update_day_hours_json()
        await asyncio.sleep(1)

def UserControl(input_hash, ip):
    if ip == '127.0.0.1': 
        return True
    try:
        response = requests.get('http://localhost:3000/controlPermission', cookies={'hash': input_hash, 'websocket': 'yes'})
        response.raise_for_status()  # Raise an exception for 4xx or 5xx status codes
        return response.json().get('control')
        # Assuming checkPermission() is a function to handle the permission response
        # You can call it here or handle the permission response as needed
        # setTimeout(()=>{checkPermission()},5000) in JavaScript is equivalent to waiting for 5 seconds in Python
    except requests.exceptions.RequestException as e:
        # Handle exceptions such as network errors or invalid responses
        print("Error:", e)
        return False
    return False

def UserLogin(input_hash, ip):
    if ip == '127.0.0.1': 
        return True
    try:
        response = requests.get('http://localhost:3000/status', cookies={'hash': input_hash, 'websocket': 'yes'})
        response.raise_for_status()  # Raise an exception for 4xx or 5xx status codes
        return response.json().get('loggedIn')
        # Assuming checkPermission() is a function to handle the permission response
        # You can call it here or handle the permission response as needed
        # setTimeout(()=>{checkPermission()},5000) in JavaScript is equivalent to waiting for 5 seconds in Python
    except requests.exceptions.RequestException as e:
        # Handle exceptions such as network errors or invalid responses
        print("Error:", e)
        return False
    return False

def get_wifi_signal_strength(interface='wlan0'):
    try:
        result = subprocess.run(['iwconfig', interface], capture_output=True, text=True, check=True)
        output_lines = result.stdout.split('\n')
        for line in output_lines:
            if 'Signal level' in line:
                signal_level_part = line.split('Signal level=')[1]
                # Check if the signal level is in percentage
                if '/' in signal_level_part:
                    signal_percentage = int(signal_level_part.split('/')[0].strip())
                    # Convert the percentage to dBm
                    signal_level_dbm = -100 + (signal_percentage * 100) / 100
                    print(signal_level_dbm)
                    return signal_level_dbm
                elif 'dBm' in signal_level_part:
                    signal_level_dbm = int(signal_level_part.split('dBm')[0].strip())
                    print(signal_level_dbm)
                    return signal_level_dbm
                else:
                    print('dBm not present')
                    return None
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
    except ValueError as e:
        print(f"Parsing Error: {e}")
    return None

async def handle_connection(websocket, path):
    print(f"Client connected from {websocket.remote_address}")
    client_ip = websocket.remote_address[0]
    connected_clients[client_ip] = websocket
    try:
        while True:
            message = await websocket.recv()
            try:
                data = json.loads(message)
                # Check if the JSON contains specific keys
                if 'hash' in data:
                    if UserLogin(data["hash"], websocket.remote_address[0]):
                        if 'Fl' in data and 'Fr' in data and 'Bl' in data and 'Br' in data and UserControl(data["hash"], websocket.remote_address[0]):
                            # Print the values if keys are present
                            global FlSpeed, FrSpeed, BrSpeed, BlSpeed
                            if 'Fl' in data and data['Fl'] is not None:
                                FlSpeed = int(data['Fl']*100)
                            if 'Bl' in data and data['Bl'] is not None:
                                BlSpeed = int(data['Bl']*100)
                            if 'Fr' in data and data['Fr'] is not None:
                                FrSpeed = int(data['Fr']*100)
                            if 'Br' in data and data['Br'] is not None:
                                BrSpeed = int(data['Br']*100)
                            print(f"FL: {FlSpeed}, FR: {FrSpeed}, BL: {BlSpeed}, BR: {BrSpeed}")
                            Bl.change_speed(BlSpeed)
                            Br.change_speed(BrSpeed)
                            Fl.change_speed(FlSpeed)
                            Fr.change_speed(FrSpeed)
                            motorSpeed = {'Fl': data['Fl'], 'Fr': data['Fr'], 'Bl': data['Bl'], 'Br': data['Br'],}
                            if '127.0.0.1' in connected_clients and websocket.remote_address[0] != '127.0.0.1':
                                await connected_clients['127.0.0.1'].send(json.dumps(motorSpeed))
                                print("Sent to localhost")
                        elif 'request' in data and data['request'] == 'wifi_signal':
                            # If the client requests wifi signal, send the signal strength
                            wifi_signal_strength = get_wifi_signal_strength('wlan1')
                            if wifi_signal_strength is not None:
                                response = {'wifi': wifi_signal_strength}
                                await websocket.send(json.dumps(response))
                            else:
                                wifi_signal_strength = get_wifi_signal_strength('wlan0')
                                if wifi_signal_strength is not None:
                                    response = {'wifi': wifi_signal_strength}
                                    await websocket.send(json.dumps(response))
                                else:
                                    await websocket.send(json.dumps({'error': 'Failed to fetch WiFi signal strength'}))
                        else:
                            print("User has no control or invalid request")
                    else:
                        print("User not exist or not autorized")
                        await websocket.close()
                else:
                    print("Hash not present")
                    await websocket.close()
            except json.JSONDecodeError:
                print("Invalid JSON format in received message")
                await websocket.close()

    except websockets.exceptions.ConnectionClosedError:
        print("Connection closed")

start_server = websockets.serve(handle_connection, "0.0.0.0", 2604)
asyncio.get_event_loop().create_task(check_and_update())
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
