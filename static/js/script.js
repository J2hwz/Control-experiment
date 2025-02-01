// TODO
// Add instructions 
// Differentiate between training and testing rounds 
// Maybe remove larger circle when z variable is in reward region
// CSS styling
// Decide how to make control more difficult: By manipulating connection strength or amount of noise added


// Trial variables
var n_trials = 6;
var order_all = [1,2,3,4,5,6]; 
var n_interventions = 0

// Counterbalance variables
var counter_balance = ["A", "B"];
var counter_balance_order = [];

// Condition variables 
var conditions = ["P", "Q", "R", "S"];

// Task variables
var time_step = 100; 
var timeout = 40; // Maximum number of steps per trial
var trial_score = 0; // Score for each trial (successful control)
var total_score = 10; // Start with 10 so they can make at least 10 interventions without going into the negative


// Slider variables
var xclicked = false;
var yclicked = false; 
var zclicked = false;
var x = 0;
var y = 0;
var z = 0;

// Chart variables
var reward_centre = 50; // Centre of shaded reward region
var reward_width = 10; // 1/2 width of shaded reward region
var shade_colour = 'rgb(157, 212, 55, .5)';
var n_datapoints = 15; // Maximum number of datapoints to be plotted

// OU network variables 
var xHist = [0]; // List of values X (int)
var yHist = [0]; // List of values Y (int)
var zHist = [0]; // List of values Z (int)
                        
var sigma = 5; // Amount of noise added to system                     
var theta = .5; // How strong the connections are 
var causes = {
    'x': [0,0,0],
    'y': [0,0,0],
    'z': [0,0,0]
}

// Causal Query variables
var selected_structure = null; // To track selected structure for each trial


// Causal graph presets
var presets = {
    'Reg': {
        'x': [0, 0, 0],
        'y': [0, 0, 0],
        'z': [1, -1, 0]
    },
    'Inv': {
        'x': [0, 0, 0],
        'y': [0, 0, 0],
        'z': [-1, 0, 0]
    },
    'Common_2': {
        'x': [0, 0, 0],
        'y': [-1, 0, 0],
        'z': [-1, 1, 0]
    },
    'Common_2_B': {
        'x': [0, -1, 0],
        'y': [0, 0, 0],
        'z': [1, -1, 0]
    },
    'Chain_2': {
        'x': [0, -1, 0],
        'y': [0, 0, 0],
        'z': [-1, 0, 0]
    },
    'Chain_2_B': {
        'x': [0, 0, 0],
        'y': [-1, 0, 0],
        'z': [0, -1, 0]
    },
    'Common_3': {
        'x': [0, 1, 0],
        'y': [0, 0, 0],
        'z': [-1, -1, 0]
    },
    'Common_3_B': {
        'x': [0, 0, 0],
        'y': [1, 0, 0],
        'z': [-1, -1, 0]
    },
    'ChainFeed_5': {
        'x': [0, -1, 1],
        'y': [0, 0, 0],
        'z': [-1, 0, 0]
    },
    'ChainFeed_5_B': {
        'x': [0, 0, 0],
        'y': [-1, 0, 1],
        'z': [0, -1, 0]
    },
    'ChainFeed_2': {
        'x': [0, 0, 1],
        'y': [0, 0, 0],
        'z': [-1, -1, 0]
    },
    'ChainFeed_2_B': {
        'x': [0, 0, 0],
        'y': [0, 0, 1],
        'z': [-1, -1, 0]
    },
    'CommonFeed_1': {
        'x': [0, -1, -1],
        'y': [0, 0, 0],
        'z': [-1, -1, 0]
    },
    'CommonFeed_1_B': {
        'x': [0, 0, 0],
        'y': [-1, 0, -1],
        'z': [-1, -1, 0]
    }
}



// ---------------- Main navigation functions ---------------- //

// This function runs when the page loads, shows/hides sections of the html code
function start() {
    $('#instructions').show();
    $('#experiment-trial').hide();
    $('#trial_score').hide();

    // Buttons for testing (skip explanations)
    $('#straight_to_task').click(function () { 
        console.log('STARTING TASK');   
        goto_task();
    }); 

    setup_task();
}

