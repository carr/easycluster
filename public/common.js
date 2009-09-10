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

var domain = "";

var started, ended;

var result = null;

var pauseProcessing = false;

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

function reloadAfter(interval){
    setInterval("window.location.reload();", interval);
}

function emit(phase, data){
    $.post(domain + '/emit/' + phase + '?user=' + params.user, data, function(response){
	    switch(phase){
	        case 'reduce':
	        case 'finalize':
	        case 'done':
	          //status("Finished emit!", LOG_NOT_IMPORTANT);
		      processResponse(response);
		    break;
	    }
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
    eval(response);
    timeoutCount = 0;
    var phase = json['phase'];
    var data = json['data'];

    switch(phase){
      case 'map':
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

            status("Finished " + id + " in " + results['processing_time'] + ", jobSize " + jobSize + ", eta: " + eta_minutes + "min (" + eta_hours + "h), jobs left: " + jobs_left + " speed " + results['processing_speed'], LOG_IMPORTANT);

            emit('reduce', results);

        });
        break;

    case 'done':
        if(data.length>100)
          status("Job finalized with a result", LOG_VERY_IMPORTANT);
        else
          status("Job finalized in " + data.duration + " with result: " + data.result, LOG_VERY_IMPORTANT)
          timeFinished = (new Date).getTime();
	      break;
    }
}

function go(){
    $.post(domain + '/emit/reduce?user='+params.user, function(response){
      processResponse(response);
    });
}

var timeoutCount = 0;
function startWork(){
  $.ajaxSetup({
    timeout: 30000,
    error: function(request, errorType, errorThrown){
      status("Timeout happened", LOG_VERY_IMPORTANT);
      if(timeoutCount < 5){
        timeoutCount++;
        setTimeout("go()", 5000);
      }else{
        status("Tried after 5 timeouts, got fucked, gave up", LOG_VERY_IMPORTANT);
//        window.location.reload();
      }
    }
  });

  timeStarted = (new Date).getTime();
  go();
}

function togglePause(){
    pauseProcessing = !pauseProcessing;
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

