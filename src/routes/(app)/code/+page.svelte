<script lang="ts">
	import { getUrlWithNoPort } from '$lib/logic/main';
    import axios from 'axios'; // Import axios for making HTTP requests
    import { onMount, onDestroy } from 'svelte';

    let codeText = '';
    let countdown = 30; // Initial countdown value in seconds
    let countdownInterval:number ; // Variable to hold the countdown interval
    let page: HTMLDivElement
    let isLocalHost = false
    let MyIp:number

    async function ip() {
        try {
            const response = await axios.get(getUrlWithNoPort() + ':3000/getip');
            const ipList = response.data;
            
            // Convert the array of IPs into a single string separated by 'o'
            const concatenatedIps = ipList.join(' o ');
            MyIp = concatenatedIps;
            
            console.log('Concatenated IPs:', MyIp);
        } catch (error) {
            console.error('Error fetching IP:', error);
        }
    }


    async function fetchCode() {
        try {
            const response = await axios.get(getUrlWithNoPort()+':3000/code');
            codeText = response.data.code;
            console.log('Code fetched:', codeText);
            startCountdown(); // Start or resume countdown after fetching code
        } catch (error) {
            console.error('Error fetching code:', error);
        }
    }

    function UpdateCode() {
        if(page != null) {
            fetchCode();
            resetCodeAfterInterval();
        }
    }

    // Function to reset the code after a specified time interval
    function resetCodeAfterInterval() {
        setTimeout(() => {
            countdown = 30; // Reset countdown to initial value
            UpdateCode()
        }, 30000); // 30 seconds in milliseconds
    }

    // Function to start the countdown
    function startCountdown() {
        clearInterval(countdownInterval); // Clear any existing countdown interval
        countdownInterval = setInterval(() => {
            if (codeText && countdown > 0) {
                countdown--; // Decrement countdown if code is available
            } else if (!codeText) {
                // Reset countdown if code is not available and "Refreshing code..." is displayed
                countdown = 30;
                clearInterval(countdownInterval);
            }
        }, 1000); // Update countdown every second
    }

    // Fetch code and start countdown on component mount
    onMount(() => {
        if(getUrlWithNoPort() == "http://localhost") {
            ip()
            isLocalHost = true
            UpdateCode()
        }
        else window.location.href = getUrlWithNoPort()
    });

    // Clear interval on component destroy to avoid memory leaks
    onDestroy(() => {
        clearInterval(countdownInterval);
    });
</script>

<div class="mx-auto h-screen flex flex-col items-center justify-center" bind:this={page}>
    {#if isLocalHost}
    <div class="mb-4">
        <span class="text-6xl text-black dark:text-white">Insert this code to pair:</span>
    </div>
    <span class="text-5xl font-bold dark:text-white mt-2">{codeText}</span>
    <div class="text-2xl mt-4">
        {#if countdown > 0}
            <span class="text-black dark:text-white">Code will reset in {countdown} seconds</span>
        {:else}
            <span class="text-black dark:text-white">Refreshing code...</span>
        {/if}
    </div>
    <div class="text-2xl mt-4">
        {#if MyIp}
            <span class="text-black dark:text-white">Go to: {MyIp}</span>
        {/if}
    </div>
    {/if}
</div>