// Go to main task
function goto_task() {
    $('#instructions').hide();
    $('#experiment-trial').show();
    $('#trial_score').hide();

    // Set up Experimental Conditions
    trial = order[trial_count]; // Call the first causal graph condition 
    load_graph(trial); // Load the assigned condition
    // load_graph(1) // To set specific trial to be loaded
    
    // Update score display
    $("#step_score_display").html("<b>Score: " + total_score + "</b>");

    // $("#condition_display").html("Round: " + (condition_count+1) + "/" + n_conditions);
}

// Go to score slide after each trial
function goto_score() {
    $('#instructions').hide();
    $('#experiment-trial').hide();
    $('#trial_score').show();

    // Calculate total score and change display
    $("#total_score_display").html("<b>Total score: " + total_score + "</b>");
}

// Initial setup of the experimental task
function setup_task() {

    // Initialise the trial_count
    trial_count = 0;

    // Randomise array containing trial order
    order = ex_randomiser(order_all);

    // Hide slider Z that participants shouldn't control
    // $("#slider-z").hide();  

    // Randomly choose condition and setup
    setup_condition();

    // Setup slider positions 
    set_sliders();

    // Setup reward area on slider Z
    set_reward_area();

    // Setup chart and variables 
    setup_chart();

    // Setup interface logic 
    setup_interface();
}



// -------- Functions to reset chart and sliders between trials -------- //

// Load graph for each trial count 
function load_graph(graph) {

    // Counterbalancing 
    var random_counter_balance = counter_balance[Math.floor(Math.random() * counter_balance.length)];
    counter_balance_order.push(random_counter_balance);

    if (graph == 1 && random_counter_balance == "A"){
        update_model('Common_2');
        console.log('Graph 1A');
    } else if (graph == 2 && random_counter_balance == "A"){
        update_model('Chain_2');
        console.log('Graph 2A');
    } else if (graph == 3 && random_counter_balance == "A"){
        update_model('Common_3');
        console.log('Graph 3A');
    } else if (graph == 4 && random_counter_balance == "A"){
        update_model('ChainFeed_5');
        console.log('Graph 4A');
    } else if (graph == 5 && random_counter_balance == "A"){
        update_model('ChainFeed_2');
        console.log('Graph 5A');
    } else if (graph == 6 && random_counter_balance == "A"){
        update_model('CommonFeed_1');
        console.log('Graph 6A');
    } else if (graph == 1 && random_counter_balance == "B"){
        update_model('Common_2_B');
        console.log('Graph 1B');
    } else if (graph == 2 && random_counter_balance == "B"){
        update_model('Chain_2_B');
        console.log('Graph 2B');
    } else if (graph == 3 && random_counter_balance == "B"){
        update_model('Common_3_B');
        console.log('Graph 3B');
    } else if (graph == 4 && random_counter_balance == "B"){
        update_model('ChainFeed_5_B');
        console.log('Graph 4B');
    } else if (graph == 5 && random_counter_balance == "B"){
        update_model('ChainFeed_2_B');
        console.log('Graph 5B');
    } else {
        update_model('CommonFeed_1_B');
        console.log('Graph 6B');
    }
}

// Helper: Update causal model with the selected preset 
function update_model(preset) {
    causes = presets[preset];

    // var presetValues = presets[preset];

    // Set Causal Graph Values
    // causes['X'] = presetValues.slice(0, 3);
    // causes['Y'] = presetValues.slice(3, 6);
    // causes['Z'] = presetValues.slice(6, 9);
    // var presetLabels = presetValues.slice(9);

    // Set Slider Label
    // $('#x_label').html('');
    // $('#y_label').html('');
    // $('#z_label').html('');

    // Set Slider Handle Label
    // $('#custom-handle-1').html(presetLabels[0]);
    // $('#custom-handle-2').html(presetLabels[1]);
    // $('#custom-handle-3').html(presetLabels[2]);

    // Set Chart Lable
    setup_chart();

    // if (presetLabels[1] == 'B') {
    //     $('.graph-pred-rec-right').css('visibility', 'hidden');
    //     $('#custom-handle-1, #custom-handle-2, #custom-handle-3').css({
    //         'line-height': '3em',
    //         'font-size': 'smaller'
    //     });
        
    // } else {
    //     $('.graph-pred-rec-right').css('visibility', 'visible');
    //     $('#custom-handle-1, #custom-handle-2, #custom-handle-3').css({
    //         'line-height': '1.5em',
    //         'font-size': 'smaller'
    //     });
    // };
}


