// var x = 0;

let sliderValues = []
const labels = [...Array(10).keys()]

// This function runs when the page loads, shows/hides sections of the html code
function start() {
    $('#instructions').hide();
    $('#experiment-task').show();

    set_sliders();
    setup_chart();
}

// Setup sliders to control variables
function set_sliders() {
    // This is the slider function from jquery-ui package
    $("#slider-x").slider({
        // create: function() { // This event is triggered when slider is created, sets the initial value of slider to x (preset = 0)
        //     $("#slider_x").slider("value", x) 
        // };
        
        // min: 0,
        // max: 50,
        // value: 25, // Initial slider value

        orientation: "vertical",
        animate: "fast",
        range: "min",
        min: 0, 
        max: 50,
        value: 25,

        // slide: function(event, ui) {
        //     record_value(ui.value); // Record value on slide with function; Slide meaning that every integer move
        // }, 
        change: function(event, ui) {
            record_value(ui.value); // Record value on change with function; Change meaning when you the value where you stop clicking the slider
        }
    });

    $("#slider-y").slider({
        orientation: "vertical",
        animate: "fast",
        range: "min",
        min: 0, 
        max: 50,
        value: 25,
    });

    // var $sliders = $(".slider");

    // $sliders.slider({
    //     orientation: "vertical",
    //     animate: "fast",
    //     range: "min",
    //     min: 0, 
    //     max: 50,
    //     value: 25,
    // });
}

function record_value(value) {
    if (sliderValues.length > 10) {
        sliderValues.shift();
    } 

    update_output();
    add_data(chart, value);
}

function update_output() {
    $("#output").html(`Recorded Values: ${sliderValues.join(', ')}`);
}

function setup_chart() {
    var canvas_html = "<canvas id='progress-chart'></canvas>";
    $(".chart-container").html(canvas_html); // Replacing the chart-container div with a chart from chart.js
    // Have to ask Neil why this is needed
    var ctx = document.getElementById("progress-chart").getContext("2d") // Fetches a 2D drawing context of the newly created canvas element

    chart = new Chart(ctx, {
        // Type of chart: Line chart
        type: "line",

        // Data 
        data: {
            labels: labels,
            datasets: [{
                label: "User input",
                data: sliderValues,
                tension: 0
            }]
        },

        options: {   
            scales: {
                y: {
                    suggestedMin: 0, 
                    suggestedMax: 50,
                    beginAtZero: true
                }
            }
        }
    })
}

function add_data(chart, new_data) {
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(new_data);
    });
    chart.update();
}







function redirect() {
    window.location.href = "https://theuselessweb.com/";
}



