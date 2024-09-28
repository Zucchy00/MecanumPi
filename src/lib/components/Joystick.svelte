<script lang="ts">
    "use strict"
/*
 *fork from (https://github.com/bobboteck/JoyStick)
 */

import { onDestroy, onMount } from "svelte";

var joystickComponent: HTMLDivElement
let StickStatus =
{
    xPosition: 0,
    yPosition: 0,
    x: "",
    y: "",
};

var deadZoneValue = 20

var change_theme_color_button_value = 0
var movedX:number
var movedY:number
export var permission:boolean
export var X:number
export var Y:number
var height: number
var width
var pressed: number
var JoystickSwapStatus = true //true leftJoystick false Right Joystick
var degrees
var radiants
var magnitude: number
var rotationUp = 0
var rotationDown = 0
var rotationLeft = 0
var rotationRight = 0
export var Fr:number
export var Bl:number
export var Fl:number
export var Br:number
var differenceIntExtCircle = 2/3
var Joy: any
var TriggerSwapStatus = true //true left Trigger false Right Trigger
var leftTriggerValue = 0
var rightTriggerValue = 0
var JoystickOrTrigger = true //true use joystick to calculate magnitude false use triggers to calculate magnitude
var internalFillColor: string
var internalLineWidth: string
var internalStrokeColor: string
var externalLineWidth: string
var externalStrokeColor: string
var autoReturnToCenter: string
var canvas: any
var objContainer: any
var context: any

var IntervalCalculate: number
var IntervalX: number
var IntervalY: number
/**
 * @desc Principal object that draw a joystick, you only need to initialize the object and suggest the HTML container
 * @costructor
 * @param parameters (optional) - object with following keys:
 *  title {String} (optional) - The ID of canvas (Default value is 'joystick')
 *  width {Int} (optional) - The width of canvas, if not specified is setted at width of container object (Default value is the width of container object)
 *  height {Int} (optional) - The height of canvas, if not specified is setted at height of container object (Default value is the height of container object)
 *  internalFillColor {String} (optional) - Internal color of Stick (Default value is '#00AA00')
 *  internalLineWidth {Int} (optional) - Border width of Stick (Default value is 2)
 *  internalStrokeColor {String}(optional) - Border color of Stick (Default value is '#003300')
 *  externalLineWidth {Int} (optional) - External reference circonference width (Default value is 2)
 *  externalStrokeColor {String} (optional) - External reference circonference color (Default value is '#008000')
 *  autoReturnToCenter {Bool} (optional) - Sets the behavior of the stick, whether or not, it should return to zero position when released (Default value is True and return to zero)
 * @param callback {StickStatus} - 
 */
