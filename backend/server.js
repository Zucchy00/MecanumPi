// ####################################
// ############# IMPORTS ##############
// ####################################

import express from 'express';
import bodyParser from 'body-parser';
import { randomBytes, createHash } from 'crypto';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import fs from 'fs';
import { createWriteStream } from 'fs';
import os from 'os';
import portscanner from 'portscanner';
import { exec } from 'child_process';


// ####################################
// ############# VARIABLES ############
// ####################################

process.on('SIGINT', () => {
  console.log('Gracefully shutting down...');
  // Perform your cleanup operations here
  process.exit();
});

const logFileStream = createWriteStream('/server_mecanum/Svelte/MecaPiFlex/backend/session_logs.txt', { flags: 'a' });

var controllingDeviceHash = ""
var updatedControl = false
var controlUpdateCheck
var controlRequestHash = ""
var controlRequestDeviceIp = ""
var controllingRequestTimes = new Map();
var controlRequestBanned = new Map();
let codeResetTimeout
let shutDownCode = ""
const dayHoursFilePath = '/server_mecanum/Svelte/MecaPiFlex/backend/pythonServers/DayHours.json'
// Get the local IP address and start scanning the local network
var localIP

const app = express();
const port = 3000;


const portToCheck = 2604; // Example: port 80 for HTTP

// File path to store session data
const sessionFilePath = 'sessions.json';

// Middleware to generate random hash
let currentHash = ""
let currentCode = ""

// ####################################
// ############# FUNCTION #############
// ####################################

// Function to log to console and file
function log(message){
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString('it-IT', {
    timeZone: 'Europe/Rome', // Adjust time zone for Italy
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  logFileStream.write(`${formattedDate}: ${message}\n`);
};

// Function to get the local IP address of the machine
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  const priorityInterfaces = ['wlan1', 'wlan0'];

  for (const interfaceName of priorityInterfaces) {
    if (interfaces[interfaceName]) {
      for (const iface of interfaces[interfaceName]) {
        if (!iface.internal && iface.family === 'IPv4') {
          return iface.address;
        }
      }
    }
  }

  // If neither wlan1 nor wlan0 are found, fallback to the first available external IPv4 address
  for (const interfaceName of Object.keys(interfaces)) {
    for (const iface of interfaces[interfaceName]) {
      if (!iface.internal && iface.family === 'IPv4') {
        return iface.address;
      }
    }
  }

  return null;
}

// Function to get the hostname of an IP address
async function getHostname(ip) {
  const dns = await import('dns').then(module => module.default || module);

  return new Promise((resolve, reject) => {
    dns.reverse(ip, (err, hostnames) => {
      if (err) {
        reject(err);
      } else {
        resolve(hostnames[0]); // Return the first hostname found
      }
    });
  });
}

async function scanLocalNetwork(localIP) {
  const parts = localIP.split('.');
  if (parts.length !== 4) {
    log("Invalid local IP address")
    console.log("Invalid local IP address")
    throw new Error('Invalid local IP address');
  }

  const baseIP = parts.slice(0, 3).join('.');
  const results = [];
  log("scanning for: "+baseIP+".X-50")
  for (let i = 1; i <= 50; i++) {
    const ip = `${baseIP}.${i}`;
    console.log("scanning: "+ip)
    try {
      const status = await portscanner.checkPortStatus(portToCheck, ip);
      if (status === 'open') {
        const hostname = await getHostname(ip);
        results.push({ ip, hostname, port: portToCheck });
      }
    } catch (error) {
      log(error)
      console.error(error);
    }
  }

  return results;
};

function CheckCode(hashedcode) {
  if(currentHash != "" && currentHash == hashedcode) {
    return true
  }
  return false
}

function generateHash() {
  const randomBytesString = randomBytes(3).toString('hex');
  let randomBytesMixedCase = ''; // Initialize the mixed-case string

  // Iterate through each character of the original string
  for (let i = 0; i < randomBytesString.length; i++) {
    // Randomly choose whether to convert the character to uppercase
    if (Math.random() < 0.5) {
      randomBytesMixedCase += randomBytesString[i].toUpperCase();
    } else {
      randomBytesMixedCase += randomBytesString[i];
    }
  }
  log(randomBytesMixedCase)
  console.log(randomBytesMixedCase);
  log(randomBytesMixedCase);
  currentCode = randomBytesMixedCase
  return createHash('sha256').update(currentCode).digest('hex');
}

function initiateShutdown(callback) {
  // Execute the shutdown command
  exec('sudo shutdown now', (err, stdout, stderr) => {
    callback(err, stdout, stderr);
  });
}

// Load session data from JSON file
function loadSessionData() {
  if (fs.existsSync(sessionFilePath)) {
    try {
      return JSON.parse(fs.readFileSync(sessionFilePath, 'utf-8'));
    } catch (error) {
      console.log('Error parsing session data');
      log('Error parsing session data');
      return [];
    }
  } else {
    return [];
  }
}

// Save session data to JSON file
function saveSessionData(sessionData) {
  fs.writeFileSync(sessionFilePath, JSON.stringify(sessionData, null, 2));
}

function login(hash, ip, log = true) {
  let sessionData = loadSessionData();

  // Check if any of the stored hashes match the hash in the cookie
  return sessionData.some(data => {
    if (data.hash === hash) {
      const createdAt = new Date(data.createdAt);
      const currentDate = new Date();
      const daysDifference = Math.ceil((currentDate - createdAt) / (1000 * 60 * 60 * 24));

      if (daysDifference < 7) {
        // If the hashed code was created less than 7 days ago, update the creation date
        data.createdAt = currentDate.toISOString();
        saveSessionData(sessionData);
        if(ip != "::1" && log) {
          console.log("Hash "+data.hash+" Updated"+" required from: "+ip)
          log("Hash "+data.hash+" Updated"+" required from: "+ip)
        }
        return true;
      } else {
        // If the hashed code is older than 7 days, remove it
        sessionData = sessionData.filter(data => data.hash !== hash);

        // Write the updated session data to the JSON file
        saveSessionData(sessionData);
        console.log("Hash "+data.hash+" Eliminated"+" required from: "+ip)
        log("Hash "+data.hash+" Eliminated"+" required from: "+ip)
        return false;
      }
    }
  });
}

// ####################################
// ############# APP ##################
// ####################################

app.use(bodyParser.json());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // Allow requests from all origins while also allowing credentials
    callback(null, true);
  },
  credentials: true
}));

