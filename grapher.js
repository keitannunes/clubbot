const fs = require("fs");
const QuickChart = require('quickchart-js');
const axios = require("axios");

getChart = async (userID, guildID) => {
    const file = fs.readFileSync('views/dmoj.json');
    const json = JSON.parse(file.toString());
    let labels = [];
    let data = [];
    for (const date in json.guilds[guildID][userID].points) {
        labels.push(new Date(date));
        data.push(json.guilds[guildID][userID].points[date]);
    }

    const myChart = new QuickChart();
    myChart
        .setConfig({
            "type": "line",
            "data": {
                "labels": labels,
                "datasets": [
                    {
                        "label": "My First dataset",
                        "backgroundColor": "rgba(255, 99, 132, 0.5)",
                        "borderColor": "rgb(255, 99, 132)",
                        "fill": false,
                        "data": data
                    }
                ]
            },
            "options": {
                "scales": {
                    "xAxes": [{
                        "type": "time",
                        "time": {
                            "parser": "MM/DD/YYYY HH:mm",
                            "unit": "day",
                            displayFormats: {
                                quarter: 'MMM YYYY'
                            }

                        },
                        "scaleLabel": {
                            "display": true,
                            "labelString": "Date"
                        }

                    }],
                    "yAxes": [{
                        "scaleLabel": {
                            "display": true,
                            "labelString": "Points"
                        }
                    }]
                },
                "title": {
                    "align": "end",
                    "display": true,
                    "position": "top",
                    "text": `${json.guilds[guildID][userID].name}'s points`
                },
                "legend": {
                    "display": false
                },
            }
        })
        .setWidth(800)
        .setHeight(400)
        .setBackgroundColor('white');

    return myChart.getUrl()
};

module.exports = {getChart};