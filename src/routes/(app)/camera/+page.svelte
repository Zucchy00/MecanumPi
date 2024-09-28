<script lang="ts">
    "use strict"
	var webcamJoystickDiv: HTMLDivElement
        import Webcam from '$lib/components/Webcam.svelte';
		import Joystick from '$lib/components/Joystick.svelte';
		import SendJoystick from '$lib/components/sendJoystick.svelte';
		import { getUrlWithNoPort } from '$lib/logic/main';
		import axios from 'axios';
		import { onMount } from 'svelte';
		export var X: number
		export var Y: number
		export var Fl: number
		export var Fr: number
		export var Bl: number
		export var Br: number
		var loaded: boolean = false
		var permission = false

		
		onMount(() => {
			loaded = true
			checkPermission();
			setInterval(()=>{
				axios.get(getUrlWithNoPort() + ':3000/updatePermission', {
					withCredentials: true,
					timeout: 5000 // Set timeout to 5 seconds
				});
			},2000)
		});

		async function checkPermission() {
			try {
				// Make a GET request to check the user's login status
				const response = await axios.get(getUrlWithNoPort() + ':3000/controlPermission', {
					withCredentials: true
				});
				permission = response.data.control
				setTimeout(()=>{checkPermission()},5000)
			} catch (error) {
				console.error('Login Status Error:', error);
			}
		}

		async function sendPermission() {
			try {
				// Make a GET request to check the user's login status
				const response = await axios.get(getUrlWithNoPort() + ':3000/controlRequest', {
					withCredentials: true
				});
				permission = response.data.control
				setTimeout(()=>{checkPermission()},5000)
			} catch (error) {
				console.error('Login Status Error:', error);
			}
		}
</script>

<style>
    .container {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .disabled {
        pointer-events: none;
        opacity: 0.5;
    }

    .request-button {
        position: absolute;
        top: 60%;
        left: 40%;
        transform: translate(-50%, -50%);
        z-index: 999;
    }

    .joystick-container {
        position: absolute;
        top: 100px;
        right: 20px;
        width: 240px; /* Set a fixed size for the joystick container */
        height: 240px; /* Set a fixed size for the joystick container */
        opacity: 0.5;
        transition: opacity 0.3s;
    }

    .joystick-container:hover {
        opacity: 1;
    }

    .joystick-container .disabled {
        width: 100%;
        height: 100%;
    }
</style>

<div>
    {#if loaded}
    <Webcam className="fullscreen"/>
    {/if}
    {#if loaded}
    <div class="joystick-container">
        <div class={permission ? '' : "container"}>
            <div class={permission ? '' : 'disabled'}>
                <Joystick bind:X bind:Y bind:Fr bind:Fl bind:Br bind:Bl bind:permission/>
            </div>
            {#if !permission}
            <button on:click={sendPermission} class="request-button p-2 dark:text-white bg-white-gray dark:bg-black-gray overflow-hidden rounded-lg text-center hover:cursor-pointer hover:bg-mid-gray dark:hover:bg-black dark:ring-white ring-gray dark:ring-white ring transition ease-in dark:ease-out duration-500">Request permission</button>
            {/if}
        </div>
        <SendJoystick bind:Fr bind:Fl bind:Br bind:Bl bind:permission/>
    </div>
    {/if}
</div>

