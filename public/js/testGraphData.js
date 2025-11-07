(async function() {
  const data = [
    { x: 0, y: 10 },
    { x: 0.1, y: 20 },
    { x: 0.2, y: 15 },
    { x: 0.3, y: 25 },
    { x: 0.4, y: 22 },
    { x: 0.5, y: 30 },
    { x: 0.6, y: 28 },
  ];

  new Chart(
    document.getElementById('testGraphData'),
    {
      type: 'line',
      data: {
        labels: data.map(row => row.x),
        datasets: [
          {
            label: 'Label Here',
            data: data.map(row => row.y)
          }
        ]
      }
    }
  );
})();
 