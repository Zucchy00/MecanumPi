<script lang="ts">
  import DropDownHeader from "./DropDownHeader.svelte"
  import WifiSignal from "./WifiSignal.svelte";
  import Theme from "./Theme.svelte"
  import Clock from "./Clock.svelte";
  import Power from "./Power.svelte"
	import { onMount } from "svelte";
  import { getIpWithoutProtocol } from "$lib/logic/main";

  function features() {
    window.open("https://github.com/ZucchelliDaniele/Progetto_Robot?tab=readme-ov-file#funzionalit%C3%A0")
  }
  function tutorials() {
    window.open("https://github.com/ZucchelliDaniele/Progetto_Robot?tab=readme-ov-file#come-fare-il-tuo-robot")
  }
  function company() {
    window.open("https://github.com/ZucchelliDaniele/Progetto_Robot/tree/main")
  }
  onMount(()=>{
    console.log("IP :"+getIpWithoutProtocol())
  })
</script>

<Theme/>
<div class="hidden lg:flex lg:gap-x-12">
  <DropDownHeader/>
  <a on:click={features} class="hover:cursor-pointer text-sm font-semibold leading-6 dark:text-white">Features</a>
  <a on:click={tutorials} class="hover:cursor-pointer text-sm font-semibold leading-6 dark:text-white">Tutorials</a>
  <a on:click={company} class="hover:cursor-pointer text-sm font-semibold leading-6 dark:text-white">Company</a>
  </div>
  <div class="hidden lg:flex lg:flex-1 lg:justify-end dark:text-white text-black"> 
    <WifiSignal/>
    <Clock/>
    {#if getIpWithoutProtocol() == 'localhost' || getIpWithoutProtocol() == '127.0.0.1'}
    <Power/>
    {/if}
  </div>