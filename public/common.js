var timeStarted, timeFinished, timeProcessingStarted, timeProcessingFinished;

var LOG_SHOW_ALL;
var LOG_NOTHING = 0;
var LOG_NOT_IMPORTANT = 1;
var LOG_IMPORTANT = 2;
var LOG_VERY_IMPORTANT = 3;

var logLevel = LOG_SHOW_ALL;

var processingSpeeds = [];
var lastAverageProcessingSpeed = 1;
var PROCESSING_SPEEDS_LENGTH = 10;

var started, ended;
var result = null;
var pauseProcessing = false;

var timeoutCount = 0;
var printedJobFinalized = false;

function timeStart(){
  started = new Date().getTime();
}
function timeStop(flag){
  ended = new Date().getTime();
  if(flag==undefined)
    status("trajanje " + (ended-started) + "ms")
  else
    status(flag + ": trajanje " + (ended-started) + "ms")
}

function emit(data){
    $.post('/emit?user=' + params.user, data, function(response){
        processResponse(response);
    });
}

function pushProcessingSpeed(speed){
    processingSpeeds.push(speed);
    if(processingSpeeds.length > PROCESSING_SPEEDS_LENGTH){
        processingSpeeds.shift();
    }
}

function getAverageProcessingSpeed(){
    var sum = 0;
    for(var i=0;i< processingSpeeds.length; i++){
        sum+= processingSpeeds[i];
    }
    lastAverageProcessingSpeed = sum / processingSpeeds.length;
    return lastAverageProcessingSpeed;
}

function processResponse(response){
    timeoutCount = 0;
    eval(response);
    var phase = json['phase'];
    var data = json['data'];

    switch(phase){
      case 'work':
        var jobs_left = json.jobs_left;
        var eta_minutes = Math.floor(json.eta / 1000 / 60);
        var eta_hours = Math.floor(eta_minutes / 60);

        var id = json.id;
        var hash = json.hash;
        var timeStarted = json.time_started;
        var jobSize = json.job_size;

        var results = {};
        results['id'] = id;

        timeProcessingStarted = (new Date).getTime();
        result = null;
        check_package(id, hash, function(){
            var processingDuration = (new Date).getTime()-timeProcessingStarted;

            pushProcessingSpeed(jobSize / processingDuration);

            results['processing_time'] = processingDuration;
            results['result'] = result;
            results['time_started'] = timeStarted;

            if(processingSpeeds.length >= PROCESSING_SPEEDS_LENGTH){
                results['processing_speed'] = getAverageProcessingSpeed();
            }

            status("Finished " + id + " in " + results['processing_time'] + ", jobSize " + jobSize + ", eta: " + eta_minutes + "min (" + eta_hours + "h), jobs left: " + jobs_left + " speed " + Math.round(results['processing_speed']*100)/100, LOG_IMPORTANT);

            emit(results);

        });
        break;

    case 'done':
        if(!printedJobFinalized){
            if(data.length>100)
              status("Job finalized with a result", LOG_VERY_IMPORTANT);
            else
              status("Job finalized in " + data.duration + " with result: " + data.result, LOG_VERY_IMPORTANT)

            printedJobFinalized = true;
        }

	    setTimeout('go()', 2000);
        break;
    }
}

function go(){
    console.log("go");
    $.post('/emit?user='+params.user, function(response){
      processResponse(response);
    });
}

function startWork(){
  $.ajaxSetup({
    timeout: 30000,
    error: function(request, errorType, errorThrown){
      status("Timeout happened", LOG_VERY_IMPORTANT);

      if(timeoutCount < 5){
        timeoutCount++;
        setTimeout("go()", 5000);
      }else{
        status("Tried after 5 timeouts, gave up", LOG_VERY_IMPORTANT);
      }
    }
  });

  timeStarted = (new Date).getTime();
  go();
}

function togglePause(){
    pauseProcessing = !pauseProcessing;
}

function reloadAfter(interval){
    setInterval("window.location.reload();", interval);
}

function status(text, level){
    if(logLevel == LOG_NOTHING)
        return;

    if(level==undefined)
      level = LOG_NOT_IMPORTANT;

    if(level<logLevel)
      return;

    // if there's a status <div>
    if(document.getElementById('status')!=null){
      $('#status').append(text + '\n'); // ovo je za jquery varijantu
      var obj = document.getElementById('status');
      obj.scrollTop = obj.scrollHeight;
    }
}

