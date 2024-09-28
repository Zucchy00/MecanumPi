<script lang="ts">
    import { Sun } from "svelte-bootstrap-icons";
    import { Moon } from "svelte-bootstrap-icons"

    let isDarkMode = true; // Set it to true or false based on your logic

    // Function to toggle dark mode
    function toggleDarkMode() {
        isDarkMode = !isDarkMode;
    }

    function change_theme_color() {
        if (localStorage.theme === 'dark') {
            document.documentElement.classList.remove('dark')
            localStorage.setItem("theme", "light");
        } else{
            localStorage.setItem("theme", "dark");
            document.documentElement.classList.add('dark')
        }
    }
</script>

<div class="flex lg:flex-1">
    <div class="-m-1.5 p-1.5">
        <span class="sr-only">Your Company</span>
        <button on:click={change_theme_color}>
            <Sun class="h-7 w-auto flex-none items-center justify-center rounded-lg bg-gray-50 dark:hidden hover:cursor-pointer hover:ring-2 hover:ring-black dark:hover:ring-white"/>
            <Moon class="h-7 hidden dark:block w-auto flex-none items-center justify-center rounded-lg bg-gray-50 hover:cursor-pointer dark:text-white hover:ring-2 hover:ring-black dark:hover:ring-white"/>
        </button>
    </div>
</div>
