<script>
    import { createEventDispatcher } from 'svelte';
  
    const dispatch = createEventDispatcher();
  
    function openMobileMenu() {
      // Correctly dispatch the event with the "dispatch" method
      dispatch('open-mobile-menu', {
        value: true,
      });
    }

</script>

<!-- Mobile Menu button -->
<div class="flex lg:hidden">
    <button on:click={openMobileMenu} type="button" class="-m-2.5 inline-flex items-center justify-center p-2.5 rounded-lg bg-gray-50 dark:text-white group-hover:bg-white group-hover:text-black hover:cursor-pointer hover:ring-2 ring-black dark:ring-white">
        <span class="sr-only">Open main menu</span>
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
    </button>
</div>