var CountingTask;
var ParasiteTask;

function initCountingTask(){
    /**
     * Po trenutnim proracunima ovo je 40x sporije od klasicne for/while petlje
     */
    ParasiteTask = Class.create({
	stop : function(){
	    this.endTime = new Date().getTime();
	    status("rezultat " + this.result.count + ", traje " + (this.endTime-this.startTime) + "ms")
	},

	startStep : function(){
	    setTimeout(this.step.bind(this), 0);
	},

	run : function(){
	    this.startTime = new Date().getTime();
	    this.init();
	    this.step();
	}

    });

    CountingTask = Class.create(ParasiteTask, {
	init: function(){
	    this.result.count = this.state.count; // inicijalna vrijednost
	},

	step: function() {
	    //status("x je " + this.result.count)
	    calculateShit();
	    this.result.count++;

	    if(this.result.count >= 100000){ // uvjet
		this.stop();
	    }else{
		this.startStep(this.step.bind(this));
	    }
	}
    });

}
engine = new ParasiteEngine(new CountingTask());
engine.start();

