#!/bin/bash

# Function to start all processes
start_services() {
    sudo npm run preview -- --host --port 80 &
    NODE_PID=$!
    echo "Started npm preview with PID $NODE_PID"

    node /server_mecanum/Svelte/MecaPiFlex/backend/server.js &
    NODE_SERVER_PID=$!
    echo "Started node server with PID $NODE_SERVER_PID"

    python /server_mecanum/Svelte/MecaPiFlex/backend/pythonServers/camera.py &
    CAMERA_PY_PID=$!
    echo "Started camera.py with PID $CAMERA_PY_PID"

    python /server_mecanum/Svelte/MecaPiFlex/backend/pythonServers/websocket.py &
    WEBSOCKET_PY_PID=$!
    echo "Started websocket.py with PID $WEBSOCKET_PY_PID"
}
# Function to gracefully shut down all processes
shutdown_services() {
    echo "Shutting down processes..."
    kill -SIGTERM $NODE_PID
    kill -SIGTERM $NODE_SERVER_PID
    kill -SIGTERM $CAMERA_PY_PID
    kill -SIGTERM $WEBSOCKET_PY_PID

    # Wait for all processes to exit gracefully
    wait $NODE_PID
    echo "npm preview process has shut down."
    wait $NODE_SERVER_PID
    echo "node server process has shut down."
    wait $CAMERA_PY_PID
    echo "camera.py process has shut down."
    wait $WEBSOCKET_PY_PID
    echo "websocket.py process has shut down."

    echo "All processes have been shut down."
}

# Trap SIGTERM and SIGINT signals to call the shutdown function
trap shutdown_services SIGTERM SIGINT

# Start services
start_services

# Wait for all background processes to finish
wait

# Exit the script
echo "Script exiting."
exit 0
