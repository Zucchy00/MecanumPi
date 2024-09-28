<script lang="ts">
    "use strict";
    import { onMount } from 'svelte';
    import Chart, { type ChartConfiguration, type ChartTypeRegistry } from 'chart.js/auto';
    import { createTimeStore } from '../logic/clock.js';
	export var Fl: number
	export var Fr: number
	export var Bl: number
	export var Br: number
    import { retrievedFl, retrievedFr, retrievedBl, retrievedBr } from '$lib/logic/motors';

    var FlBr_FrBl_Chart: Chart;

    var retrievedFlValue:number
    var retrievedFrValue:number
    var retrievedBlValue:number
    var retrievedBrValue:number

    retrievedFl.subscribe(value => retrievedFlValue = value);
    retrievedFr.subscribe(value => retrievedFrValue = value);
    retrievedBl.subscribe(value => retrievedBlValue = value);
    retrievedBr.subscribe(value => retrievedBrValue = value);

    // Create the clock store instance
    let clockStore = createTimeStore();

    let labels: string[] = [];
    var Fl_:number[] = []
    var Fr_:number[] = []
    var Bl_:number[] = []
    var Br_:number[] = []
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

    function updateColor() {
        setInterval(()=>{
            if(document.documentElement.classList.contains('dark') && currentTheme == "light") {
                currentTheme = "dark";
                FlBr_FrBl_Chart.destroy()
                createChart()
            }
            else if(!document.documentElement.classList.contains('dark') && currentTheme == "dark") {
                currentTheme = "light"
                FlBr_FrBl_Chart.destroy()
                createChart()
            }
        }, 100)
    }

    function UpdatingChart() {
        setInterval(() => {
            if(retrievedFlValue !=0 || retrievedFrValue !=0 || retrievedBlValue !=0 || retrievedBrValue !=0) {
                Fl = retrievedFlValue;
                Fr = retrievedFrValue;
                Bl = retrievedBlValue;
                Br = retrievedBrValue;
            }
            Fl_.push(Fl);
            if (Fl_.length > 19) {
                Fl_.splice(0, 1);
            }
            Fr_.push(Fr);
            if (Fr_.length > 19) {
                Fr_.splice(0, 1);
            }
            Bl_.push(Bl);
            if (Bl_.length > 19) {
                Bl_.splice(0, 1);
            }
            Br_.push(Br);
            if (Br_.length > 19) {
                Br_.splice(0, 1);
            }
            time += 1;
            if(time > 20) {
                labels.push(hours+ ":" + minutes + ":" + seconds);
            }
            if(labels.length > 20) {
                labels.splice(0, 1);
            }
            if(FlBr_FrBl_Chart.width != 0) FlBr_FrBl_Chart.update();
        }, 1000 * update_time);
    }

    let Canvas: HTMLCanvasElement;

    function createChart() {
        var ShowAnimation:boolean  = true 
        if (window.location.href.includes("localhost") || window.location.href.includes("127.0.0.1")) ShowAnimation = false 
        if (Canvas) {  // Ensure xy is not undefined before using it
            const config: ChartConfiguration = {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: 
                    [{
                        label: 'Fl',
                        data: Fl_,
                        borderWidth: 2,
                        // borderColor: '#36A2EB',
                        // backgroundColor: '#9BD0F5',
                        },
                        {
                        label: 'Fr',
                        data: Fr_,
                        borderWidth: 2,
                        // borderColor: '#1da711',
                        // backgroundColor: '#46eb37',
                        },
                        {
                        label: 'Bl',
                        data: Bl_,
                        borderWidth: 2,
                        // borderColor: '#1da711',
                        // backgroundColor: '#46eb37',
                        },
                        {
                        label: 'Br',
                        data: Br_,
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
                            min: -1,
                            max: 1,
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
                                        return '#ffffff';
                                    } else {
                                        return '#747473';
                                    }
                                },
                            },
                        },
                        title: {
                            display: true,
                            text: 'Front Left and Back Right Values and Front Right and Back Left Values',
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
            FlBr_FrBl_Chart = new Chart(Canvas, config);
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
            FlBr_FrBl_Chart.destroy()
            createChart()
        });
        window.addEventListener('fullscreenchange', ()=>{
            FlBr_FrBl_Chart.destroy()
            createChart()
        });
    });

</script>

<canvas bind:this={Canvas}></canvas>