// --------------- Setup trials functions --------------- //

function setup_condition(){
    condition = conditions[Math.floor(Math.random() * conditions.length)];

    if (condition == "P"){
        // Low reward saliency, high control

    } else if (condition == "Q"){
        // Low reward saliency, low control
        // theta = .3 
        sigma = 2;
    } else if (condition == "R"){
        // High reward saliency, high control
        reward_width = 20;
    } else {
        // High reward saliency, low control
        reward_width = 20;
        // theta = .3
        sigma = 2;
    }

    console.log(condition, theta, reward_width, sigma);
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

        slide: function(event, ui) {
            x = parseInt($('#slider-x').slider("value"));
            xclicked = true;
        }, 

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

        slide: function(event, ui) {
            y = parseInt($('#slider-y').slider("value")); // Record value on slide with function; Slide meaning that every integer move
            yclicked = true;
        }, 
        
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
        
        slide: function(event, ui) {
            return false; // Make it so that participants can't interact with slider Z
        },

        change: function(event, ui) {
            z = parseInt($('#slider-z').slider("value"));
        },
    }));

    $("#slider-z").slider({
        range: false
    })
}

// Setup reward region on slider (Taken from Btesh's Dynamic Control Example)
function set_reward_area() {
    // $('#reward-area').remove()
    // $('#reward-counter-handle').remove()

    var rewardArea = $('<div id="reward-area" class="ui-slider-range ui-corner-all ui-widget-header"></div>')
    // var rewardHandle = $('<span id="reward-counter-handle" class="reward-counter" style="font-family: Arial, Helvetica, sans-serif;">0</span>')
    rewardArea.css({
        "bottom": `${(reward_centre - reward_width + 100) * 0.5}%`,
        "height": `${reward_width}%`,
        // "bottom": `50%`,
        // "height": `20%`, 
        "background-color": shade_colour,
    })
    $(`#slider-handle-z`).after(rewardArea)
    // $(`#custom-handle-${variableIdx}`).html(rewardHandle)
}

function setup_chart() {
    var canvas_html = "<canvas id='progress-chart'></canvas>";
    $(".chart-container").html(canvas_html); // Replacing the chart-container div with a chart from chart.js
    // Have to ask Neil why this is needed
    var ctx = document.getElementById("progress-chart").getContext("2d") // Fetches a 2D drawing context of the newly created canvas element

    Chart.defaults.font.size = 18; // Changing default size of all fonts in the chart


    chart = new Chart(ctx, {
        // Type of chart: Line chart
        type: "line",

        // Data 
        data: {
            labels: [0],
            datasets: [{
                label: "X", // X datapoints
                data: [0],
                tension: 0, // Disable line smoothing
                pointRadius: 4,
                borderColor: 'rgb(140, 140, 255)',
                backgroundColor: 'rgb(140, 140, 255)',
                pointBackgroundColor: 'rgb(0, 0, 255)',
                fill: false
            },
            {
                label: "Y", // Y datapoints
                data: [0],
                tension: 0, // Disable line smoothing
                pointRadius: 4,
                borderColor: 'rgb(255, 140, 140)',
                backgroundColor: 'rgb(255, 140, 140)',
                pointBackgroundColor: 'rgb(255, 0, 0)',
                fill: false
            },
            {
                label: "Z", // Z datapoints
                data: [0],
                tension: 0, // Disable line smoothing
                pointRadius: function(context) {
                    var index = context.dataIndex;
                    var value = context.dataset.data[index];
                    var rew_min = reward_centre - reward_width;
                    var rew_max = reward_centre + reward_width;

                    if (value >= rew_min && value <= rew_max) {
                        return 7; // Bigger radius for points inside shaded range
                    } else {
                        return 4; // Same point radius as X or Y otherwise
                    }
                },
                borderColor: 'rgb(151, 240, 151)',
                backgroundColor: 'rgb(151, 240, 151)',
                pointBackgroundColor: 'rgb(30, 174, 30)',
                fill: false
            }
        ]
        },

        options: {   
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Steps',
                    }
                },
                y: {
                    suggestedMin: -100, 
                    suggestedMax: 100,
                    beginAtZero: false
                },
            },

            plugins: {    
                // Adding shading for reward area 
                annotation: {
                    annotations: {
                        box1: {
                            type: 'box',
                            yMin: reward_centre - reward_width,
                            yMax: reward_centre + reward_width,
                            borderWidth: 0,
                            backgroundColor: shade_colour,
                        }
                    }
                }
            }
        }
    })
}

