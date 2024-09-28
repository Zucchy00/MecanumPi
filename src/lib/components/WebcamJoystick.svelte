<script lang="ts">
    "use strict"
	var webcamJoystickDiv: HTMLDivElement
		import Webcam from './Webcam.svelte';
		import Joystick from './Joystick.svelte';
		import SendJoystick from './sendJoystick.svelte';
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

		

		function checkScreenSize() {
			let isMobileView = window.matchMedia('(max-width: 1023px)').matches;
			if(webcamJoystickDiv != null) {
				if (isMobileView) {
					webcamJoystickDiv.className = "grid grid-rows-2 grid-cols-1 min-w-fit";
				} else {
					webcamJoystickDiv.className = "grid grid-cols-2 min-w-fit";
				}
			}
		}
		
		onMount(() => {
			window.addEventListener('resize', checkScreenSize);
			window.addEventListener('fullscreenchange', checkScreenSize);
			loaded = true
			checkScreenSize();
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
    width: 100%; /* Ensure the container takes up the full width */
    height: 100%; /* Ensure the container takes up the full height */
}

.disabled {
    pointer-events: none;
    opacity: 0.5; /* Optionally reduce opacity to visually indicate it's disabled */
}

.request-button {
    position: absolute;
    top: 50%;
    left: 60%;
    transform: translate(-50%, -50%);
    z-index: 999; /* Ensure the button is above the joystick */
}


</style>

<div bind:this = {webcamJoystickDiv} class="grid grid-cols-2 min-w-fit">
	{#if loaded}
	<div class="items-center ring-2 mt-20 ml-5 rounded-xl m-2 p-4 flex ring-gray dark:ring-white-gray rounded-3xl">
		<Webcam className=""/>
	</div>
	{/if}
	{#if loaded}
	<div class="mt-16 ml-4">
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