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
	          status("Finished emit!", LOG_IMPORTANT);
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
          
	        status("Doing map for: " + filename + ", jobs left: " + jobs_left, LOG_IMPORTANT)          
	        
          results['filename['+index+']'] = filename;

	        timeProcessingStarted = (new Date).getTime();
	        var result = map(filename, data);          
          results['processing_time['+index+']'] = (new Date).getTime()-timeProcessingStarted;                          
          results['result['+index+']'] = result;          

          status("Finished map job " + filename + " in " + results['processing_time['+index+']'], LOG_IMPORTANT);
      		status("result for map: " + result, LOG_NOT_IMPORTANT);			        
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
          status("Job finalized with result: " + input, LOG_VERY_IMPORTANT)
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
      go();
    }
  });

    processedTotal = 0;
    timeStarted = (new Date).getTime();    
    go();
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

// dinamicki ucitava neki .js file, url=nesto.js
function loadScript(url){
   var e = document.createElement("script");
   e.src = url;
   e.type="text/javascript";
   document.getElementsByTagName("head")[0].appendChild(e);
}

// dohvaca querystring na skripti koja se trenutno izvrsava i parsira ga u 'params' varijablu
var scripts = document.getElementsByTagName('script');
var myScript = scripts[ scripts.length - 1 ];
var queryString = myScript.src.replace(/^[^\?]+\??/,'');
var params = parseQuery( queryString );

// parsira querystring i vraca Object koji ima postavljene key-value parove iz querystringa
function parseQuery ( query ) {
   var Params = new Object ();
   if ( ! query ) return Params; // return empty object
   var Pairs = query.split(/[;&]/);
   
   for ( var i = 0; i < Pairs.length; i++ ) {
      var KeyVal = Pairs[i].split('=');
      if ( ! KeyVal || KeyVal.length != 2 ) continue;
      var key = unescape( KeyVal[0] );
      var val = unescape( KeyVal[1] );
      val = val.replace(/\+/g, ' ');
      Params[key] = val;
   }
   return Params;
}
var ScriptLoader = {
  require: function(libraryName) {
    // inserting via DOM fails in Safari 2.0, so brute force approach
    document.write('<script type="text/javascript" src="'+libraryName+'"></script>');
  },
  
  load: function(scriptName) {
    var scriptTags = document.getElementsByTagName("script");
    for(var i=0;i<scriptTags.length;i++) {
      if(scriptTags[i].src && scriptTags[i].src.match(/\/mapreduce\.js(\?.*)?$/)) {
        var path = scriptTags[i].src.replace(/\/mapreduce\.js(\?.*)?$/,'');
        scriptName = scriptName.replace(/\.js$/, '');
      	//console.log(path + scriptName + ".js");
      	this.require(path + scriptName + ".js");
        break;
      }
    }
  }
}



//var CountingTask;
//var ParasiteTask;
//
//function initCountingTask(){
//    /**
//     * Po trenutnim proracunima ovo je 40x sporije od klasicne for/while petlje
//     */
//    ParasiteTask = Class.create({
//	stop : function(){
//	    this.endTime = new Date().getTime();		
//	    status("rezultat " + this.result.count + ", traje " + (this.endTime-this.startTime) + "ms") 
//	},
//	
//	startStep : function(){
//	    setTimeout(this.step.bind(this), 0);
//	},
//	
//	run : function(){
//	    this.startTime = new Date().getTime();
//	    this.init();
//	    this.step();
//	}
//	
//    });
//    
//    CountingTask = Class.create(ParasiteTask, {
//	init: function(){
//	    this.result.count = this.state.count; // inicijalna vrijednost
//	},
//	
//	step: function() {
//	    //status("x je " + this.result.count)
//	    calculateShit();
//	    this.result.count++;
//	    
//	    if(this.result.count >= 100000){ // uvjet
//		this.stop();
//	    }else{
//		this.startStep(this.step.bind(this));
//	    }
//	}
//    });    
//    
//}
//engine = new ParasiteEngine(new CountingTask());
//engine.start();

function calculateShit(){
    var z = 3;
    z = z * 18;
    var y = z / 5;
}


//loadScript('/javascripts/jquery.js');
//loadScript('big_int.js');
ScriptLoader.load('/javascripts/jquery');
//ScriptLoader.load('/javascripts/prototype'); // cini mi se da i ovo zakurac radi
ScriptLoader.load('/'+params['lib']);
ScriptLoader.load('/pi');
//ScriptLoader.load('/big_int.js');
ScriptLoader.load('/BigInt.js');
ScriptLoader.load('/md5.js');
ScriptLoader.load('/permutation.js');
ScriptLoader.load('/md5crack.js');

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

function hashTest(){
  for(var i=0;i<1000;i++){
    var res = hex_md5(""+i);
    status(res);
  }
}

window.onload = function(){    
    status("Started (bu)");
//    initCountingTask();
//    
//    var c = new CountingTask();
//    c.state = {};
//    c.result = {};
//    c.state.count = 0;
//    c.run();
//    
//    x = 0;
//    var startTime = new Date().getTime();
//    while(x<100000){
//	calculateShit();
//	//status("x je " + x);
//	x++;
//    }
//    var endTime = new Date().getTime();
//    status("rezultat " + x + ", traje " + (endTime-startTime) + "ms (normalni)")
   
//    startWork();    
  var startTime = new Date().getTime();
//  for(var i=0;i<1;i++){
//    var bl = PiCalculator.pi(5000);
   // var bl = hashTest();
//  }
  var bl = check();
  var endTime = new Date().getTime();
  status("rezultat " + bl + ", traje " + (endTime-startTime) + "ms (normalni)")
}

function bigIntTest(){
    var start = new Date().getTime();
    status("poceo " + start);   
    for(var i=0;i<1000;i++){
	x = new BigInt("1634733645809253848443133883865090859841783670033092312181110852389333100104508151212118167511579");
	y = new BigInt("1900871281664822113126851573935413975471896789968515493666638539088027103802104498957191261465571");
	z = bigint_mul(x, y);
	status(x.toString().length);
	status(y.toString().length);
	    
	z.toString()=="3107418240490043721350750035888567930037346022842727545720161948823206440518081504556346829671723286782437916272838033415471073108501919548529007337724822783525742386454014691736602477652346609";
    }
   var end = new Date().getTime();
   status("gotov " + end);
   status("traje " + (end-start) + "ms")    
}

//$(document).ready(function(){
//    
//    //$('#status').html('bu');    
//
// });
