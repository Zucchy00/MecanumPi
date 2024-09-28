<script lang="ts">
    "use strict";
    import { onMount } from 'svelte';
    import Chart, { type ChartConfiguration, type ChartTypeRegistry } from 'chart.js/auto';
    import axios from 'axios'
    import { getIpWithoutProtocol } from '$lib/logic/main';

    var hoursChart: Chart;
    var currentTheme: String;

    var days: string[] = []
    var hoursMoving: number[] = []
    var hoursStandby: number[] = []
    var timeTitle = "Seconds"
    let Canvas: HTMLCanvasElement;

    async function getDatas() {
        try {
            const response = await axios.get("http://"+getIpWithoutProtocol()+':3000/hours', { withCredentials: true });
            const data = response.data;
            days = Object.keys(data);
            hoursMoving = Object.values(data).map((item: any) => item.hoursMoving);
            hoursStandby = Object.values(data).map((item: any) => item.hoursStandby);
            if(hoursMoving.some(value => value > 1) || hoursStandby.some(value => value > 1)) {
                timeTitle = "Hours"
            }
            else if(hoursMoving.some(value => value > 0.0166) || hoursStandby.some(value => value > 0.0166)) {
                hoursMoving = hoursMoving.map(value => value * 60);
                hoursStandby = hoursStandby.map(value => value * 60);
                timeTitle = "Minutes"
            }else {
                hoursMoving = hoursMoving.map(value => value * 3600);
                hoursStandby = hoursStandby.map(value => value * 3600);
                timeTitle = "Seconds"
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }


    function updateColor() {
        setInterval(()=>{
            if(document.documentElement.classList.contains('dark') && currentTheme == "light") {
                currentTheme = "dark";
                hoursChart.destroy()
                createChart()
            }
            else if(!document.documentElement.classList.contains('dark') && currentTheme == "dark") {
                currentTheme = "light"
                hoursChart.destroy()
                createChart()
            }
        }, 100)
    }

    function createChart() {
        var ShowAnimation:boolean  = true 
        if (window.location.href.includes("localhost") || window.location.href.includes("127.0.0.1")) ShowAnimation = false 
        if (Canvas) {  // Ensure xy is not undefined before using it
            const config: ChartConfiguration = {
                type: 'bar',
                data: {
                labels: days,
                datasets: 
                    [{
                        label: timeTitle+' Standby',
                        data: hoursStandby,
                        borderWidth: 2,
                        borderRadius: 5,
                        borderSkipped: false,
                        // borderColor: '#36A2EB',
                        // backgroundColor: '#9BD0F5',
                    },
                    {
                        label: timeTitle+' Moving',
                        data: hoursMoving,
                        borderWidth: 2,
                        borderRadius: Number.MAX_VALUE,
                        borderSkipped: false,
                        // borderColor: '#36A2EB',
                        // backgroundColor: '#9BD0F5',
                    }
                    ]
                },
                options: {
                    // @ts-ignore
                    animation: ShowAnimation,
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                            display: true,
                            labels: {
                                // @ts-ignore
                                color: function() {
                                    if (currentTheme == "dark" || document.documentElement.classList.contains('dark')) {
                                        return '#ffffff';
                                    } else {
                                        return '#747473';
                                    }
                                },
                            },
                        },
                        title: {
                            display: true,
                            text: 'Time per day',
                            // @ts-ignore
                            color: function() {
                                if (currentTheme == "dark" || document.documentElement.classList.contains('dark')) {
                                    return '#ffffff';
                                } else {
                                    return '#666666';
                                }
                            },
                        }
                    },
                    scales: {
                        x: {
                        grid: {
                            color: function() {
                                if (currentTheme == "dark" || document.documentElement.classList.contains('dark')) {
                                    return '#707375';
                                } else {
                                    return '#C8C6C2';
                                }
                            },
                        }
                    },
                        y: {
                            
                            grid: {
                                color: function() {
                                    if (currentTheme == "dark" || document.documentElement.classList.contains('dark')) {
                                        return '#707375';
                                    } else {
                                        return '#C8C6C2';
                                    }
                                },
                            }
                        },
                    }
                }
                // Add other configuration options as necessary
            };
            hoursChart = new Chart(Canvas, config);
        }
    }


    onMount(async () => {
        await getDatas()
        updateColor()
        createChart()
        setInterval(async ()=>{
            await getDatas()
            hoursChart.destroy()
            createChart()
        }, 10000)
        if (localStorage.theme) {
            currentTheme = localStorage.theme
        }
        window.addEventListener('resize', ()=>{
            hoursChart.destroy()
            createChart()
        });
        window.addEventListener('fullscreenchange', ()=>{
            hoursChart.destroy()
            createChart()
        });
    });

</script>

<canvas bind:this={Canvas}></canvas>
