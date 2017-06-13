

window.onload = function(req, res) {
    displayAllCharts(polls);
}

function displayAllCharts(polls) {
    console.log(polls);
    polls.forEach(function(poll) {
        displayChart(poll);
    });
}

function displayChart(poll) {
    var ctx = document.getElementById(poll.id).getContext('2d');
    var chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(poll.votes),
            datasets: [{
                label: "Favourite Month",
                backgroundColor: ['#C0392B', '#2980B9', '#1ABC9C', '#F1C40F', '#E67E22', '#D35400', '#78281F', '#1B4F72', '#0B5345', '#784212'],
                data: Object.values(poll.votes),
            }]
        },
        options: {}
    });
}

