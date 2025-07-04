
document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('myDoughnutChart').getContext('2d');
    const data = [25, 40, 12, 7, 16]; // Percentage data
    const colors = [
        'rgba(142, 167, 83, 1)', // Red
        'rgba(240, 213, 78, 1)', // Yellow
        'rgba(67, 147, 142, 1)', // Green
        'rgba(44, 47, 91, 1)', // Blue
        'rgba(213, 33, 36, 1)'  // Purple
    ];
    const labels = ['Data 1', 'Data 2', 'Data 3', 'Data 4', 'Data 5'];

    const myDoughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Percentage',
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('0.6', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    enabled: true
                },
                datalabels: {
                    color: '#fff',
                    textAlign: 'center',
                    font: {
                        weight: 'bold'
                    },
                    formatter: (value, ctx) => {
                        return value + '%';
                    }
                }
            }
        },
        plugins: [ChartDataLabels] // Enable the data labels plugin globally
    });

    // Fill the table with data
    const tbody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    labels.forEach((label, index) => {
        const row = tbody.insertRow();
        const cellColor = row.insertCell();
        const cellPercentage = row.insertCell();
        
        const colorBox = document.createElement('span');
        colorBox.classList.add('color-box');
        colorBox.style.backgroundColor = colors[index];
        cellColor.appendChild(colorBox);
        
        cellPercentage.textContent = data[index] + '%';
    });
});