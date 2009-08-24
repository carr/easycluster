var processedTotal;
var timeStarted, timeFinished, timeProcessingStarted, timeProcessingFinished;

var LOG_SHOW_ALL;
var LOG_NOT_IMPORTANT = 1;
var LOG_IMPORTANT = 2;
var LOG_VERY_IMPORTANT = 3;

var logLevel = LOG_SHOW_ALL;

function emit(phase, data){
    $.post('/emit/' + phase + '?user=' + params.user, data, function(response){
	    switch(phase){
	        case 'reduce':
	        case 'finalize':
	        case 'done':
	          status("Finished emit!", LOG_NOT_IMPORTANT);
		      processResponse(response);
		    break;
	    }
    });
}

function processResponse(response){
    eval(response);

    var phase = json['phase'];
    var input = json['data'];

    switch(phase){
      case 'map':
        var jobs_left = json.jobs_left;

        var results = {};
        for(var index in json.jobs){
            var filename = json.jobs[index].filename;
            var data = json.jobs[index].data

//            status("Doing map for: " + filename + ", jobs left: " + jobs_left, LOG_IMPORTANT)

            results['filename['+index+']'] = filename;

            timeProcessingStarted = (new Date).getTime();

            var result = map(filename, data);
            results['processing_time['+index+']'] = (new Date).getTime()-timeProcessingStarted;
            results['result['+index+']'] = result;

            status("Finished map job " + filename + " in " + results['processing_time['+index+']'] + ", jobs left: " + jobs_left, LOG_IMPORTANT);
            // status("result for map: " + result, LOG_NOT_IMPORTANT);
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

	        status(json['stats'], LOG_VERY_IMPORTANT);

	        if(processedTotal>0){
		        status("You processed a total of <em>" + processedTotal + "</em> packages.", LOG_VERY_IMPORTANT);
    	    }
	      break;
    }
}

function go(){
    $.post('/emit/reduce?user='+params.user, function(response){
      processResponse(response);
    });
}

function startWork(){
  $.ajaxSetup({
    timeout: 30000,
    error: function(request, errorType, errorThrown){
      status("Timeout happened", LOG_VERY_IMPORTANT);
      //go();
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