var JoyStick = (function(parameters: any, callback: any, classname: string)
{
    var title:string;
    var circumference: number
    var internalRadius: number
    var maxMoveStick: number
    var externalRadius: number
    var centerX: number
    var centerY: number
    var directionHorizontalLimitPos
    var directionHorizontalLimitNeg
    var directionVerticalLimitPos
    var directionVerticalLimitNeg

    function buildJoystick() {
        parameters = parameters || {};
        title = (typeof parameters.title === "undefined" ? "joystick" : parameters.title),
            width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
            height = (window.innerHeight > 0) ? window.innerHeight : screen.height;
            if(height > width) {
                width = width / 1.1
            }
            else {
                if(width > 300) {
                    width = 300
                }
                else {
                    width = width / 3
                }
            }
            if(joystickComponent.clientWidth - 20 < width) {
                width = joystickComponent.clientWidth -20
            }
            height = width
            internalFillColor = (localStorage.theme === 'dark' ? "#125097" : "#971231"),
            internalLineWidth = (typeof parameters.internalLineWidth === "undefined" ? 2 : parameters.internalLineWidth),
            internalStrokeColor = (localStorage.theme === 'dark' ? "#7fb4f0" : "#f07fa7"),
            externalLineWidth = (typeof parameters.externalLineWidth === "undefined" ? 2 : parameters.externalLineWidth),
            externalStrokeColor = (localStorage.theme === 'dark' ? "#004dc9" : "#c70032"),
            autoReturnToCenter = (typeof parameters.autoReturnToCenter === "undefined" ? true : parameters.autoReturnToCenter);

        callback = callback || function() {};

        // Create Canvas element and add it in the Container object
        objContainer = joystickComponent
        
        // Fixing Unable to preventDefault inside passive event listener due to target being treated as passive in Chrome [Thanks to https://github.com/artisticfox8 for this suggestion]
        objContainer.style.touchAction = "none";

        canvas.id = title;
        canvas.className = classname //ZONE CENTER
        if(width === 0) { width = objContainer.clientWidth; }
        if(height === 0) { height = objContainer.clientHeight; }
        canvas.width = width;
        canvas.height = height;
        objContainer.appendChild(canvas);
        context=canvas.getContext("2d");

        pressed = 0; // Bool - 1=Yes - 0=No
        circumference = 2 * Math.PI;
        internalRadius = (canvas.width-((canvas.width/2)+10))/2;
        maxMoveStick = internalRadius + 5;
        externalRadius = internalRadius + 30;
        centerX = canvas.width / 2;
        centerY = canvas.height / 2;
        directionHorizontalLimitPos = canvas.width / 10;
        directionHorizontalLimitNeg = directionHorizontalLimitPos * -1;
        directionVerticalLimitPos = canvas.height / 10;
        directionVerticalLimitNeg = directionVerticalLimitPos * -1;
        // Used to save current position of stick
        movedX=centerX;
        movedY=centerY;

        // Check if the device support the touch or not
        if("ontouchstart" in document.documentElement)
        {
            canvas.addEventListener("touchstart", onTouchStart, false);
            document.addEventListener("touchmove", onTouchMove, false);
            document.addEventListener("touchend", onTouchEnd, false);
        }
        else
        {
            canvas.addEventListener("mousedown", onMouseDown, false);
            document.addEventListener("mousemove", onMouseMove, false);
            document.addEventListener("mouseup", onMouseUp, false);
        }
        // Draw the object
        drawExternal();
        drawInternal();
    }

    buildJoystick()

    /******************************************************
     * Private methods
     *****************************************************/

    /**
     * @desc Draw the external circle used as reference position
     */
    function drawExternal()
    {
        context.beginPath();
        context.arc(centerX, centerY, externalRadius, 0, circumference, false);
        context.lineWidth = externalLineWidth;
        context.strokeStyle = externalStrokeColor;
        context.stroke();
    }

    /**
     * @desc Draw the internal stick in the current position the user have moved it
     */
    function drawInternal()
    {
        context.beginPath();
        if(movedX<internalRadius) { movedX=maxMoveStick; }
        if((movedX+internalRadius) > canvas.width) { movedX = canvas.width-(maxMoveStick); }
        if(movedY<internalRadius) { movedY=maxMoveStick; }
        if((movedY+internalRadius) > canvas.height) { movedY = canvas.height-(maxMoveStick); }
        context.arc(movedX, movedY, externalRadius * differenceIntExtCircle, 0, circumference, false);
        // create radial gradient
        var grd = context.createRadialGradient(centerX, centerY, 5, centerX, centerY, 200);
        // Light color
        grd.addColorStop(0, internalFillColor);
        // Dark color
        grd.addColorStop(1, internalStrokeColor);
        context.fillStyle = grd;
        context.fill();
        context.lineWidth = internalLineWidth;
        context.strokeStyle = internalStrokeColor;
        context.stroke();
    }

    /**
     * @desc Events for manage touch
     */
    function onTouchStart() 
    {
        pressed = 1;
    }

    function onTouchMove(event: any)
    {
        if(pressed === 1 && event.targetTouches[0].target === canvas)
        {
            movedX = event.targetTouches[0].pageX;
            movedY = event.targetTouches[0].pageY;
            // Manage offset
            if(canvas.offsetParent.tagName.toUpperCase() === "BODY")
            {
                movedX -= canvas.offsetLeft;
                movedY -= canvas.offsetTop;
            }
            else
            {
                movedX -= canvas.offsetParent.offsetLeft;
                movedY -= canvas.offsetParent.offsetTop;
            }
            // Delete canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            // Redraw object
            drawExternal();
            drawInternal();

            // Set attribute of callback
            StickStatus.xPosition = movedX;
            StickStatus.yPosition = movedY;
            StickStatus.x = (100*((movedX - centerX)/maxMoveStick)).toFixed();
            StickStatus.y = ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();
            callback(StickStatus);
        }
    } 

    function onTouchEnd() 
    {
        pressed = 0;
        // If required reset position store variable
        if(autoReturnToCenter)
        {
            movedX = centerX;
            movedY = centerY;
        }
        // Delete canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Redraw object
        drawExternal();
        drawInternal();

        // Set attribute of callback
        StickStatus.xPosition = movedX;
        StickStatus.yPosition = movedY;
        StickStatus.x = (100*((movedX - centerX)/maxMoveStick)).toFixed();
        StickStatus.y = ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();
        callback(StickStatus);
    }

    /**
     * @desc Events for manage mouse
     */
    function onMouseDown() 
    {
        pressed = 1;
    }

    /* To simplify this code there was a new experimental feature here: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/offsetX , but it present only in Mouse case not metod presents in Touch case :-( */
    function onMouseMove(event: any) 
    {
        if(pressed === 1 && canvas != null)
        {
            movedX = event.pageX;
            movedY = event.pageY;
            // Manage offset
            if(canvas.offsetParent.tagName.toUpperCase() == "BODY")
            {
                movedX -= canvas.offsetLeft;
                movedY -= canvas.offsetTop;
            }
            else
            {
                movedX -= canvas.offsetParent.offsetLeft;
                movedY -= canvas.offsetParent.offsetTop;
            }
            // Delete canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            // Redraw object
            drawExternal();
            drawInternal();

            // Set attribute of callback
            StickStatus.xPosition = movedX;
            StickStatus.yPosition = movedY;
            StickStatus.x = (100*((movedX - centerX)/maxMoveStick)).toFixed();
            StickStatus.y = ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();
            callback(StickStatus);
        }
    }

    function onMouseUp() 
    {
        if(canvas != null) {
            pressed = 0;
            // If required reset position store variable
            if(autoReturnToCenter)
            {
                movedX = centerX;
                movedY = centerY;
            }
            // Delete canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            // Redraw object
            drawExternal();
            drawInternal();

            // Set attribute of callback
            StickStatus.xPosition = movedX;
            StickStatus.yPosition = movedY;
            StickStatus.x = (100*((movedX - centerX)/maxMoveStick)).toFixed();
            StickStatus.y = ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();
            callback(StickStatus);
        }
    }
    /******************************************************
     * Public methods
     *****************************************************/

    /**
     * @desc The width of canvas
     * @return Number of pixel width 
     */
    // @ts-ignore
    this.GetWidth = function () 
    {
        return canvas.width;
    };

    // Call the reconstructJoystick function when the window resizes
    window.addEventListener('resize', ()=>{
        if(objContainer.clientWidth != 0) {
            if(objContainer != null) objContainer.removeChild(canvas);
            buildJoystick()
        }
    });

    // Call the reconstructJoystick function when the window resizes
    window.addEventListener('fullscreenchange', ()=>{
        if(objContainer.clientWidth != 0) {
            if(objContainer != null) objContainer.removeChild(canvas);
            buildJoystick()
        }
    });


    
    // @ts-ignore
    this.updateCircle = function ()
    {
        if(canvas != null) {
            // Delete canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            // Redraw object
            drawExternal();
            drawInternal();

            // Set attribute of callback
            StickStatus.xPosition = movedX;
            StickStatus.yPosition = movedY;
            StickStatus.x = (100*((movedX - centerX)/maxMoveStick)).toFixed();
            StickStatus.y = ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();
            callback(StickStatus);
        }
    }

    /**
     * @desc The height of canvas
     * @return Number of pixel height
     */
    // @ts-ignore
    this.GetHeight = function () 
    {
        return canvas.height;
    };

    /**
     * @desc The X position of the cursor relative to the canvas that contains it and to its dimensions
     * @return Number that indicate relative position
     */
    // @ts-ignore
    this.GetPosX = function ()
    {
        return movedX;
    };

    /**
     * @desc The Y position of the cursor relative to the canvas that contains it and to its dimensions
     * @return Number that indicate relative position
     */
    // @ts-ignore
    this.GetPosY = function ()
    {
        return movedY;
    };

    /**
     * @desc Normalizzed value of X move of stick
     * @return Integer from -100 to +100
     */
    // @ts-ignore
    this.GetX = function ()
    {
        if(Number((100*((movedX - centerX)/maxMoveStick)).toFixed())>100) return 100
        else if(Number((100*((movedX - centerX)/maxMoveStick)).toFixed())<-100) return -100
        else return (100*((movedX - centerX)/maxMoveStick)).toFixed();
    };

    /**
     * @desc Normalizzed value of Y move of stick
     * @return Integer from -100 to +100
     */
    // @ts-ignore
    this.GetY = function ()
    {
        if(Number(((100*((movedY - centerY)/maxMoveStick))*-1).toFixed())>100) return 100
        else if(Number(((100*((movedY - centerY)/maxMoveStick))*-1).toFixed())<-100) return -100
        else return (Number(100*((movedY - centerY)/maxMoveStick))*-1).toFixed();
    };
});

