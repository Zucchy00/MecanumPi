<script lang="ts">
    import XyChart from "$lib/components/XYChart.svelte";
    import WebcamJoystick from "$lib/components/WebcamJoystick.svelte";
    import { onMount } from "svelte";
	import WheelsChart from "$lib/components/WheelsChart.svelte";
    import DayChart from "$lib/components/DayChart.svelte";
    var X:number
    var Y:number
    var Fl:number
    var Fr:number
    var Br:number 
    var Bl:number
    var retrivedFl = 0
    var retrivedFr = 0
    var retrivedBl = 0
    var retrivedBr = 0

    var screen: HTMLDivElement;
    var loaded: boolean = false
    
    function checkScreenSize() {
        let isMobileView = window.matchMedia('(max-width: 1023px)').matches;
        if(screen != undefined) {
            if (isMobileView) {
                screen.className = "py-2 px-3";
            } else {
                screen.className = "py-2 px-3 grid gap-2 grid-cols-2";
            }
        }
    }
    
    onMount(() => {
        window.addEventListener('resize', checkScreenSize);
        window.addEventListener('fullscreenchange', checkScreenSize);
        loaded = true
        checkScreenSize();
    });
</script>
<div class="py-2 px-3 grid gap-2 grid-cols-2" bind:this={screen}>
    <div>
        {#if loaded}
            <XyChart bind:X bind:Y/>
        {/if}
    </div>
    <div>
        {#if loaded}
            <WebcamJoystick bind:X bind:Y bind:Fl bind:Fr bind:Bl bind:Br/>
        {/if}
    </div>
    <div>
        {#if loaded}
            <WheelsChart bind:Fl bind:Fr bind:Bl bind:Br/>
        {/if}
    </div>
    <div>
        {#if loaded}
            <DayChart/>
        {/if}
    </div>
</div>