app.use(cookieParser());

// Pair endpoint to generate hash and store in session and json file
app.post('/pair', (req, res) => {
  if (CheckCode(req.body.hashedcode)) {
    clearTimeout(codeResetTimeout);
    const hash = currentHash; // Use the current hash
    const currentDate = new Date().toISOString();
    const sessionData = loadSessionData();

    // Add the new hash object to the session data
    sessionData.push({ hash, createdAt: currentDate });

    // Write the updated session data to the JSON file
    saveSessionData(sessionData);

    currentCode = "";
    currentHash = "";
    console.log("Host connected"+" required from: "+req.ip)
    console.log("Hash"+hash+" required from: "+req.ip)
    log("Host connected"+" required from: "+req.ip)
    log("Hash"+hash+" required from: "+req.ip)
    res.json({ hash });
  }
});

// Status endpoint to check login status
app.get('/status', (req, res) => {
  let isLoggedIn = login(String(req.cookies.hash), String(req.ip), false);
  if ((req.ip === '::ffff:127.0.0.1' || req.ip === '::1') && req.cookies.websocket != "yes") {
    isLoggedIn = true
  }
  if(req.ip != "::1") {
    log("Login is "+isLoggedIn+" required from: "+req.ip)
    console.log("Login is "+isLoggedIn+" required from: "+req.ip)
  }
  res.json({ loggedIn: isLoggedIn });
});

