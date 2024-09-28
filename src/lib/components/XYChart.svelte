<script lang="ts">
    "use strict";
    import { onMount } from 'svelte';
    import Chart, { type ChartConfiguration, type ChartTypeRegistry } from 'chart.js/auto';
    import { createTimeStore } from '../logic/clock.js';
    export var X: number
	export var Y: number

    var xyChart: Chart;

    // Create the clock store instance
    let clockStore = createTimeStore();

    let labels: string[] = [];
    let x: number[] = [];
    let y: number[] = [];
    var time = 1;
    let hours: string;
    let minutes: string;
    let seconds: string;
    var currentTheme: String;

    clockStore.subscribe(time => {
        hours = time.hours;
        minutes = time.minutes;
        seconds = time.seconds;
    });

    var update_time = 1;

    function updateColor() {
        setInterval(()=>{
            if(document.documentElement.classList.contains('dark') && currentTheme == "light") {
                currentTheme = "dark";
                xyChart.destroy()
                createChart()
            }
            else if(!document.documentElement.classList.contains('dark') && currentTheme == "dark") {
                currentTheme = "light"
                xyChart.destroy()
                createChart()
            }
        }, 100)
    }

    // Prepare labels
    {
        const now = new Date();
        let hours_start = now.getHours().toString().padStart(2, '0');
        let minutes_start = now.getMinutes().toString().padStart(2, '0');
        let seconds_start = now.getSeconds().toString().padStart(2, '0');
        let update_time = 1; // Example update time interval in seconds

        for (let i = 0; i < 20; i++) {
            let nextSecond = (parseInt(seconds_start) + i * update_time) % 60;
            let nextMinute = parseInt(minutes_start) + Math.floor((parseInt(seconds_start) + i * update_time) / 60);
            let nextHour = (parseInt(hours_start) + Math.floor(nextMinute / 60)) % 24;

            nextMinute %= 60;
            nextHour %= 24;
            nextSecond %= 60;

            labels.push(`${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}:${nextSecond.toString().padStart(2, '0')}`);
        }
    }
    function UpdatingChart() {
        setInterval(() => {
            x.push(X);
            if (x.length > 19) {
                x.splice(0, 1);
            }
            y.push(Y);
            if (y.length > 19) {
                y.splice(0, 1);
            }
            time += 1;
            if(time > 20) {
                labels.push(hours+ ":" + minutes + ":" + seconds);
            }
            if(labels.length > 20) {
                labels.splice(0, 1);
            }
            if(xyChart.width !=0) xyChart.update();
        }, 1000 * update_time);
    }

    let xy: HTMLCanvasElement;

    function createChart() {
        var ShowAnimation:boolean  = true 
        if (window.location.href.includes("localhost") || window.location.href.includes("127.0.0.1")) ShowAnimation = false 
        if (xy) {  // Ensure xy is not undefined before using it
            const config: ChartConfiguration = {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: 
                    [{
                        label: 'X',
                        data: x,
                        borderWidth: 2,
                        // borderColor: '#36A2EB',
                        // backgroundColor: '#9BD0F5',
                        },
                        {
                        label: 'Y',
                        data: y,
                        borderWidth: 2,
                        // borderColor: '#1da711',
                        // backgroundColor: '#46eb37',
                        }
                    ]
                },
                options: {
                    // @ts-ignore
                    animation: ShowAnimation,
                    scales: {
                        x: {
                            grid: {
                                color: function() {
                                    if (document.documentElement.classList.contains('dark')) {
                                        return '#707375';
                                    } else {
                                        return '#C8C6C2';
                                    }
                                },
                            }
                        },
                        y: {
                            min: -100,
                            max: 100,
                            grid: {
                                color: function() {
                                    if (document.documentElement.classList.contains('dark')) {
                                        return '#707375';
                                    } else {
                                        return '#C8C6C2';
                                    }
                                },
                            }
                        },
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            display: true,
                            labels: {
                                // @ts-ignore
                                color: function() {
                                    if (document.documentElement.classList.contains('dark')) {
                                        return ('#fff').toString();
                                    } else {
                                        return ('#747473').toString();
                                    }
                                },
                            },
                        },
                        title: {
                            display: true,
                            text: 'JoyStick XY Coordinates',
                            // @ts-ignore
                            color: function() {
                                    if (document.documentElement.classList.contains('dark')) {
                                        return '#ffffff';
                                    } else {
                                        return '#666666';
                                    }
                                },
                        }
                    }
                }
                // Add other configuration options as necessary
            };
            xyChart = new Chart(xy, config);
        }
    }


    onMount(() => {
        createChart()
        if (localStorage.theme) {
            currentTheme = localStorage.theme
        }
        updateColor()
        UpdatingChart()
        window.addEventListener('resize', ()=>{
            xyChart.destroy()
            createChart()
        });
        window.addEventListener('fullscreenchange', ()=>{
            xyChart.destroy()
            createChart()
        });
    });

</script>

<canvas bind:this={xy}></canvas>
