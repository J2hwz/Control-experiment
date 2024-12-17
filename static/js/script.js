// var x = 0;

var time_step = 4000; // 4000 ms per step in the experiment
var timeout = 40; // Maximum number of steps per trial


var xclicked = false;
var yclicked = false; 
var zclicked = false;
var x = 0;
var y = 0;
var z = 0;


// OU network variables 
var xHist = [0];                // List of values X (int)
var yHist = [0];                // List of values Y (int)
var zHist = [0];                // List of values Z (int)

// var dt = 1;                          
var sigma = 5;                          
var theta = .5;
var causes = {
    'x': [0,0,0],
    'y': [1,0,0],
    'z': [0,0,1]
}

let sliderValues = []
const labels = [...Array(10).keys()]

// This function runs when the page loads, shows/hides sections of the html code
function start() {
    $('#instructions').hide();
    $('#experiment-task').show();

    set_sliders();
    setup_chart();
    setupInterface();
}

// Setup sliders to control variables using slider function in jquery
function set_sliders() {
    var generalConfig = {
        orientation: 'vertical',
        animate: 'fast',
        range: "min",
        min: -100,
        max: 100
    };

    // Slider X
    $("#slider-x").slider($.extend({}, generalConfig, {

        create: function(event, ui) { // When slider is created, set its value to x 
            $("#slider-x").slider("value", x);
        },

        // slide: function(event, ui) {
        //     x = parseInt($('#slider-x').slider("value"));
        //     xclicked = true;
        // }, 

        change: function(event, ui) { // Change value of x when participant stops dragging slider i.e. slider changes value
            x = parseInt($('#slider-x').slider("value"));
        }, 

        // When participant begins sliding the slider, disable slider y (only one slider can be used per timestep)
        start: function(event, ui) { 
            xclicked = true;
            $('#slider-y').slider('disable');
        }

    }));

    // Slider Y
    $("#slider-y").slider($.extend({}, generalConfig, {
        create: function(event, ui) { // When slider is created, set its value to x 
            $("#slider-y").slider("value", y);
        },

        // slide: function(event, ui) {
        //     y = parseInt($('#slider-y').slider("value")); // Record value on slide with function; Slide meaning that every integer move
        //     yclicked = true;
        // }, 
        
        change: function(event, ui) {
            y = parseInt($('#slider-y').slider("value"));
        }, 

        start: function(event, ui) {
            yclicked = true;
            $('#slider-x').slider('disable');
        },
    }));

    // Slider Z
    $("#slider-z").slider($.extend({}, generalConfig, { // Extend function applies 
        create: function(event, ui) {
            $("#slider-z").slider("value", z);
        },
        change: function(event, ui) {
            z = parseInt($('#slider-z').slider("value"));
        }
    }));
}


// function record_value(value) {
//     if (sliderValues.length > 10) {
//         sliderValues.shift();
//     } 

//     // update_output();
//     add_data(chart, value);
// }

// function update_output() {
//     $("#output").html(`Recorded Values: ${sliderValues.join(', ')}`);
// }

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
            labels: [0],
            datasets: [{
                label: "X", // X datapoints
                data: [0],
                tension: 0 // Disable line smoothing
            },
            {
                label: "Y", // Y datapoints
                data: [0],
                tension: 0 // Disable line smoothing
            },
            {
                label: "Z", // Z datapoints
                data: [0],
                tension: 0 // Disable line smoothing
            }
        ]
        },

        options: {   
            scales: {
                // yAxes: [{
                //     display: true,
                //     ticks: {
                //         suggestedMin: -100, // minimum will be 0, unless there is a lower value.
                //         suggestedMax: 100,
                //         beginAtZero: false // minimum value will be 0.
                //     }
                // }],
                x: {
                    title: {
                        display: true,
                        text: 'Steps'
                    }
                },
                y: {
                    suggestedMin: -100, 
                    suggestedMax: 100,
                    beginAtZero: true
                }
            }
        }

        // TODO: Add reward area shading and change size depending on experimental condition 
    })
}

function setupInterface() {

    // Conditions
    // $('.condition_container').css({
    //     'display': 'none'
    // });

    // Sliders
    $('#slider-x').slider('disable');
    $('#slider-y').slider('disable');
    $('#slider-z').slider('disable');

    // Buttons
    //$('#task_next_round_btn').hide();
    // $('#task_cont_btn').hide();
    // $('#causal_query_btn').hide();

    // $("#countdown").html("Steps: 0/" + timeout);

    //Setup start button
    $('#start_button').click(function () {
        console.log('Game began');
        $('#start_button').hide();
        $('#slider-x').slider('enable');
        $('#slider-y').slider('enable');
        count = 0;

        record(x, y, z)

        // Record data - 0th Step
        // record(x, y, z, xclicked, yclicked, zclicked, 0, false, condition_count, condition, counter_balance_order[condition_count], Number(bonus), 1);
        
        // Main game loop is here
        interval = setInterval(Step, time_step)
    })
}

