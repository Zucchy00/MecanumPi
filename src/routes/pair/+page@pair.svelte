<script lang="ts">
    import { ArrowRightShort } from "svelte-bootstrap-icons";
    import { onMount } from "svelte";
    import sha256 from 'crypto-js/sha256'; // Import SHA256 hashing function
    import axios from 'axios'; // Import axios for making HTTP requests
	import { deleteCookie, getUrlWithNoPort } from "$lib/logic/main";

    let inputValue: string = ""; // Input value for the code to pair
    let loggedIn: boolean = false; // Flag to indicate user's login status
    let textChange: HTMLDivElement

    async function pairDevice() {
        try {
            // Hash the input text using SHA256
            const hashedText = sha256(inputValue).toString();
            console.log("Hashed text:", hashedText);
            // Make a POST request to pair the device with the hashed code
            const response = await axios.post(getUrlWithNoPort()+':3000/pair', { hashedcode: hashedText });
            console.log("Pairing response:", response.data);
            const hashValue = response.data.hash;

            // Create a cookie string with the name and value
            const cookieString = `hash=${hashValue}; Expires=Fri, 31 Dec 9999 23:59:59 GMT`;
            document.cookie = cookieString;
            // If the request is successful, update login status and clear the input
            inputValue = "";
            console.log("Device paired successfully.");
        } catch (error) {
            console.error('Pairing Error:', error);
        }
    }


    function checkScreenSize() {
        let isMobileView = window.matchMedia('(max-width: 1023px)').matches;
        if(screen != undefined) {
            if (isMobileView) {
                textChange.className = "mb-4";
            } else {
                textChange.className = "inline-flex mb-4";
            }
        }
    }

    async function checkLoginStatus() {
        try {
            // Make a GET request to check the user's login status
            const response = await axios.get(getUrlWithNoPort()+':3000/status', {
                withCredentials: true
            });
            console.log("Login status response:", response.data);
            // Update the login status based on the response
            loggedIn = response.data.loggedIn;
            if(loggedIn) {
                var baseUrl = window.location.origin; // Get the base URL
                var redirectUrl = baseUrl + '/'; // Construct the redirect URL
                window.location.href = redirectUrl; // Redirect to the constructed URL
            }
            console.log("Login status checked successfully.");
        } catch (error) {
            console.error('Login Status Error:', error);
        }
    }

    // Call checkLoginStatus when the component mounts
    onMount(()=> {
        checkScreenSize()
        window.addEventListener('resize', checkScreenSize);
        window.addEventListener('fullscreenchange', checkScreenSize);
    });

    // Function to handle click event on the ArrowRightShort component
    async function handleClick() {
        console.log("Input value:", inputValue);
        await pairDevice();
        await checkLoginStatus();
    }
</script>

<div class="mx-auto h-screen flex flex-col items-center justify-center p-4">
    <div class="inline-flex mb-4" bind:this={textChange}>
        <span class="text-6xl text-black dark:text-white">Insert the code to pair:</span>
        <div class="flex items-center justify-center my-3 mt-4 w-3/12 mx-auto relative">
            <input
                type="text"
                placeholder="Type here..."
                class="bg-white-gray dark:bg-black-gray ring-2 dark:ring-white dark:text-white text-black ring-black w-full rounded-xl placeholder-black dark:placeholder-white p-2 focus:outline-0 focus:ring pr-10"
                bind:value={inputValue}
                on:keydown={(event) => {
                    if (event.key === 'Enter') {
                        handleClick(); // Call handleClick function on "Enter" key press
                    }
                }}
            >
            <button on:click={handleClick}>
                <ArrowRightShort class="cursor-pointer absolute dark:text-white right-2 top-2 h-6 w-6 dark:hover:ring-white ring-2 active:ring rounded-lg hover:ring-black ring-white-gray dark:ring-black-gray"/>
            </button>
        </div>
    </div>
    <span class="text-xl dark:text-white mt-2">To pair the device go on the robot in the code page and insert that code here</span>
    {#if loggedIn}
        <span class="text-lg  dark:text-white mt-8">You are logged in.</span>
    {:else}
        <span class="text-lg dark:text-white mt-8">You are not logged in.</span>
    {/if}
</div>