function setup_interface() {

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
    $('#view_score_button').hide();

    // $("#countdown").html("Steps: 0/" + timeout);

    //Setup start button
    $('#start_button').click(function () {
        console.log('Game began');
        $('#start_button').hide();
        $('#slider-x').slider('enable');
        $('#slider-y').slider('enable');
        $('#slider-z').slider('enable');

        count = 0;

        record(x, y, z)

        // Record data - 0th Step
        // record(x, y, z, xclicked, yclicked, zclicked, 0, false, condition_count, condition, counter_balance_order[condition_count], Number(bonus), 1);
        
        // Main game loop is here
        interval = setInterval(step, time_step)
    });

    // If view score button is clicked 
    $('#view_score_button').click(function() {
        $('#next_trial_button').show();

        goto_score();
    });

    // If next trial button on the score display is clicked 
    $('#next_trial_button').click(function() {
        $('#next_trial_button').hide();

        //Initialise New Condition or move on
        if (trial_count < (n_trials - 1)){
            initialise_next_trial();
        } else {
            // $('#next_rnd_btn').hide();
            // alert('You have completed the tasks! Press "Continue" to move to the debrief section.')
            // $('#task_cont_btn').show();
        }
    });
}

// Main game loop
function step() {
            
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
        if (chart.data.datasets[0].data.length > n_datapoints) {
            removeData(chart);
        }

        // Update amount of interventions 
        if (xclicked == true || yclicked == true) {
            total_score--; // Deduct total score by 1 for each intervention 
            n_interventions++; // Add 1 to number of interventions for this trial

            $("#intervention_display").html("<b>You moved the sliders " + n_interventions + " times.</b>");
        }

        // Visualise score (increase if target in range)
        var reward = false;
        if (z <= (reward_centre + reward_width) && z >= (reward_centre - reward_width)) {       
            total_score += 3; // Add 3 points to total score
            trial_score += 3; // Keep track of amount scored during this trial
             
            reward = true;

            // if (bonus < 1.48) {
            //     bonus = (2* score * bonus_pay / (n_conditions * timeout)).toFixed(2);
            // } else {
            //     bonus = (1.50).toFixed(2);
            // };
            $("#trial_score_display").html("<b>Points scored in previous round: " + trial_score + "</b>");
        }

        // Visualise countdown
        if ((timeout - count) % (1000/time_step) === 0) { // Original Code
            // if (count <= timeout) {
            $("#step_score_display").html("<b>Score: " + total_score + "</b>");
            $("#step_countdown_display").html("<i>Steps: " + count  + "/" + timeout + "</i>");
        }
        
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
        $('#slider-y').slider('disable');
        $('#view_score_button').show();
    }
}

// Add data to chart for each step
function add_data(chart, step_count, new_data) {
    chart.data.labels.push(round(step_count, 1)); // Add step count on x-axis
    chart.data.datasets.forEach((dataset, index) => { // Add x, y, z data for each index in the list
        dataset.data.push(new_data[index]);
    });
    chart.update();
}

