var processedTotal;
var timeStarted, timeFinished, timeProcessingStarted, timeProcessingFinished;

var LOG_SHOW_ALL;
var LOG_NOT_IMPORTANT = 1;
var LOG_IMPORTANT = 2;
var LOG_VERY_IMPORTANT = 3;

var logLevel = LOG_SHOW_ALL;

var processingSpeeds = [];
var PROCESSING_SPEEDS_LENGTH = 10;

var domain = 'http://localhost:4567';

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
    return sum / processingSpeeds.length;
}

function processResponse(response){
    eval(response);
    timeoutCount = 0;
    var phase = json['phase'];
    var input = json['data'];

    switch(phase){
      case 'map':
        var jobs_left = json.jobs_left;
        var eta_minutes = Math.floor(json.eta / 1000 / 60);
        var eta_hours = Math.floor(eta_minutes / 60);

        var results = {};
        for(var index in json.jobs){
            var filename = json.jobs[index].filename;
            var data = json.jobs[index].data
            var timeStarted = json.jobs[index].time_started;
            var jobSize = json.jobs[index].job_size;

//            status("Doing map for: " + filename + ", jobs left: " + jobs_left, LOG_IMPORTANT)

            results['filename['+index+']'] = filename;

            timeProcessingStarted = (new Date).getTime();

            var result = map(filename, data);
            var processingDuration = (new Date).getTime()-timeProcessingStarted;

            pushProcessingSpeed(jobSize / processingDuration);

            results['processing_time['+index+']'] = processingDuration;
            results['result['+index+']'] = result;
            results['time_started['+index+']'] = timeStarted;

            if(processingSpeeds.length >= PROCESSING_SPEEDS_LENGTH){
                results['processing_speed['+index+']'] = getAverageProcessingSpeed();
            }


            status("Finished " + filename + " in " + results['processing_time['+index+']'] + ", jobSize " + jobSize + ", eta: " + eta_minutes + "min (" + eta_hours + "h), jobs left: " + jobs_left + " speed " + results['processing_speed['+index+']'], LOG_IMPORTANT);
            processedTotal++;
        }

        emit('reduce', results);
        break;

    case 'reduce':
        status("Doing reduce for input " + input, LOG_NOT_IMPORTANT)
        var result = reduce(input);
        emit('finalize', {'sum': result});
        break;

    case 'wait':
        status("...Waiting 1 seconds for all jobs to finish...");
        setTimeout('go()', 1000);
        break;

    case 'done':
        if(input.length>100)
          status("Job finalized with a result", LOG_VERY_IMPORTANT);
        else
          status("Job finalized in " + input.duration + " with result: " + input.result, LOG_VERY_IMPORTANT)
          timeFinished = (new Date).getTime();

	        //status(json['stats'], LOG_VERY_IMPORTANT);

	        if(processedTotal>0){
		        status("You processed a total of <em>" + processedTotal + "</em> packages.", LOG_VERY_IMPORTANT);
    	    }
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

    processedTotal = 0;
    timeStarted = (new Date).getTime();
    go();
}

var started, ended;
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

function status(text, level){
    if(level==undefined)
      level = LOG_NOT_IMPORTANT;

    if(level<logLevel)
      return;

    // ako postoji status objekt pisaticemo nesto u njega
    if(document.getElementById('status')!=null){
      $('#status').append(text + '\n'); // ovo je za jquery varijantu
//	$('status').innerHTML+=text+'\n'; // ovo je za prototype varijantu
      var obj = document.getElementById('status');
      obj.scrollTop = obj.scrollHeight;
    }
}

