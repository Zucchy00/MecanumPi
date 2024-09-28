<script lang="ts">
    import Theme from "./Theme.svelte"
    import { sleep } from "../logic/main.js"
    import { createEventDispatcher } from 'svelte';
    import { BadgeHd } from "svelte-bootstrap-icons";
    import { Exit } from "../logic/main.js";
    import { getUrlWithNoPort } from "../logic/main.js";
    import { onMount } from "svelte";
  
    const dispatch = createEventDispatcher();

    let MobileMenuDropdown: HTMLDivElement;
    let stateDropDown= true;
    let MobileMenuArrow: SVGSVGElement;
    let isLocaHost = false

    function DropDownMenu() {
        if(stateDropDown) {
            MobileMenuDropdown.classList.add('transition', 'ease-out','duration-200');
            MobileMenuDropdown.classList.remove('transition', 'ease-in','duration-150');
            MobileMenuDropdown.classList.remove('opacity-0', 'translate-y-1', 'hidden');
            MobileMenuDropdown.classList.add('opacity-100', 'translate-y-0');
            MobileMenuArrow.classList.add("rotate-180")
            stateDropDown = false
        }
        else {
            MobileMenuDropdown.classList.remove('transition', 'ease-out','duration-200');
            MobileMenuDropdown.classList.add('transition', 'ease-in','duration-150');
            MobileMenuDropdown.classList.remove('opacity-100', 'translate-y-0');
            MobileMenuDropdown.classList.add('opacity-0', 'translate-y-1');
            MobileMenuArrow.classList.remove("rotate-180")
            sleep(150).then(() => {
                MobileMenuDropdown.classList.add('hidden')
            });
            stateDropDown = true
            }
    }

    function features() {
        window.open("https://github.com/ZucchelliDaniele/Progetto_Robot?tab=readme-ov-file#funzionalit%C3%A0")
    }
    function tutorials() {
        window.open("https://github.com/ZucchelliDaniele/Progetto_Robot?tab=readme-ov-file#come-fare-il-tuo-robot")
    }
    function company() {
        window.open("https://github.com/ZucchelliDaniele/Progetto_Robot/tree/main")
    }


    function CloseMobileMenu() {
        dispatch('open-mobile-menu', {
            value: false,
        });
        MobileMenuDropdown.classList.remove('transition', 'ease-out','duration-200');
        MobileMenuDropdown.classList.add('transition', 'ease-in','duration-150');
        MobileMenuDropdown.classList.remove('opacity-100', 'translate-y-0');
        MobileMenuDropdown.classList.add('opacity-0', 'translate-y-1');
        MobileMenuArrow.classList.remove("rotate-180")
        // make the transition finish (if fixed transition doesn't works, absolute does work)
        sleep(150).then(() => {
            MobileMenuDropdown.classList.add('hidden')
        });
        stateDropDown = true
    }

    onMount(()=>{
        if(getUrlWithNoPort() == "http://localhost") isLocaHost = true
    })
</script>

<!-- Background backdrop, show/hide based on slide-over state. -->
<div class="absolute inset-y-0 right-0 z-10 w-full bg-white-gray dark:bg-black-gray overflow-y-auto px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray dark:sm:ring-white transition ease-in dark:ease-out duration-1000">
    <div class="flex items-center justify-between">
        <Theme/>
        <button type="button" on:click={CloseMobileMenu} class="-m-2.5 rounded-lg p-2.5 hover:ring-2 ring-black dark:ring-white">
            <span class="sr-only dark:text-white">Close menu</span>
            <svg class="h-6 w-6 dark:text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
    <div class="mt-6 flow-root">
        <div class="-my-6 divide-y divide-gray-500/10">
            <div class="space-y-2 py-6">
                <div class="-mx-3">
                    <button type="button" on:click={DropDownMenu} class="mx-3 flex items-center gap-x-1 text-base font-semibold leading-7 dark:text-white" aria-controls="disclosure-1" aria-expanded="false">
                        Robot
                        <!-- DropDownMenu('HeaderDropDownMenu', 'HeaderDropDownButton', 'fixed', 'absolute', false, 'MenuArrow' )
                        Expand/collapse icon, toggle classes based on menu open state.
            
                        Open: "rotate-180", Closed: ""
                        -->
                        <svg class="h-5 w-5 " viewBox="0 0 20 20" fill="currentColor" bind:this={MobileMenuArrow} aria-hidden="true"> <!-- rotate the ^ on the mobile menu -->
                            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    <!-- 'Robot' sub-menu, show/hide based on menu state. -->
                    <div class="mt-2 space-y-2 transition ease-out duration-200 opacity-0 translate-y-1 hidden" bind:this={MobileMenuDropdown}>
                        <a on:click={CloseMobileMenu} href="./" class="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 dark:text-white hover:bg-gray-50">Analytics</a>
                        <a on:click={CloseMobileMenu} href="./camera" class="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 dark:text-white hover:bg-gray-50 inline-flex">Camera</a><BadgeHd class="inline-flex dark:text-white"/>
                        <a on:click={CloseMobileMenu} href="./find" class="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 dark:text-white hover:bg-gray-50">Find Robots</a>
                        {#if isLocaHost}
                            <a on:click={CloseMobileMenu} href="./code" class="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 dark:text-white hover:bg-gray-50">Code</a>
                        {/if}
                    </div>
                </div>
                <a on:click={CloseMobileMenu} href="#" class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 dark:text-white hover:bg-gray-50">Watch demo</a>
                <a on:click={CloseMobileMenu} href="mailto:zucchelli.daniele.studente@itispaleocapa.it?subject=Contact%20Us%20(Your%20title%20problem%20here)&body=Tell%20us%20more%20about%20your%20problem%20here:" class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 dark:text-white hover:bg-gray-50">Contact Us</a>
                <a on:click={features} class="hover:cursor-pointer -mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 dark:text-white hover:bg-gray-50">Features</a>
                <a on:click={tutorials} class="hover:cursor-pointer -mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 dark:text-white hover:bg-gray-50">Tutorials</a>
                <a on:click={company} class="hover:cursor-pointer -mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 dark:text-white hover:bg-gray-50">Company</a>
            </div>
            {#if !isLocaHost}
            <div class="py-6 dark:text-white">
                <button on:click={Exit} class="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-red hover:bg-gray-50">Exit</button>
            </div>
            {/if}
        </div>
    </div>
</div>