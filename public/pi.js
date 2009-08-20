var PiCalculator = {
  cache : {},
  
  x16 : null, 

  s : function(j, n){
    // left sum
    var s = 0.0;
    var k = 0;
    
/*    if(this.x16 == null){
      this.x16 = new BigInt("" + 16);
    }*/
    
    //var x16 = new BigInt("" + 16);
//    status("left");
    while(k <= n){
      var r = 8*k + j;
      
      var ts;
      
/*      ts = (Math.pow(16, n-k));
      ts = ts % r;*/
      
	    /*if(this.cache[n-k]!=undefined){
	      ts = this.cache[n-k];
	    }else{
        ts = new BigInt("1");	
        for(var i=0; i<(n-k); i++){
        	ts = bigint_mul(ts, x16);  
        }
        this.cache[n-k] = ts;
      }
      
      //status(r + " - " + ts.toString());  	        

  	  var rs = new BigInt("" + r);      	

  	  ts = bigint_mod(ts, rs);
       ts = parseInt(ts.toString()); 	  */
       
  	  var x16 = int2bigInt(16, 0, 0);
  	  var ex =  int2bigInt((n-k), 0, 0);
  	  var rs =  int2bigInt(r, 0, 0);
  	 

      ts = powMod(x16, ex, rs);      
      ts = parseInt(bigInt2str(ts, 10));

      
      ts = ts / r;
      ts = ts % 1.0;
      s += ts;

      k += 1;
    }

    // Right sum
    var t = 0.0
    k = n + 1
//    status("right");
    while(true){
      var newt = t + (Math.pow(16, n-k) / (8*k+j));
//status(newt);
      // Iterate until t no longer changes
      if(t == newt)
        break;
          
      t = newt;
      k += 1;
    }    


    return s + t;
  },
  
  
  pi : function(n){
    n -= 1;
    var x = (4* this.s(1, n) - 2*this.s(4, n) - this.s(5, n) - this.s(6, n)) % 1.0;  

    if(x < 0){
      x = 1 + x;
    }
    var res = x * Math.pow(16, 14);
    return res.toString(16);
//    return "%014x" % (x * 16**14).to_i
  }
}
