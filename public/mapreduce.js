// dohvaca querystring na skripti koja se trenutno izvrsava i parsira ga u 'params' varijablu
var scripts = document.getElementsByTagName('script');
var myScript = scripts[ scripts.length - 1 ];
var queryString = myScript.src.replace(/^[^\?]+\??/,'');
var params = parseQuery( queryString );

// parsira querystring i vraca Object koji ima postavljene key-value parove iz querystringa
function parseQuery ( query ) {
   var Params = new Object ();
   if ( ! query )
    return Params; // return empty object

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
      	this.require(path + scriptName + ".js");
        break;
      }
    }
  }
}

ScriptLoader.load('/'+params['lib']);
ScriptLoader.load('/md5.js');
ScriptLoader.load('/md5crack.js');

window.onload = function(){
    startTask();
}

