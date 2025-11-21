import updateLiveChart from "./liveChartData.js";
import showPastChart from "./pastChartData.js";
import { getLivePatient } from '../currentPatient.js';
import getDisplayText from '../displayText.js';

document.getElementById('display-message').innerHTML = getDisplayText('Sleep');

let chart = new Chart(document.getElementById("chart"), {
  type: "line",
  data: {
    datasets: [{
      label: "Sleep Log",
      borderColor: "red",
      borderWidth: 2,
      backgroundColor: "rgba(255, 0, 0, 0.2)",
      fill: false,
      tension: 0.5,
      pointRadius: 0,
      pointHoverRadius: 5
    }]
  },
  options: {
    responsive: true,
    animation: true,
    plugins: {
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context) {
            return `Movement: ${context.parsed.y} m/s²`;
          }
        }
      },
      legend: {
        display: true,
        position: "top"
      }
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "minute",
          tooltipFormat: "HH:mm:ss",
          displayFormats: {
            minute: "HH:mm"
          }
        },
        title: {
          display: true,
          text: "Time"
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10
        }
      },
      y: {
        title: {
          display: true,
          text: "Movement (m/s²)"
        },
      }
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false
    }
  }
});

if (getLivePatient() === 'true') {
  updateLiveChart(chart, "acc");
} else {
  showPastChart(chart, "acc");
}