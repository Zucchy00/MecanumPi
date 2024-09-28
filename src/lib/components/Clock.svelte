<script lang="ts">
    import { createTimeStore } from '../logic/clock.js';

    // Create the clock store instance
    let clockStore = createTimeStore();
</script>

<h1>
    {$clockStore.hours}:{$clockStore.minutes}
</h1>
