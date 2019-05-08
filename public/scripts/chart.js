$(document).ready(function(){
  var timeFormat = 'DD/MM/YYYY';
  var ctx = document.getElementById("myChart");
  var chart = new Chart(ctx, {
        type:    'line',
        data:    {
            datasets: [
                {
                    label: "US Dates",
                    data: [{
                        x: "04/01/2014", y: 175
                    }, {
                        x: "10/01/2014", y: 175
                    }, {
                        x: "04/01/2015", y: 178
                    }, {
                        x: "10/01/2015", y: 178
                    }],
                    fill: false,
                    borderColor: 'red'
                },
                {
                    label: "UK Dates",
                    data:  [{
                        x: "01/04/2014", y: 175
                    }, {
                        x: "01/10/2014", y: 175
                    }, {
                        x: "01/04/2015", y: 178
                    }, {
                        x: "01/10/2015", y: 178
                    }],
                    fill:  false,
                    borderColor: 'blue'
                }
            ]
        },
        options: {
            responsive: true,
            title:      {
                display: true,
                text:    "Chart.js Time Scale"
            },
            scales:     {
                xAxes: [{
                    type:       "time",
                    time:       {
                        format: timeFormat,
                        tooltipFormat: 'll'
                    },
                    scaleLabel: {
                        display:     true,
                        labelString: 'Date'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display:     true,
                        labelString: 'value'
                    }
                }]
            }
        }
    })

});
