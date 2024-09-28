Repository created for educational purposes

## Sections
* ### [Problem](https://github.com/Zucchy00/MecanumPi?tab=readme-ov-file#problem-1)
* ### [Objective](https://github.com/Zucchy00/MecanumPi?tab=readme-ov-file#bbjective-1)
* ### [Features](https://github.com/Zucchy00/MecanumPi?tab=readme-ov-file#features-1)
* ### [WBS](https://github.com/Zucchy00/MecanumPi?tab=readme-ov-file#wbs-1)
* ### [Value Proposition](https://github.com/Zucchy00/MecanumPi?tab=readme-ov-file#value-proposition-1)
* ### [User Stories](https://github.com/Zucchy00/MecanumPi?tab=readme-ov-file#user-stories-1)
* ### [Multi Tenancy](https://github.com/Zucchy00/MecanumPi?tab=readme-ov-file#multi-tenancy-1)
* ### [How to Make Your Robot](https://github.com/Zucchy00/MecanumPi?tab=readme-ov-file#how-to-make-your-robot-1)

# Robot Project
# Problem
Allowing a machine to move in all directions has always been a challenge for humans.
# Objective
To create a robot that can move in all directions.
# Features
* ## Association
  ### Functional Requirements:
* ### Association via Code
Users can connect to a robot on their local network via a temporary code.
* ## Usage Requirements
  ### Functional Requirements:
* ### Local Control
Users can control the robot locally using a screen or by connecting a gamepad.
* ### Remote Control
Users can control the robot remotely through a computer or phone connected to the same network, with the gamepad connected to either the computer or phone.
  ### Non-Functional Requirements:
* ### Broad Compatibility:
The system must recognize a wide range of devices to facilitate the use of the robot.

# WBS
![Colorful Work Breakdown Structure](https://github.com/ZucchelliDaniele/Progetto_Robot/assets/101174771/f6201000-e07e-4f35-9d00-4ce9f19a9be0)

# Value Proposition
## Simplify your work with MecanumPi
### Precise and easy work
Simplify your tasks with MecanumPi, an automated robot with a web interface accessible from any device. Customize your tasks in the simplest way with precise and fast movements. Control your robot remotely in real time with 4 powered wheels that allow movement in all directions. Experience your work in real time with a high-quality wide-angle camera. Use your robot in the dark or in shadowy spaces with night vision.
### Features
* Omnidirectional System
* High-resolution wide-angle camera
* Night Vision
* Remote control from multiple devices
* Precise system with real-time data

# User Stories
## Generic User 
* As a generic user, I want to be able to connect to the robot via a code displayed on the screen.
## Saved/Connected User
* As a saved/connected user, I want to view the robot’s web interface and use it properly.
* As a saved/connected user, I want to connect and disconnect from other robots on the network.
## Local Control
* As a user connected via local control, I want to use my robot directly with input devices (gamepad, touchscreen) without the need for external devices (smartphone, PC, etc.).
## Remote Control
* As a user connected via remote control, I want to use my robot from a distance and have an experience as close as possible to local control. Input devices connected to the robot (gamepad, touchscreen) should be optional compared to external devices (smartphone or PC).
## Physical Space Visualization
* As a user connected via remote and/or local control, I want to see the physical space in front of the robot through a camera under any lighting condition (day or night).
## Object Transport
* As a local user, I want to be able to transport appropriate objects using devices attached to the robot or external devices.
## Staff
* As a “staff” user, I want to update and improve the code of produced robots by publishing new versions on this GitHub.

![Alt UML](https://yuml.me/diagram/usecase/[Visitor]-(Login),(Login)<(Contact%20Staff),[Visitor]-(Register),[Visitor]-(Buy%20Robot),(Buy%20Robot)>(Contact%20Staff),(Login)<(Reset%20Password),[Registered%20User]-(Add%20Robot),[Registered%20User]-(Remove%20Robot),(Add%20Robot)<(See%20Analytics),(Add%20Robot)<(Control%20Robot),[Registered%20User]-(Use%20Remote%20Connected%20Phone%20/%20PC),(Use%20Remote%20Connected%20Phone%20/%20PC)<(Use%20Gamepad),(Control%20Robot)<(Use%20Gamepad),[Office%20Staff]-(Add%20functionalities),)

# Multi Tenancy
## Login / Register
* The user must physically go to the robot to add their device using a unique and random code.
* Each device is automatically authenticated if it has already been registered.
* Each device is removed after 7 days of inactivity with the robot.
* With each use, the list of robot interactions is updated.
## Usage
* Each user has the ability to control the robot remotely, but if multiple users want to control the same robot, a request for control will be sent to the current user.
* Each user can view the robots available on the network and access them as described earlier.
* Each user can view the camera on the robot and visually track its usage.
* The user controlling the robot directly, rather than through another device, has primary control and can revoke control from other users.

# How to Make Your Robot
## Raspberry Pi Setup
* Take a micro SD card and install Raspberry Pi Bullseye (64bit).
* Insert it into your Raspberry Pi (model 4 recommended).
* Attach the Raspberry Pi to a touchscreen monitor (7-inch in my case).
* Install a webcam on the Raspberry Pi (I use the Raspberry Pi Camera Module 3 Noir-Wide).
* Connect the Raspberry Pi to a power bank (50W minimum recommended).
* Download this repository.
* Download the node modules.
* Start the web server (host mode recommended).
* Start the backend Node.js server.
* Start the Python WebSocket and camera servers.
* Preferably, create services to start the servers automatically.

## 3D Models
* ### [PowerBank](https://github.com/Zucchy00/MecanumPi/blob/main/Robot3DModels/PowerBank.stl)
* ### [PiCase](https://github.com/Zucchy00/MecanumPi/blob/main/Robot3DModels/PiCase.stl)
* ### Example:
  ![image](https://github.com/ZucchelliDaniele/Progetto_Robot/assets/101174771/76996312-f0ec-4c12-a43b-170aaf0a8d02)


# Start-server

## Install packages

for node `npm install` for python start them on your rpi with the camera connected and install the missing libraries.

## Node

Start node server in backend folder with `node filename.js`.

## Python

Start python servers in backend/pythonServers folder with `python3 filename.py`.

## Svelte

### Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

Use `-- --host --port 80` to host in all your private network.

