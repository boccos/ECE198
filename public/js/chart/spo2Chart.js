import updateLiveChart from "./liveChartData.js";
import showPastChart from "./pastChartData.js";
import { getLivePatient } from '../currentPatient.js';
import getDisplayText from '../displayText.js';

function getGridColor() {
  return getComputedStyle(document.body)
    .getPropertyValue('--grid-line-color')
    .trim();
}

document.getElementById('display-message').innerHTML = getDisplayText('Blood Oxygen Level');

let chart = new Chart(document.getElementById("chart"), {
  type: "line",
  data: {
    datasets: [{
      label: "Blood Oxygen Level",
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
            return `SpO₂: ${context.parsed.y} %`;
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
        },
        grid: {
          color: getGridColor()
        }
      },
      y: {
        title: {
          display: true,
          text: "SpO₂ (%)"
        },
        grid: {
          color: getGridColor()
        }
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
  updateLiveChart(chart, "spO2");
} else {
  showPastChart(chart, "spO2");
}
