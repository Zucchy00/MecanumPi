<script lang="ts">
    "use strict"
    import { FolderPlus, XSquare } from 'svelte-bootstrap-icons';
    import { onMount } from 'svelte';
    import { sleep } from "../logic/main.js";
    import { BadgeHd } from 'svelte-bootstrap-icons';
    import { Exit } from '../logic/main.js';
    import { _123 } from 'svelte-bootstrap-icons';
    import { getUrlWithNoPort } from '../logic/main.js';

    const NumberBootstrap = _123
    var isLocaHost = false

    onMount(() => {
        // Add an event listener to the window for the click event
        window.addEventListener('click', handleClickOutside);
        if(getUrlWithNoPort() == "http://localhost") isLocaHost = true

        // Cleanup function to remove the event listener when the component is unmounted
        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    });

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node | null;
      // Check if the clicked element is not the HeaderDropDownButton
      if (target && !HeaderDropDownMenu.contains(target) && !HeaderDropDownButton.contains(target)) {
          state = false;
          DropDownMenu();
      }
    }




    var state: boolean = true; //true opened false closed
    var MenuArrow: SVGSVGElement
    var HeaderDropDownMenu: HTMLDivElement
    var HeaderDropDownButton:HTMLButtonElement


    function DropDownMenu() {
        // from, to, IsMobileMenu = false, ArrowID
        if(state) {
            HeaderDropDownMenu.classList.add('transition', 'ease-out','duration-200');
            HeaderDropDownMenu.classList.remove('transition', 'ease-in','duration-150');
            HeaderDropDownMenu.classList.remove('opacity-0', 'translate-y-1', 'fixed');
            HeaderDropDownMenu.classList.add('opacity-100', 'translate-y-0', 'absolute');
            MenuArrow.classList.add("rotate-180")
            state = false
        }
        else {
            HeaderDropDownMenu.classList.remove('transition', 'ease-out','duration-200');
            HeaderDropDownMenu.classList.add('transition', 'ease-in','duration-150');
            HeaderDropDownMenu.classList.remove('opacity-100', 'translate-y-0');
            HeaderDropDownMenu.classList.add('opacity-0', 'translate-y-1');
            MenuArrow.classList.remove("rotate-180")
            // make the transition finish (if fixed transition doesn't works, absolute does work)
            sleep(150).then(() => {
                HeaderDropDownMenu.classList.remove('absolute');
                HeaderDropDownMenu.classList.add('fixed')
            });
            state = true
        }
    }
  </script>


<div class="relative">
    <button type="button" bind:this={HeaderDropDownButton} class="flex items-center gap-x-1 text-sm font-semibold leading-6 dark:text-white" aria-expanded="false" on:click={DropDownMenu}>
    Robot
    <svg class="h-5 w-5 flex-none" bind:this={MenuArrow} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
    </svg>
    </button>

    <!--
    'Robot' flyout menu, show/hide based on flyout menu state.

    Entering: "transition ease-out duration-200"
      From: "opacity-0 translate-y-1"
      To: "opacity-100 translate-y-0"
    Leaving: "transition ease-in duration-150"
      From: "opacity-100 translate-y-0"
      To: "opacity-0 translate-y-1"
    -->

    <!--
    DROP DOWN
    -->

    <div bind:this={HeaderDropDownMenu} class="fixed -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white-gray dark:bg-black-gray shadow-lg ring-1 ring-gray transition ease-in duration-150 opacity-0 translate-y-1">
    <div class="p-4">
      <div class="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50">
      <div class="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 dark:text-white group-hover:bg-white group-hover:text-black">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
        </svg>
      </div>
      <div class="flex-auto">
        <a href="/" on:click={DropDownMenu} class="block font-semibold  dark:text-white">
        Analytics
        <span class="absolute inset-0"></span>
        </a>
        <p class="mt-1  dark:text-white">Get a better understanding of your robots usage</p>
      </div>
      </div>
      <div class="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50">
      <div class="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 dark:text-white group-hover:bg-white group-hover:text-black">
        <svg width="20" height="20" fill="currentColor" class="bi bi-camera" viewBox="0 0 16 16"> <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z"/> <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/> </svg>
      </div>
      <div class="flex-auto">
        <a href="./camera" on:click={DropDownMenu} class="inline-flex block font-semibold dark:text-white">
          Camera
          <BadgeHd class="inline-flex ml-1 mt-1 dark:text-white"/>
          <span class="absolute inset-0"></span>
        </a>
        <p class="mt-1 dark:text-white">Watch in real time what your robot is doing</p>
      </div>
      </div>
      <div class="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50">
      <div class="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 dark:text-white group-hover:bg-white group-hover:text-black">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
      <div class="flex-auto">
        <a href="./find" on:click={DropDownMenu} class="block font-semibold dark:text-white">
        Find Robots
        <span class="absolute inset-0"></span>
        </a>
        <p class="mt-1 dark:text-white">Find robots in your network</p>
      </div>
      </div>
      {#if isLocaHost}
      <div class="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50">
        <div class="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 dark:text-white group-hover:bg-white group-hover:text-black">
          <NumberBootstrap class="h-6 w-6"/>
        </div>
        <div class="flex-auto">
          <a href="./code" on:click={DropDownMenu} class="block font-semibold dark:text-white">
          Code
          <span class="absolute inset-0"></span>
          </a>
          <p class="mt-1 dark:text-white">Connect or remove devices from the robot</p>
        </div>
        </div>
      {/if}
      {#if !isLocaHost}
      <div class="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50">
        <div class="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 dark:text-white group-hover:bg-white group-hover:text-black">
          <XSquare class="h-6 w-6 text-red"/>
        </div>
        <div class="flex-auto">
          <button on:click={Exit} class="block font-semibold dark:text-white">
          Quit
          <span class="absolute inset-0"></span>
          </button>
          <p class="mt-1 dark:text-white">Disconnect this device</p>
        </div>
        </div>
      {/if}
    </div>
    <div class="grid grid-cols-2 divide-x dark:text-white group-hover:bg-white group-hover:text-black">
      <a href="#" on:click={DropDownMenu} class="flex items-center justify-center gap-x-2.5 p-3 text-sm font-semibold leading-6 hover:bg-gray-100 dark:text-white">
      <svg class="h-5 w-5 flex-none" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z" clip-rule="evenodd" />
      </svg>
      Watch demo
      </a>
      <a on:click={DropDownMenu} href="https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=zucchelli.daniele.studente@itispaleocapa.it&su=Contact%20Us%20(Your%20title%20problem%20here)&body=Tell%20us%20more%20about%20your%20problem%20here:" target="_blank" class="flex items-center justify-center gap-x-2.5 p-3 text-sm font-semibold leading-6 hover:bg-gray-100">
      <svg class="h-5 w-5 flex-none" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clip-rule="evenodd" />
      </svg>
      Contact Us
      </a>
    </div>
    </div>
  </div>