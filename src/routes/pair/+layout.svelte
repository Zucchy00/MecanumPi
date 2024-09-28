<script>
    import axios from 'axios'; // Import axios for making HTTP requests
    import { onMount } from 'svelte';
    import { getUrlWithNoPort, deleteCookie } from '$lib/logic/main';
    var logged = false;
    async function checkLoginStatus() {
        try {
            // Make a GET request to check the user's login status
            const response = await axios.get(getUrlWithNoPort()+':3000/status', {
                withCredentials: true
            });
            console.log("Login status response:", response.data);
            // Update the login status based on the response
            logged = response.data.loggedIn;
            console.log("Login status checked successfully.");
        } catch (error) {
            console.error('Login Status Error:', error);
        }
    }
    import "../../app.css";
    onMount(async ()=> {
        
        await checkLoginStatus()
        const hashCookieExists = document.cookie.split(';').some(cookie => cookie.trim().startsWith('hash='));
        if (logged) {
            var baseUrl = window.location.origin; // Get the base URL
            var redirectUrl = baseUrl + '/'; // Construct the redirect URL
            window.location.href = redirectUrl; // Redirect to the constructed URL
        }else {
            if(hashCookieExists) {
                console.log("ciao")
                deleteCookie("hash")
            }
        }
    })

</script>

{#if !logged}
    <slot></slot>
{/if}