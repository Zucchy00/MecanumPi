<script lang="ts">
  import { onMount } from 'svelte';
  import { Wifi, Wifi1, Wifi2, WifiOff } from 'svelte-bootstrap-icons';
  import WebSocketManager from '$lib/logic/WebSocketManager';
  import { getIpWithoutProtocol } from '$lib/logic/main';
  import { getCookie } from '$lib/logic/main';

  import { retrievedFl, retrievedFr, retrievedBl, retrievedBr } from '$lib/logic/motors';

  let wifiSignalLevel: number | null = -1;
  let wifiSignalStrength = 0;
  let wifiRequestInterval: number;
  let closed = true;
  let retrying = false;
  let messageReceived = false;
  let isMobileView: boolean;
  let retry: number;

  const webSocketManager = WebSocketManager.getInstance();

  function checkScreenSize() {
    isMobileView = window.matchMedia('(max-width: 1023px)').matches;
  }

  function wifiSignalLevelCalculation(signalStrength: number) {
    if (signalStrength >= -30) {
      return 4;
    } else if (signalStrength >= -67) {
      return 3;
    } else if (signalStrength >= -70) {
      return 2;
    } else if (signalStrength >= -80) {
      return 1;
    } else if (signalStrength >= -90) {
      return 0;
    } else {
      return -1;
    }
  }

  function sendWifiSignal() {
    var hash = getCookie("hash")
    const wifiRequestData = {
      "request": "wifi_signal",
      "hash": hash
    };
    webSocketManager.send(wifiRequestData);
    setTimeout(() => {
      if (!messageReceived) {
        wifiSignalLevel = -1;
        clearInterval(wifiRequestInterval);
        closed = true;
        retrying = false;
        messageReceived = false;
        clearInterval(retry);
        server();
      }
    }, 7000);
  }

  function server() {
    retrying = false;
    closed = true;
    retry = setInterval(() => {
      if (closed && !retrying) {
        wifiSignalLevel = -1;
        webSocketManager.connect("ws://"+getIpWithoutProtocol()+":2604");
        retrying = true;

        wifiRequestInterval = setInterval(() => {
            if (!isMobileView) {
              messageReceived = false;
              sendWifiSignal();
            }
          }, 5000);

          setInterval(()=>{
              webSocketManager.setEventCallback('message', (event: { data: any; }) => {
                  messageReceived = true;
                  var response = JSON.parse(event.data)
                  if(response.Fl != undefined) retrievedFl.set( parseFloat(response.Fl) )
                  if(response.Fr != undefined) retrievedFr.set( parseFloat(response.Fr) )
                  if(response.Bl != undefined) retrievedBl.set( parseFloat(response.Bl) )
                  if(response.Br != undefined) retrievedBr.set( parseFloat(response.Br) )
                  wifiSignalStrength = response.wifi;
                  if(wifiSignalStrength != undefined) {
                    wifiSignalStrength = -(wifiSignalStrength.toString()).replace(/\D/g, '');
                    wifiSignalLevel = wifiSignalLevelCalculation(wifiSignalStrength);
                    localStorage.setItem("wifiSignal", wifiSignalLevel.toString());
                  }
              });
          }, 100)
        webSocketManager.setEventCallback('message', (event: { data: number; }) => {
          messageReceived = true;
          wifiSignalStrength = event.data;
          wifiSignalStrength = -(wifiSignalStrength.toString()).replace(/\D/g, '');
          wifiSignalLevel = wifiSignalLevelCalculation(wifiSignalStrength);
          localStorage.setItem("wifiSignal", wifiSignalLevel.toString());
        });

        webSocketManager.setEventCallback('close', (event: { data: number; }) => {
          console.log("WebSocket connection closed.");
          wifiSignalLevel = -1;
          clearInterval(wifiRequestInterval);
          retrying = false;
          server();
        });

        webSocketManager.setEventCallback('error', (event: { data: number; }) => {
          console.error("WebSocket error:", event);
          wifiSignalLevel = -1;
          clearInterval(wifiRequestInterval);
          retrying = false;
          server();
        });
      } else {
        clearInterval(retry);
      }
    }, 4000);
  }

  onMount(() => {
    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('fullscreenchange', checkScreenSize);
    checkScreenSize();
    if (!window.matchMedia('(max-width: 1023px)').matches) {
      server();
    }
    let storedWifiSignal = localStorage.getItem("wifiSignal");
    if (storedWifiSignal !== null) {
      wifiSignalLevel = parseInt(storedWifiSignal);
    }
  });
</script>

{#if (wifiSignalLevel == 3 || wifiSignalLevel == 4)}
  <Wifi class="h-8 w-8 mr-4"/>
{/if}
{#if (wifiSignalLevel == 2)}
  <Wifi2 class="h-8 w-8 mr-4"/>
{/if}
{#if (wifiSignalLevel == 1 || wifiSignalLevel == 0)}
  <Wifi1 class="h-8 w-8 mr-4"/>
{/if}
{#if (wifiSignalLevel == -1)}
  <WifiOff class="h-8 w-8 mr-4"/>
{/if}
