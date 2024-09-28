<script lang="ts">
    "use strict";
    import { onDestroy, onMount } from 'svelte';
    import WebSocketManager from '$lib/logic/WebSocketManager';
    import { getCookie } from '$lib/logic/main';
    export var permission:boolean
    export var Fl: number
	export var Fr: number
	export var Bl: number
	export var Br: number


    var previusFl: number
    var previusFr: number
    var previusBl: number
    var previusBr: number
    var interval:number

const webSocketManager = WebSocketManager.getInstance();

// Your Svelte component code
onMount(() => {
    var hash = getCookie("hash")
    interval = setInterval(()=>{
        if(permission) {
            var jsonData = {
              "Fl": Fl,
              "Fr": Fr,
              "Bl": Bl,
              "Br": Br,
              "hash": hash
            };
        if(!(Fl == previusFl && Fr == previusFr && Br == previusBr && Bl == previusBl)) sendData(jsonData)
        previusFl = Fl
        previusFr = Fr
        previusBl = Bl
        previusBr = Br
        }
    },50)
});

onDestroy(() => {
    clearInterval(interval)
});

// Inside a function or event handler
function sendData(data: any) {
    webSocketManager.send(data);
}
</script>
