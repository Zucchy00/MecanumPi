import { writable } from 'svelte/store';

export function createTimeStore() {
    const { subscribe, set } = writable({hours: "", minutes: "", seconds: ""});

    function updateClock() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        set({hours, minutes, seconds});
    }

    updateClock(); // Initialize immediately
    setInterval(updateClock, 1000); // Update every second

    return {
        subscribe
    };
}
