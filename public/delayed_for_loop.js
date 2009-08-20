/**
*    An object for time-delayed loops.
*    The constructor expects the number of iterations, a callback function
*    called on each iteration, and a callback modifier iteration which accepts
*    the iteration number as a single argument and returns the number of
*    miliseconds before the next iteration gets executed.
*    Once the loop has finished, callbackFinisher function is called.
*/
utils.DelayedForLoop = function(iterations, callbackFunction, callbackModifier, callbackFinisher) {
   // private
   var that = this;
   var thread = null;
   var i = 0;

   function executeIteration() {
       if (i >= that.iter) {
           clearTimeout(thread);
           that.cbFin();
       } else     {
           that.cbFunc(i);
           i = i + 1;
           that.ms = that.cbMod(i);
           if (that.ms == null || that.ms < 0) that.ms = 0;  
           thread = setTimeout(function() { executeIteration(); }, that.ms);
       }
   }

     // privileged
   this.executePrivileged = function() {
       i = 0;
       thread = setTimeout(function() { executeIteration(); }, this.ms);
   }
   this.terminatePrivileged = function() {
       clearTimeout(thread);
   }


   // public
   this.ms = callbackModifier(0);
   this.iter = iterations;

   this.cbFunc = callbackFunction;
   this.cbMod = callbackModifier;
   this.cbFin = callbackFinisher;
};

utils.DelayedForLoop.prototype = {

   /**
    *    This method executes the loop.
    */
   executeLoop: function() {
       this.executePrivileged();
   },

   /**
    *    This method terminates the loop.
    */
   terminateLoop: function() {
       this.terminatePrivileged();
   }
}; 