function Step() {
            
    // Advance Count
    count = count + 1;

    // Advance CDC Task while count <= timeout
    if (count <= timeout){

        // Step of OU process
        ouNetwork();
        var new_step = count;
        
        // Visualise data on chart  
        add_data(chart, new_step, [x, y, z]);

        // Remove data if too much is plotted here max datapoints is
        // if (chart.data.datasets[0].data.length > 15/dt) {
        //     removeData(chart);
        // }

        // // Visualise countdown
        // if ((timeout-count) % (1000/time_step) === 0) {
        //     $("#countdown").html("Steps: " + count  + "/" + timeout);
        // }

        // Visualise score (increase if target in range)
        // var reward = false;
        // if (z <= (reward_centre + reward_width) && z >= (reward_centre - reward_width)) {       
        //     score++;
        //     reward = true;

        //     if (bonus < 1.48) {
        //         bonus = (2* score * bonus_pay / (n_conditions * timeout)).toFixed(2);
        //     } else {
        //         bonus = (1.50).toFixed(2);
        //     };
        //     $("#score_display").html("<b><font color=#D4AF37>Bonus Pay: £"+bonus+"</font></b>");
        // }
        
        // Record whether participant had the tab open or closed
        // if (document.hasFocus()) {
        //     var focus = 1
        // } else {
        //     var focus = 0
        // }

        // Record data
        record(x, y, z);
        // Other variables for record function: xclicked, yclicked, zclicked, new_step, reward, condition_count, condition,counter_balance_order[condition_count], Number(bonus), focus
        //console.log(x, y, z, xclicked, yclicked, zclicked, new_step, reward, condition_count, condition,counter_balance_order[condition_count],Number(bonus), focus);
    }

    // Set xclicked (yclicked, zclicked) to false after ouNetwork() and data recording
    xclicked = false;
    yclicked = false;
    // zclicked = false;

    // Enable Sliders (previous, action disabled one of the two sliders)
    $('#slider-x').slider('enable');
    $('#slider-y').slider('enable');

    // Stop game at timeout
    if (count > timeout){
        //Reset Task
        $('#slider-x').slider('disable');
        // $('#causal_query_btn').show();
    }
}

function add_data(chart, step_count, new_data) {
    chart.data.labels.push(round(step_count, 1)); // Add step count on x-axis
    chart.data.datasets.forEach((dataset, index) => { // Add x, y, z data for each index in the list
        dataset.data.push(new_data[index]);
    });
    chart.update();
}



// OU Network Computation
/////////////////////////

// Ou Network value updates
function ouNetwork() {
    // Logic for the OU Network
    var $sliders = $('.slider');

    // Compute new value for each slider 
    $sliders.each(function(index, element) { // Do for each of the variables 
        var $slider = $(element);
        var var_name = $slider.attr('id').slice(-1);
        
        if ((var_name=='x' && xclicked==true) || (var_name=='y' && yclicked==true)) {
            var new_value = parseInt($slider.slider('value')); // If either x or y slider is clicked during that step, retain that value, else apply ou increment on other values
        } else {
            mean_attractor = attractor(var_name, causes);
            var new_value = ouIncrement(var_name, sigma, theta, mean_attractor); // ouIncrement(old_value, sigma, dt, theta, mean_attractor);
        }

        if (new_value > 100) {
            new_value = 100;
        } else if (new_value < -100) {
            new_value = -100;
        }

        $slider.slider("value", new_value);
    })}

// Helper: Compute attractor value 
function attractor(variable_name, causes) {
    var coefs = causes[variable_name];
    var last_step = count - 1

    // Compute x,y,z attractor values
    var x_att = xHist[last_step]*coefs[0];
    var y_att = yHist[last_step]*coefs[1];
    var z_att = zHist[last_step]*coefs[2];

    return x_att + y_att + z_att;
}

// Helper: Compute OU update for a variable
function ouIncrement(variable_name, attractor) {
    var last_step = count - 1;

    if (variable_name == 'x') {
        return xHist[last_step] + theta*(attractor-xHist[last_step]) + sigma*normalRandom();
    } else if (variable_name == 'y') {
        return yHist[last_step] + theta*(attractor-yHist[last_step]) + sigma*normalRandom();
    } else {
        return zHist[last_step] + theta*(attractor-zHist[last_step]) + sigma*normalRandom();
    }
}

// --- Data recording for plot and data base --- //
function record(x, y, z) {
    // Other variables: int_x, int_y, int_z, new_step, reward, condition_count, condition, group, bonus, focus

    //Graph
    xHist.push(x);
    yHist.push(y);
    zHist.push(z);

    // Add interventions (which variable clicked during timestep)
    // xInter.push(+ int_x);
    // yInter.push(+ int_y);
    // zInter.push(+ int_z);

    // //Trial Data
    // trial_data.x_val.push(x);
    // trial_data.y_val.push(y);
    // trial_data.z_val.push(z);
    // trial_data.x_act.push(+ int_x);
    // trial_data.y_act.push(+ int_y);
    // trial_data.z_act.push(+ int_z);
    // trial_data.step_counter.push(new_step);
    // trial_data.rewards.push(reward);
    // trial_data.condition_order.push(condition_count);
    // trial_data.condition.push(condition);
    // trial_data.group.push(group);
    // trial_data.cum_bonus.push(bonus);
    // trial_data.has_focus.push(focus);
}












// Math stuff

// --- Normal distribution and math functions --- //
// https://gist.github.com/bluesmoon/7925696

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);}

var spareRandom = null;

function normalRandom() {
	var val, u, v, s, mul;

	if(spareRandom !== null)
	{
		val = spareRandom;
		spareRandom = null;
	}
	else
	{
		do
		{
			u = Math.random()*2-1;
			v = Math.random()*2-1;

			s = u*u+v*v;
		} while(s === 0 || s >= 1);

		mul = Math.sqrt(-2 * Math.log(s) / s);

		val = u * mul;
		spareRandom = v * mul;
	}
	return val;
}

function normalRandomInRange(min, max) {
	var val;
	do
	{
		val = normalRandom();
	} while(val < min || val > max);
	
	return val;
}

function normalRandomScaled(mean, stddev){
	var r = normalRandom();

	r = r * stddev + mean;

    //return Math.round(r);
    // returns non rounded float
    return r;
}

function lnRandomScaled(gmean, gstddev){
	var r = normalRandom();

	r = r * Math.log(gstddev) + Math.log(gmean);

	return Math.round(Math.exp(r));
}