// Status endpoint to create the login code and reset it after 60 seconds
app.get('/code', (req, res) => {
  if (req.ip === '::ffff:127.0.0.1' || req.ip === '::1') {

    let exist = false;
    do{
      let sessionData = loadSessionData();
      currentHash = generateHash();
      // Check if any of the stored hashes match with the created hash
      exist = sessionData.some(data => {
        if (data.hash === currentHash) {
          const createdAt = new Date(data.createdAt);
          const currentDate = new Date();
          const daysDifference = Math.ceil((currentDate - createdAt) / (1000 * 60 * 60 * 24));

          if (daysDifference < 7) {
            // If the hashed code was created less than 7 days ago, update the creation date
            data.createdAt = currentDate.toISOString();
            saveSessionData(sessionData);
            console.log("Hash "+data.hash+" Updated"+" required from: "+req.ip)
            log("Hash "+data.hash+" Updated"+" required from: "+req.ip)
            return true;
          } else {
            // If the hashed code is older than 7 days, remove it
            sessionData = sessionData.filter(data => data.hash !== currentHash);
            console.log("Hash "+data.hash+" Eliminated"+" required from: "+req.ip)
            log("Hash "+data.hash+" Eliminated"+" required from: "+req.ip)
            // Write the updated session data to the JSON file
            saveSessionData(sessionData);
            return false;
          }
        }
  });
    }while(exist)
    console.log("code "+currentCode+" retrieved"+" required from: "+req.ip)
    log("code "+currentCode+" retrieved"+" required from: "+req.ip)
    res.json({ code: currentCode });

    // Clear any existing timeout
    clearTimeout(codeResetTimeout);

    // Reset the code after 31 seconds
    codeResetTimeout = setTimeout(() => {
      currentCode = '';
      currentHash = '';
      console.log('Code reset'+" required from: "+req.ip);
      log('Code reset'+" required from: "+req.ip);
    }, 31000); // 31 seconds in milliseconds
  }
  else {
    console.log("Not Allowed to get code"+" required from: "+req.ip)
    log("Not Allowed to get code"+" required from: "+req.ip)
    res.json({ error: "Not Allowed" });
  }

});

app.get('/controlPermission', (req, res)=> {
  let isLoggedIn = login(String(req.cookies.hash), String(req.ip), false)
  let permission = false
  let isLocalHost = false
  if (req.ip === '::ffff:127.0.0.1' || req.ip === '::1') isLocalHost = true
  // Check if any of the stored hashes match the hash in the cookie
  if (isLocalHost) isLoggedIn = true
  if(isLoggedIn) {
    if(controllingDeviceHash == "" && (!isLocalHost || req.cookies.websocket == "yes")) {
      controllingDeviceHash = req.cookies.hash
      permission = true
      console.log("Control changed To: "+controllingDeviceHash+" From: "+req.ip)
      log("Control changed To: "+controllingDeviceHash+" From: "+req.ip)
      controlUpdateCheck = setInterval(()=>{
        if(!updatedControl) {
          controllingDeviceHash = ""
          clearInterval(controlUpdateCheck)
          console.log("Control reset")
          log("Control reset")
        }else {
          console.log("Control passed")
        }
        updatedControl = false
      }, 10000)
    }
    else if(controllingDeviceHash == req.cookies.hash && (!isLocalHost || req.cookies.websocket == "yes")) {
      permission = true
    }
    if (isLocalHost && req.cookies.websocket != "yes") permission = true
    res.json({ control: permission });
  }else {
    res.send("Not Allowed")
  }
})

app.get('/updatePermission', (req, res) => {
  var isLocalHost = false
  if (req.ip === '::ffff:127.0.0.1' || req.ip === '::1') isLocalHost = true
  if (!isLocalHost && req.cookies.hash == controllingDeviceHash) {
    updatedControl = true
    res.send("Updated") // Response sent here
  } else {
    res.send("not controlling") // Response sent here
  }
})

app.get('/controlRequestedCheck', (req, res)=>{
  if(req.cookies.hash == controlRequestHash) {
    controlRequestHash = ""
    controlRequestDeviceIp = ""
    res.send("Control resetted")
  }
  else if(req.cookies.hash == controllingDeviceHash) {
    res.json({ device: controlRequestDeviceIp })
  }
  else res.send("Not allowed")
})