function createJoystick(classname: string) {
    // @ts-ignore
    Joy = new JoyStick( "", "", classname);
    updateJoystickColor()
    // if (window.location.pathname.includes("input.html")) {
    //     setInterval(function(){ console.log(Joy.GetX()) });
    //     setInterval(function(){ console.log(Joy.GetY()) });
    // }
    IntervalCalculate = setInterval(function(){
        degrees = calcAngleDegrees(Joy.GetX(), Joy.GetY())
        radiants = calcAngleDegrees(Joy.GetX(), Joy.GetY()) / 180.0 * Math.PI
        if(TriggerSwapStatus && JoystickOrTrigger==false) {
            magnitude= leftTriggerValue - rightTriggerValue
            if(Joy.GetY()==0 && Joy.GetX() == 0 && magnitude > 0) radiants = 1/2 * Math.PI // this establish that if i don't move the joystick and i use the triggers to change magnitude the radiants sets to 1/2π
            if(Joy.GetY()==0 && Joy.GetX() == 0 && magnitude < 0) {
                radiants = 3/2 * Math.PI // this establish that if i don't move the joystick and i use the triggers to change magnitude the radiants sets to 1/2π
                magnitude = -magnitude
            }
        }
        else if(!TriggerSwapStatus && JoystickOrTrigger==false) {
            magnitude= rightTriggerValue -leftTriggerValue
            if(Joy.GetY()==0 && Joy.GetX() == 0 && magnitude > 0) radiants = 1/2 * Math.PI // this establish that if i don't move the joystick and i use the triggers to change magnitude the radiants sets to 1/2π
            if(Joy.GetY()==0 && Joy.GetX() == 0 && magnitude < 0) {
                radiants = 3/2 * Math.PI // this establish that if i don't move the joystick and i use the triggers to change magnitude the radiants sets to 1/2π
                magnitude = -magnitude
            }
        }
        if(JoystickOrTrigger==true || pressed == 1){
            magnitude = Math.sqrt( Joy.GetX() ** 2.0 + Joy.GetY() ** 2.0 ) / 100
        }
        if(magnitude>1) magnitude = 1
        if(rotationUp == 1) { 
            if(TriggerSwapStatus && JoystickOrTrigger==false) {
                magnitude= leftTriggerValue - rightTriggerValue
            }
            else if(!TriggerSwapStatus && JoystickOrTrigger==false) {
                magnitude= rightTriggerValue -leftTriggerValue
            }
            else magnitude = 1
            Fl = 0
            Bl = 1 * magnitude
            Fr = 0
            Br = -1 * magnitude
        }
        else if(rotationDown == 1) {
            if(TriggerSwapStatus && JoystickOrTrigger==false) {
                magnitude= leftTriggerValue - rightTriggerValue
            }
            else if(!TriggerSwapStatus && JoystickOrTrigger==false) {
                magnitude= rightTriggerValue -leftTriggerValue
            }
            else magnitude = 1
            Fl = 1 * magnitude
            Bl = 0
            Fr = -1 * magnitude
            Br = 0
        }
        else if(rotationLeft == 1) {
            if(TriggerSwapStatus && JoystickOrTrigger==false) {
                magnitude= leftTriggerValue - rightTriggerValue
            }
            else if(!TriggerSwapStatus && JoystickOrTrigger==false) {
                magnitude= rightTriggerValue -leftTriggerValue
            }
            else magnitude = 1
            Fl = -1 * magnitude
            Bl = -1 * magnitude
            Fr = 1 * magnitude
            Br = 1 * magnitude
        }
        else if(rotationRight == 1) {
            if(TriggerSwapStatus && JoystickOrTrigger==false) {
                magnitude= leftTriggerValue - rightTriggerValue
            }
            else if(!TriggerSwapStatus && JoystickOrTrigger==false) {
                magnitude= rightTriggerValue -leftTriggerValue
            }
            else magnitude = 1
            Fl = 1 * magnitude
            Bl = 1 * magnitude
            Fr = -1 * magnitude
            Br = -1 * magnitude
        }
        else {
            Fr = Math.round((Math.sin(Number((radiants - (1/4) * Math.PI).toFixed(5)))) * 100000 * magnitude) / 100000
            Bl = Math.round((Math.sin(Number((radiants - (1/4) * Math.PI).toFixed(5)))) * 100000 * magnitude) / 100000
            Fl = Math.round((Math.sin(Number((radiants + (1/4) * Math.PI).toFixed(5)))) * 100000 * magnitude) / 100000
            Br = Math.round((Math.sin(Number((radiants + (1/4) * Math.PI).toFixed(5)))) * 100000 * magnitude) / 100000
        }
        updateJoystickColor()
    });
}

