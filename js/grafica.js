   document.addEventListener('DOMContentLoaded', function() {
        const ctx = document.getElementById('myPieChart').getContext('2d');
        const myPieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Factura', 'Servicios', 'Recibos del Hogar', 'Microgasto'],
                datasets: [{
                    data: [10, 20, 30, 40],  // Replace with your data
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50'],
                    hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.label + ': ' + tooltipItem.raw + '%';
                            }
                        }
                    }
                }
            }
        });
    });