app.post('/controlRequestCheck', (req, res) => {
  // Check if the user is logged in
  let isLoggedIn = login(String(req.cookies.hash), String(req.ip), false)
  if (req.ip === '::ffff:127.0.0.1' || req.ip === '::1') {
      isLocalHost = true;
  }
  if (isLoggedIn) {
      // Log the request body
      console.log(req.body);
      // Send appropriate response based on the request body
      if (req.body.action == "accept") {
          controllingRequestTimes.set(controlRequestHash, 0);
          controlRequestBanned.set(controlRequestHash, false)
          controllingDeviceHash = controlRequestHash
          controlRequestHash = ""
          controlRequestDeviceIp = ""
      } else {
          controlRequestHash = ""
          controlRequestDeviceIp = ""
      }
      res.sendStatus(200); // Send success response
  } else {
      res.sendStatus(403); // Send forbidden response if user is not logged in or request body is invalid
  }
});

app.get('/controlRequest', (req,res)=>{
  var isLocalHost = false
  var isLoggedIn = login(String(req.cookies.hash), String(req.ip), false)
  if (req.ip === '::ffff:127.0.0.1' || req.ip === '::1') isLocalHost = true
  if(!isLocalHost && isLoggedIn && req.cookies.hash != controllingDeviceHash) {
    if(controlRequestBanned.get(req.cookies.hash) == undefined || controlRequestBanned.get(req.cookies.hash) == false) {
      console.log("BAN: "+controlRequestBanned.get(req.cookies.hash))
      if(controllingRequestTimes.get(req.cookies.hash) == undefined) controllingRequestTimes.set(req.cookies.hash, 1);
      else controllingRequestTimes.set(req.cookies.hash, controllingRequestTimes.get(req.cookies.hash)+1);
      console.log(controllingRequestTimes.get(req.cookies.hash))
      if(controllingRequestTimes.get(req.cookies.hash) >=5) {
        controllingRequestTimes.set(req.cookies.hash, 0);
        controlRequestBanned.set(req.cookies.hash, true)
        console.log("Device with hash: "+req.cookies.hash+" is banned")
        log("Device with hash: "+req.cookies.hash+" is banned")
        setTimeout(()=>{
          controlRequestBanned.set(req.cookies.hash, false)
          console.log("Device with hash: "+req.cookies.hash+" is unbanned")
          log("Device with hash: "+req.cookies.hash+" is unbanned")
        }, 60000)
      }
    }
    if(controlRequestBanned.get(req.cookies.hash) == false || controlRequestBanned.get(req.cookies.hash) == undefined) {
      controlRequestHash = req.cookies.hash
      controlRequestDeviceIp = (req.ip).replace("::ffff:", "")
      res.send("ControllRequestSended")
    }
    else res.send("Not allowed")
  }
  else res.send("Not allowed")
})

app.get('/getip', (req, res) => {
  if (req.ip === '::ffff:127.0.0.1' || req.ip === '::1') {
      // Get network interfaces
      const networkInterfaces = os.networkInterfaces();

      // Iterate over interfaces
      let privateIPs = [];
      Object.keys(networkInterfaces).forEach(interfaceName => {
          const interfaceData = networkInterfaces[interfaceName];

          // Filter out IPv4 addresses and non-internal interfaces
          const ipv4Addresses = interfaceData.filter(item =>
              item.family === 'IPv4' && !item.internal
          );

          // Collect the private IP addresses
          ipv4Addresses.forEach(address => {
              privateIPs.push(address.address);
          });
      });
      console.log("Ip found "+privateIPs+" required from: "+req.ip)
      log("Ip found "+privateIPs+" required from: "+req.ip)
      // Send the private IP addresses
      res.send(privateIPs);
  } else {
    console.log("Not Allowed to get ip"+" required from: "+req.ip)
    log("Not Allowed to get ip"+" required from: "+req.ip)
      res.send("Not Allowed");
  }
});

app.get('/find', (req, res) => {
  let isLoggedIn = login(String(req.cookies.hash), String(req.ip), false)
  if (req.ip === '::ffff:127.0.0.1' || req.ip === '::1') isLoggedIn = true
  if (isLoggedIn) {
    localIP = getLocalIPAddress();
    log("LocalIP: "+localIP)
    if (localIP) {
      console.log(`Scanning local network from ${localIP}...`);
      log(`Scanning local network from ${localIP}...`)
      scanLocalNetwork(localIP)
        .then((results) => {
          console.log(JSON.stringify(results)+" required from: "+req.ip);
          log(JSON.stringify(results)+" required from: "+req.ip)
          res.json(JSON.stringify(results))
        })
        .catch((error) => {
          console.error(error+" required from: "+req.ip);
          log("server Error"+error+" required from: "+req.ip)
          res.send("server Error")
        });
    } else {
      console.error('Failed to get local IP address'+" required from: "+req.ip);
      log('Failed to get local IP address'+" required from: "+req.ip)
      res.send("Failed to get local IP address")
    }
  }else {
    console.error('Not Allowed to find'+" required from: "+req.ip);
    log('Not Allowed to find'+" required from: "+req.ip)
    res.send("Not Allowed")
  }
})