// Function to update gamepad state and log changes
function updateGamepadState() {
  // Get the first connected gamepad (you can loop through gamepads if multiple are connected)
  const gamepad = navigator.getGamepads()[0];

  if (gamepad && permission) {

    // Compare button values and update HTML elements
    for (let i = 0; i < gamepad.buttons.length; i++) {
        const buttonValue = gamepad.buttons[i].value;
        if(i==10 && buttonValue==1 && JoystickSwapStatus == false) {
            SwapJoystick()
        }
        if(i==11 && buttonValue==1 && JoystickSwapStatus == true) {
            SwapJoystick()
        }
        if(i==4 && buttonValue==1 && TriggerSwapStatus == false) {
            SwapTrigger()
        }
        if(i==5 && buttonValue==1 && TriggerSwapStatus == true) {
            SwapTrigger()
        }
        if(i==4 && buttonValue==1|| i==5 && buttonValue==1) {
            JoystickOrTrigger=false
        }
        if(i==9 && buttonValue==1 && change_theme_color_button_value == 0) {
            console.log("changed Theme")
            change_theme_color_button_value = 1
        }
        if(i==9 && buttonValue==0 && change_theme_color_button_value == 1) {
            change_theme_color_button_value = 0
        }
        if(i==10 && buttonValue==1|| i==11 && buttonValue==1) {
            JoystickOrTrigger=true
        }
        if(i==12 && buttonValue==1) { 
            rotationUp = 1
        }
        if(i==12 && buttonValue==0) { 
            rotationUp = 0
        }
        if(i==13 && buttonValue==1) { 
            rotationDown = 1
        }
        if(i==13 && buttonValue==0) { 
            rotationDown = 0
        }
        if(i==14 && buttonValue==1) { 
            rotationLeft = 1
        }
        if(i==14 && buttonValue==0) {
            rotationLeft = 0
        }
        if(i==15 && buttonValue==1) {
            rotationRight = 1
        }
        if(i==15 && buttonValue==0) {
            rotationRight = 0
        }
        // if(buttonValue==1) console.log(i)
        leftTriggerValue = gamepad.buttons[6].value
        rightTriggerValue = gamepad.buttons[7].value
    }


    // Read analog values of left and right joysticks
    const leftStickX = gamepad.axes[0];
    const leftStickY = gamepad.axes[1];
    const rightStickX = gamepad.axes[2];
    const rightStickY = gamepad.axes[3];

    var valueX
    var valueY

    if(JoystickSwapStatus) {
        valueX = leftStickX
        valueY = leftStickY
    }
    else {
        valueX = rightStickX
        valueY = rightStickY
    }

    if((Math.abs(valueY*100)>deadZoneValue && Math.abs(valueX*100)>deadZoneValue) || pressed == 0) {
        if(Math.abs(valueX*100)>deadZoneValue) movedX = (height/2)+(valueX * (height/4));
        else movedX = (height/2)
        if(Math.abs(valueY*100)>deadZoneValue) movedY = (height/2)+(valueY * (height/4));
        else movedY = (height/2)
        Joy.updateCircle()
    }
  }

  // Request the next frame
  requestAnimationFrame(updateGamepadState);
}

