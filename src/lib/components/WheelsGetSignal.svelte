<script lang="ts">
    import WebSocketManager from '$lib/logic/WebSocketManager';
    export var retrivedFl = 0
    export var retrivedFr = 0
    export var retrivedBl = 0
    export var retrivedBr = 0

    const webSocketManager = WebSocketManager.getInstance();
    setInterval(()=>{
        webSocketManager.setEventCallback('message', (event: { data: string; }) => {
            var motors = JSON.parse(event.data)
            console.log(event.data)
            retrivedFl = motors.Fl
            retrivedFr = motors.Fr
            retrivedBl = motors.Bl
            retrivedBr = motors.Br
        });
    }, 100)
</script>