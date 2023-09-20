
<template>
  <div class="container">
    <canvas id="memory-canvas"></canvas>
  </div>
</template>

<script >
import Chart from 'chart.js'
  export default {
    data(){
      return {
        memoryChart: null,
        allocated: [],
        workingSet: [],
        generation0: [],
        generation1: [],
        generation2: [],
        previousGen0: 0,
        previousGen1: 0,
        previousGen2: 0,
        maxEntries: 50,
        interval: 300,
      }
    },
    mounted() {
      this.initializeChart();
      
      setInterval(this.fetchData, this.interval);
      // this.renderChart()
    },
    methods: {
      renderChart(){
        var memoryContext = document.getElementById("memory-canvas").getContext('2d');
        var memoryChart = new Chart(memoryContext, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Allocated',
                        data: [],
                        yAxisID: 'y-axis-memory',
                        borderColor: 'red',
                        backgroundColor: 'red',
                        pointRadius: 0,
                        fill: false
                    },
                    {
                        label: 'Working Set',
                        data: [],
                        yAxisID: 'y-axis-memory',
                        borderColor: 'blue',
                        backgroundColor: 'blue',
                        pointRadius: 0,
                        fill: false
                    },
                    {
                        label: 'Gen 0',
                        data: [],
                        yAxisID: 'y-axis-collections',
                        borderColor: 'green',
                        backgroundColor: 'green',
                        fill: false,
                        showLine: false, // only show point
                        pointStyle: 'triangle',
                        pointRadius: 5

                    },
                    {
                        label: 'Gen 1',
                        data: [],
                        yAxisID: 'y-axis-collections',
                        borderColor: 'orange',
                        backgroundColor: 'orange',
                        fill: false,
                        showLine: false, // only show point
                        pointStyle: 'triangle',
                        pointRadius: 5

                    },
                    {
                        label: 'Gen 2',
                        data: [],
                        yAxisID: 'y-axis-collections',
                        borderColor: 'black',
                        backgroundColor: 'black',
                        fill: false,
                        showLine: false, // only show point
                        pointStyle: 'triangle',
                        pointRadius: 5
                    },
                    {
                        label: 'CPU',
                        data: []
                    },
                    {
                        label: 'RPS',
                        data: []
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    xAxes: [{
                        type: 'time',
                        distribution: 'linear',
                        time: {
                            unit: 'second',
                            displayFormats: {
                                second: 'mm:ss'
                            }
                        },
                        bounds: 'ticks',
                        ticks: {
                            callback: function (value, index, values) {
                                return index;
                            }
                        }
                    }],
                    yAxes: [{
                        id: 'y-axis-memory',
                        ticks: {
                            beginAtZero: true,
                            bounds: 'data',
                            position: 'left',
                            callback: function (value, index, values) {
                                return value + ' MB';
                            }
                        }
                    },
                    {
                        id: 'y-axis-collections',
                        display: false,
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                            max: 2
                        }
                    }]
                },
                tooltips: {
                    enabled: false
                }
            }
        });

        var allocated = memoryChart.data.datasets[0].data;
        var workingSet = memoryChart.data.datasets[1].data;
        var generation0 = memoryChart.data.datasets[2].data;
        var generation1 = memoryChart.data.datasets[3].data;
        var generation2 = memoryChart.data.datasets[4].data;
        var previousGen0 = 0,
            previousGen1 = 0,
            previousGen2 = 0;

        setInterval(function () {
            fetch("https://localhost:44340/api/diagnostics")
                .then(response => {
                    return response.json();
                })
                .then(diagnostics => {
                    var now = new Date();
                    allocated.push({ x: now, y: diagnostics.allocated / 1000000 });
                    workingSet.push({ x: now, y: diagnostics.workingSet / 1000000 });

                    memoryChart.data.datasets[5].label = `CPU (${Math.round(diagnostics.cpu)}%)`;
                    memoryChart.data.datasets[6].label = `RPS (${Math.round(diagnostics.rps / 1000)}K)`;

                    if (previousGen2 < diagnostics.gen2) {
                        generation2.push({ x: now, y: 1 });
                        previousGen2 = diagnostics.gen2;
                        previousGen1 = diagnostics.gen1;
                        previousGen0 = diagnostics.gen0;
                    }
                    else if (previousGen1 < diagnostics.gen1) {
                        generation1.push({ x: now, y: 1 });
                        previousGen2 = diagnostics.gen2;
                        previousGen1 = diagnostics.gen1;
                        previousGen0 = diagnostics.gen0;
                    }
                    else if (previousGen0 < diagnostics.gen0) {
                        generation0.push({ x: now, y: 1 });
                        previousGen2 = diagnostics.gen2;
                        previousGen1 = diagnostics.gen1;
                        previousGen0 = diagnostics.gen0;
                    }

                    if (allocated.length > this.maxEntries) {
                        let firstDate = allocated[0].x;

                        allocated.shift();
                        workingSet.shift();

                        while (generation0.length > 0 && generation0[0].x < firstDate) generation0.shift();
                        while (generation1.length > 0 && generation1[0].x < firstDate) generation1.shift();
                        while (generation2.length > 0 && generation2[0].x < firstDate) generation2.shift();
                    }

                    memoryChart.update();
                });
        }, this.interval);
      },
      /**
       * khởi tạo giá trị ban đầu của chart
       * @author tmthuc
       */
      initializeChart() {
        const memoryContext = document.getElementById("memory-canvas").getContext('2d');
        this.memoryChart = new Chart(memoryContext, {
          type: 'line',
          data: {
            // Các cài đặt dữ liệu và dataset ở đây
            datasets: [
                    {
                        label: 'Allocated',
                        data: [],
                        yAxisID: 'y-axis-memory',
                        borderColor: 'red',
                        backgroundColor: 'red',
                        pointRadius: 0,
                        fill: false
                    },
                    {
                        label: 'Working Set',
                        data: [],
                        yAxisID: 'y-axis-memory',
                        borderColor: 'blue',
                        backgroundColor: 'blue',
                        pointRadius: 0,
                        fill: false
                    },
                    {
                        label: 'Gen 0',
                        data: [],
                        yAxisID: 'y-axis-collections',
                        borderColor: 'green',
                        backgroundColor: 'green',
                        fill: false,
                        showLine: false, // only show point
                        pointStyle: 'triangle',
                        pointRadius: 5

                    },
                    {
                        label: 'Gen 1',
                        data: [],
                        yAxisID: 'y-axis-collections',
                        borderColor: 'orange',
                        backgroundColor: 'orange',
                        fill: false,
                        showLine: false, // only show point
                        pointStyle: 'triangle',
                        pointRadius: 5

                    },
                    {
                        label: 'Gen 2',
                        data: [],
                        yAxisID: 'y-axis-collections',
                        borderColor: 'black',
                        backgroundColor: 'black',
                        fill: false,
                        showLine: false, // only show point
                        pointStyle: 'triangle',
                        pointRadius: 5
                    },
                    {
                        label: 'CPU',
                        data: []
                    },
                    {
                        label: 'RPS',
                        data: []
                    }
                ]
          },
          options: {
            // Các tùy chọn của biểu đồ ở đây
            responsive: true,
                scales: {
                    xAxes: [{
                        type: 'time',
                        distribution: 'linear',
                        time: {
                            unit: 'second',
                            displayFormats: {
                                second: 'mm:ss'
                            }
                        },
                        bounds: 'ticks',
                        ticks: {
                            callback: function (value, index, values) {
                                return index;
                            }
                        }
                    }],
                    yAxes: [{
                        id: 'y-axis-memory',
                        ticks: {
                            beginAtZero: true,
                            bounds: 'data',
                            position: 'left',
                            callback: function (value, index, values) {
                                return value + ' MB';
                            }
                        }
                    },
                    {
                        id: 'y-axis-collections',
                        display: false,
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                            max: 2
                        }
                    }]
                },
                tooltips: {
                    enabled: false
                }
          },
        });
      },
      fetchData() {
        fetch('https://localhost:44340/api/diagnostics')
          .then((response) => response.json())
          .then((diagnostics) => {
            const now = new Date();
            this.allocated.push({ x: now, y: diagnostics.allocated / 1000000 });
            this.workingSet.push({ x: now, y: diagnostics.workingSet / 1000000 });

            this.memoryChart.data.datasets[5].label = `CPU (${Math.round(
              diagnostics.cpu
            )}%)`;
            this.memoryChart.data.datasets[6].label = `RPS (${Math.round(
              diagnostics.rps / 1000
            )}K)`;

            if (this.previousGen2 < diagnostics.gen2) {
              this.generation2.push({ x: now, y: 1 });
              this.previousGen2 = diagnostics.gen2;
              this.previousGen1 = diagnostics.gen1;
              this.previousGen0 = diagnostics.gen0;
            } else if (this.previousGen1 < diagnostics.gen1) {
              this.generation1.push({ x: now, y: 1 });
              this.previousGen2 = diagnostics.gen2;
              this.previousGen1 = diagnostics.gen1;
              this.previousGen0 = diagnostics.gen0;
            } else if (this.previousGen0 < diagnostics.gen0) {
              this.generation0.push({ x: now, y: 1 });
              this.previousGen2 = diagnostics.gen2;
              this.previousGen1 = diagnostics.gen1;
              this.previousGen0 = diagnostics.gen0;
            }

            if (this.allocated.length > this.maxEntries) {
              const firstDate = this.allocated[0].x;

              this.allocated.shift();
              this.workingSet.shift();

              while (this.generation0.length > 0 && this.generation0[0].x < firstDate)
                this.generation0.shift();
              while (this.generation1.length > 0 && this.generation1[0].x < firstDate)
                this.generation1.shift();
              while (this.generation2.length > 0 && this.generation2[0].x < firstDate)
                this.generation2.shift();
            }

            this.memoryChart.data.datasets[0].data = this.allocated;
          this.memoryChart.data.datasets[1].data = this.workingSet;
          this.memoryChart.data.datasets[2].data = this.generation0;
          this.memoryChart.data.datasets[3].data = this.generation1;
          this.memoryChart.data.datasets[4].data = this.generation2;

            this.memoryChart.update();
          });
    },
     
     
    }
  }
</script>

<style scoped>
.container {
  width: 800px;
}
</style>
