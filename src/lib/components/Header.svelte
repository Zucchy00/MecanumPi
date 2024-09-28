<script lang="ts">
    "use strict"
	import Routes from "./Routes.svelte";
  import MobileMenu from "./MobileMenu.svelte"
  import MobileMenuButton from "./MobileMenuButton.svelte";
  
  var MobileMenuShow:HTMLDivElement

  function handleClick(event: CustomEvent) {
		if(event.detail.value) {
      MobileMenuShow.classList.remove("hidden")
    }
    else {
      MobileMenuShow.classList.add("hidden")
    }
	}

</script>

<h1 class="text-3xl font-bold bg-gray dark:bg-black transition ease-in dark:ease-out duration-700">
			<header>			
				<nav class="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
					<Routes/>
          <MobileMenuButton on:open-mobile-menu={handleClick}/>
				</nav>
        <!-- Mobile menu, show/hide based on menu open state. -->
        <div class="lg:hidden hidden" role="dialog" aria-modal="true" bind:this={MobileMenuShow}>
          <MobileMenu on:open-mobile-menu={handleClick}/>
        </div>
			</header>			  
</h1>