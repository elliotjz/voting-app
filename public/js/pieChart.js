
function displayChart() {
    console.log("chart loading");

    var ctx = document.getElementById('myChart').getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'doughnut',

        // The data for our dataset
        data: {
            labels: ["January", "February", "March", "April", "May", "June", "July"],
            datasets: [{
                label: "Favourite Month",
                backgroundColor: ['#C0392B', '#2980B9', '#1ABC9C', '#F1C40F', '#E67E22', '#D35400', '#78281F', '#1B4F72', '#0B5345', '#784212'],
                data: [4, 10, 5, 2, 20, 30, 45],
            }]
        },

        // Configuration options go here
        options: {}
    });
  }