app.post('/shutdownReset', (req, res) => {
  if ((req.ip === '::ffff:127.0.0.1' || req.ip === '::1')) {
    shutDownCode = '';
    console.log('Shutdown Code reset'+" required from: "+req.ip);
    log('Shutdown Code reset'+" required from: "+req.ip);
    res.status(200).send("Resetted")
  } else {
    // If the request is not from localhost, send a 403 Forbidden response
    res.status(403).json({ error: 'Unauthorized access' });
  }
})

// Endpoint to get the hours data
app.get('/hours', (req, res) => {
  let isLoggedIn = login(String(req.cookies.hash), String(req.ip), false)
  if (req.ip === '::ffff:127.0.0.1' || req.ip === '::1') isLoggedIn = true
  if(isLoggedIn) {
    try {
      // Read the JSON file
      const data = fs.readFileSync(dayHoursFilePath, 'utf8');
      // Parse the JSON data
      const hoursData = JSON.parse(data);
      // Send the hours data as the response
      res.json(hoursData);
    } catch (err) {
      // If an error occurs, send an error response
      console.error('Error reading the DayHours.json file:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }else {
    res.status(403).send("Not allowed")
  }
});

app.get('/shutdownCode', (req, res) => {
  // Check if the request is coming from a trusted source (localhost)
  if ((req.ip === '::ffff:127.0.0.1' || req.ip === '::1')) {
    shutDownCode = Math.floor(100000 + Math.random() * 900000);
    console.log('Shutdown Code'+" required from: "+req.ip);
    log('Shutdown Code'+" required from: "+req.ip);
    res.json({code : shutDownCode});
  } else {
    // If the request is not from localhost, send a 403 Forbidden response
    res.status(403).json({ error: 'Unauthorized access' });
  }
});

app.post('/shutdown', (req, res) => {
  // Check if the request is coming from a trusted source (localhost)
  if ((req.ip === '::ffff:127.0.0.1' || req.ip === '::1') && req.body.code == shutDownCode && shutDownCode !="") {
    // Log the shutdown request
    console.log('Shutting down the system...');
    log('Shutting down the system...');

    // Initiate the shutdown process
    initiateShutdown((err, stdout, stderr) => {
      if (err) {
        console.error('Error occurred during shutdown:', err);
        log('Error occurred during shutdown: ' + err);
        res.status(500).json({ error: 'Error occurred during shutdown' });
      } else {
        console.log('System shutdown initiated successfully');
        log('System shutdown initiated successfully');
        res.json({ message: 'Shutdown initiated' });
      }
    });
  } else {
    // If the request is not from localhost, send a 403 Forbidden response
    res.status(403).json({ error: 'Unauthorized access' });
  }
});

// Logout endpoint to remove user session
app.get('/logout', (req, res) => {
  let sessionData = loadSessionData();
  if(controllingDeviceHash == req.cookies.hash) {
    controllingDeviceHash = ""
    updatedControl = false
  }
  if(controlRequestBanned.get(req.cookies.hash) != undefined) controlRequestBanned.delete(req.cookies.hash)
  if(controllingRequestTimes.get(req.cookies.hash) != undefined) controllingRequestTimes.delete(req.cookies.hash)
  // Filter out the hash that matches the one in the cookie
  sessionData = sessionData.filter(data => data.hash !== req.cookies.hash);

  // Write the updated session data to the JSON file
  saveSessionData(sessionData);
  console.log("Logout successful"+" required from: "+req.ip)
  log("Logout successful"+" required from: "+req.ip)
  res.json({ message: 'Logout successful' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  log(`Server running on port ${port}`);
});