// Remove old datapoints from chart if too many plotted
function removeData(chart) {
    chart.data.labels.shift();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.shift();
    });
    chart.update();
}

//------------ OU Network Computation ------------//

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
            var new_value = ouIncrement(var_name, mean_attractor); // ouIncrement(old_value, sigma, dt, theta, mean_attractor);
        }

        // No values above 100 or below -100
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
    var last_step = count - 1; 

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
        // console.log(theta*(attractor-xHist[last_step]));
        return xHist[last_step] + theta*(attractor-xHist[last_step]) + sigma*normalRandom();
    } else if (variable_name == 'y') {
        // console.log(theta*(attractor-yHist[last_step]));
        return yHist[last_step] + theta*(attractor-yHist[last_step]) + sigma*normalRandom();
    } else {
        // console.log(theta*(attractor-zHist[last_step]));
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



// Function to handle image selection
function select_structure(imageId) {
  // Clear all image selections
  const images = document.querySelectorAll('.image_container img');
  images.forEach(img => img.classList.remove('selected'));

  // Highlight the newly selected image
  selectedImage = imageId;
  document.getElementById(`img${imageId}`).classList.add('selected');

  // Enable the radio buttons
  document.getElementById('regular').disabled = false;
  document.getElementById('inverse').disabled = false;

  // Clear previous radio button selection (if any)
  document.querySelectorAll('input[name="relationship"]').forEach(input => input.checked = false);
}


// Reset variables for next trial 

function initialise_next_trial() {
    // $('.likert-scale input[type="radio"]').prop('checked', false);
    $('#experiment-trial').show();
    $('#trial_score').hide();
    $('#view_score_button').hide();

    //------ Reset Task Interface -----//
    
    // Stopping the unique interval ID
    clearInterval(interval);

    // Reseting the slider values back to 0
    $('.slider').slider("value", 0);

    // Reseting array of x, y, & z values 
    xHist = [0];  
    yHist = [0]; 
    zHist = [0];
    
    // Reset scores and number of interventions for previous trial
    trial_score = 0; 
    n_interventions = 0;  
    $("#trial_score_display").html("<b>Points scored in previous round: 0</b>");
    $("#intervention_display").html("<b>You moved the sliders 0 times.</b>");

    // Update step score to reflect total score currently 
    $("#step_score_display").html("<b>Score: " + total_score + "</b>");

    // console.log(trial_score, n_interventions);    

    $('#start_button').show();

    trial_count += 1;
    
    // Loading in causal graph of next trial
    trial = order[trial_count];
    load_graph(trial);
    // load_graph(1) // To set specific trial to be loaded for testing 

    // Differentiate between training and trial rounds
    if (trial_count >= 0 && trial_count < 3) {
        $("#trial_display").html("Training Round " + (trial_count + 1));
        $("#trial_display_score").html("Training Round " + (trial_count + 1));

        // Prompting participant
        alert('You will now move to training round ' + (trial_count + 1) +' of 3. Remember, the connection between the sliders may be different this time.');
    } else if (trial_count >= 3 && trial_count < 6) {
        $("#trial_display").html("Test Round " + (trial_count - 2));
        $("#trial_display_score").html("Test Round " + (trial_count - 2));

        // Prompting participant
        alert('You will now move to test round ' + (trial_count - 2) +' of 3. Remember, the connection between the sliders may be different this time.');
    }

    $("#step_countdown_display").html("Steps: 0/" + timeout);
    // $("#score_display").html("<b><font color=#D4AF37>Bonus Pay: £"+bonus+"</font></b>");
}




// ---------------- HELPER FUNCTIONS ---------------- //

// Function to randomise experimental conditions 
function ex_randomiser(my_order){
    var shuffledArray = my_order.slice(); // Clone the array

    // Shuffle the cloned array using the Fisher-Yates algorithm
    for (var i = shuffledArray.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = shuffledArray[i];
    shuffledArray[i] = shuffledArray[j];
    shuffledArray[j] = temp;
    }
    return shuffledArray
}



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