// Listen for gamepad connections
window.addEventListener("gamepadconnected", (e) => {
  console.log(
    "Gamepad connected at index %d: %s. %d buttons, %d axes.",
    e.gamepad.index,
    e.gamepad.id,
    e.gamepad.buttons.length,
    e.gamepad.axes.length
  );


  // Start updating gamepad state
  updateGamepadState();
});

// Listen for gamepad disconnections
window.addEventListener("gamepaddisconnected", (e) => {
  console.log(
    "Gamepad disconnected from index %d: %s",
    e.gamepad.index,
    e.gamepad.id
  );
});

function SwapJoystick() {
        if(JoystickSwapStatus) {
            JoystickSwapStatus=false
        }
        else {
            JoystickSwapStatus = true
        }
}

function SwapTrigger() {
    if(TriggerSwapStatus) {
        TriggerSwapStatus=false
    }
    else {
        TriggerSwapStatus = true
    }
}

function calcAngleDegrees(x: number, y: number) {
    if((Math.atan2(y, x) * 180) / Math.PI <0) return (Math.atan2(y, x) * 180) / Math.PI +360
    else return (Math.atan2(y, x) * 180) / Math.PI
  }

function changeInternalDiff(value: number) {
    if(value > 0 && value < 1) {
        differenceIntExtCircle = value
        Joy.updateCircle()
    }
}

function updateJoystickColor() {
    if (localStorage.theme === 'dark') {
        internalFillColor = "#125097"
        internalStrokeColor = "#7fb4f0"
        externalStrokeColor = "#004dc9"
    } else{
        internalFillColor = "#971231"
        internalStrokeColor = "#f07fa7"
        externalStrokeColor = "#c70032"
    }
    Joy.updateCircle()
}

onMount(()=>{
    createJoystick("float-right hover:cursor-pointer ring-2 ring-gray dark:ring-white-gray rounded-3xl m-8")
    IntervalX = setInterval(function(){
        X = Joy.GetX()
    });
    IntervalY = setInterval(function(){
        Y = Joy.GetY()
    });
})

onDestroy(()=>{
    canvas.innerHTML=""
    clearInterval(IntervalCalculate)
    clearInterval(IntervalX)
    clearInterval(IntervalY)
})
</script>

<div bind:this={joystickComponent}>
    <canvas bind:this={canvas}></canvas>
</div>