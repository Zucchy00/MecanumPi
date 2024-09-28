<script lang="ts">
    import { onMount } from "svelte";
    import axios from 'axios';
    import { getUrlWithNoPort } from "$lib/logic/main";
    import { ArrowClockwise } from "svelte-bootstrap-icons";

    let loaded = false;
    let scanningText = "Scanning";
    let dotCount = 0;
    let dotInterval: number;
    let page: HTMLDivElement

    async function find() {
        try {
            const response = await axios.get(getUrlWithNoPort()+":3000/find", { withCredentials: true });
            console.log(response)
            const devicesData = JSON.parse(response.data);
            const devices = [];
            if (devices.length != 0) 
            {
                loaded = true;
                stopScanningAnimation()
            }
            for (const device of devicesData) {
                devices.push(new Device(device.ip, device.hostname, "80"));
            }
            if(page!=null) createCards(devices);
            loaded = true; // Assuming this is where loading is complete
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    function retry() {
        page.innerHTML = "";
        loaded = false
        dotCount = 0
        find()
        startScanningAnimation();
    }

    function checkScreenSize() {
        let isMobileView = window.matchMedia('(max-width: 1023px)').matches;
        if(page != undefined) {
            if (isMobileView) {
                page.className = "py-2 px-3 grid grid-cols-1 w-screen";
            } else {
                page.className = "py-2 px-3 grid grid-cols-4 w-screen";
            }
        }
    }

    onMount(()=>{
        checkScreenSize()
        window.addEventListener('resize', ()=>{
            checkScreenSize()
        });
        window.addEventListener('fullscreenchange', ()=>{
            checkScreenSize()
        });
        loaded = false
        dotCount = 0
        find()
        startScanningAnimation();
    });

    // Function to start scanning animation
    function startScanningAnimation() {
        dotInterval = setInterval(() => {
            dotCount = (dotCount + 1) % 4;
        }, 500);
    }

    // Function to stop scanning animation
    function stopScanningAnimation() {
        clearInterval(dotInterval);
    }
    class Device {
        constructor(public ip: string, public hostname: string, public port: string) {}
    }

    function createCards(devices: Device[]) {
        var rows = 0;
        page.innerHTML = "";
        devices.forEach((device, index) => { 
            var card = document.createElement("div");
            var title = document.createElement("h1");
            var description = document.createElement("p");
            title.innerHTML = removeSuffix(device.hostname);
            if (index % 2 == 0) {
                title.className = "text-2xl font-bold text-red m-2";
            } else {
                title.className = "text-2xl font-bold text-white-blue m-2";
            }
            card.appendChild(title);
            description.innerHTML = device.ip;
            description.className = "text-lg dark:text-white m-2";
            card.appendChild(description);
            card.className = "overflow-hidden m-6 rounded-lg text-center h-fit hover:cursor-pointer hover:bg-mid-gray dark:hover:bg-black dark:ring-white ring-gray dark:ring-white ring transition ease-in dark:ease-out duration-500";
            card.onclick = function() {
                window.location.href = `http://${device.ip}:${device.port}`;
            };
            page.appendChild(card);
            rows++;
        });
    }

    function removeSuffix(hostname: string): string {
        const parts = hostname.split('.');
        return parts[0];
    }
</script>

{#if loaded}
<div class="flex justify-center items-center">
    <button on:click={retry} class="overflow-hidden m-6 rounded-lg p-2 text-center h-fit hover:cursor-pointer hover:bg-mid-gray dark:hover:bg-black dark:ring-white ring-gray dark:ring-white ring transition ease-in dark:ease-out duration-200">
        <ArrowClockwise class="w-6 h-6 m-3 ml-3.5 mb-0 dark:text-white"/>
        <p class="dark:text-white">Reload</p>
    </button>
</div>
{/if}
<div class="py-2 px-3 grid grid-cols-6 w-screen" bind:this={page}>
</div>
{#if !loaded}
    <div class='flex flex-col justify-center items-center mt-16 mx-auto'>
        <img src="./images/loading_circle.gif" class="mx-auto mb-0">
        <p class="mx-auto mt-0 dark:text-white text-xl">{(Array(dotCount + 1).join('.').split('').map(() => '\u00A0').join(''))+scanningText + Array(dotCount + 1).join('.')}</p>
    </div>
{/if}


