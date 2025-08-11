const ctxy = document.getElementById('stackedbarchart').getContext('2d');
const stackedbarchart = new Chart(ctxy, {
  type: 'bar',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Data 1',
        data: [100, 150, 200, 180, 220, 170],
        backgroundColor: 'rgba(142, 167, 83, 1)',
        borderColor: 'rgba(230, 230, 231, 1)',
        borderWidth: 1,
        borderRadius: 20
      },
      {
        label: 'Data 2',
        data: [90, 140, 190, 170, 210, 160],
        backgroundColor: 'rgba(240, 213, 78, 1)',
        borderColor: 'rgba(230, 230, 231, 1)',
        borderWidth: 1,
        borderRadius: 20
      },
      {
        label: 'Data 3',
        data: [80, 130, 180, 160, 200, 150],
        backgroundColor: 'rgba(67, 147, 142, 1)',
        borderColor: 'rgba(230, 230, 231, 1)',
        borderWidth: 1,
        borderRadius: 20
      },
      {
        label: 'Data 4',
        data: [70, 120, 170, 150, 190, 140],
        backgroundColor: 'rgba(44, 47, 91, 1)',
        borderColor: 'rgba(230, 230, 231, 1)',
        borderWidth: 1,
        borderRadius: 20
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Stacked Bar Chart with Rounded Corners'
      }
    },
    scales: {
      x: {
        stacked: true
      },
      y: {
        beginAtZero: true,
        stacked: true
      }
    }
  }
});