<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { writable } from "svelte/store";
    import { CameraVideoOff } from "svelte-bootstrap-icons";
    import { getUrlWithNoPort } from "$lib/logic/main";
    import { getCookie } from "$lib/logic/main";
    import { goto } from "$app/navigation";

    export let className: string; // Receive class prop from parent component

    let imageSrc = writable("");
	let image: HTMLImageElement;
	//const imageUrl = "http://raspberrypi.local:1809/"+getCookie("hash");
    const imageUrl = getUrlWithNoPort()+":1809/"+getCookie("hash");
	let imageLoaded = false;
	let videoInterval: number;
    var img;

    function ReloadVideo() {
        img = new Image();
        img.src = imageUrl;

        img.onload = function() {
            imageSrc.set(imageUrl);
			imageLoaded = true;
        };

        img.onerror = function() {
			imageLoaded = false;
			console.error("Streaming Not found");
            // Handle error if needed
        };
    }

	function RedirectToImage() {
		if (imageLoaded) {
            goto("/camera");
        }
        else {
            ReloadVideo();
            videoInterval = setInterval(ReloadVideo, 10000);
        }
	}

    onMount(() => {
        ReloadVideo();
        videoInterval = setInterval(ReloadVideo, 10000);
    });

    onDestroy(() => {
        imageSrc.set(""); // Reset the image source on component destroy
        clearInterval(videoInterval)
    });
</script>

<style>
    .fullscreen-image {
        width: 100vw;
        height: 100vh;
        object-fit: cover; /* Preserve aspect ratio */
        cursor: pointer;
    }
</style>

<div class="{className === 'fullscreen' ? 'flex justify-center items-center h-screen mx-auto' : 'flex justify-center items-center mx-auto'}">
    {#if $imageSrc}
        <button on:click={RedirectToImage}>
            <img alt="image" bind:this={image} src={$imageSrc} class="{className === 'fullscreen' ? 'fullscreen-image' : 'hover:cursor-pointer mx-auto align-center align-middle'}" />
        </button>
    {:else}
        <button on:click={RedirectToImage}>
            <CameraVideoOff class="h-40 w-40 dark:text-red text-blue hover:cursor-pointer" />
        </button>
    {/if}
</div>

