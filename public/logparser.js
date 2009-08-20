function map(id, input){				
    var dates = input.split(";");
    
    var firstDate=new Date(dates[0]);
    var secondDate=new Date(dates[1]);
	
    var dateDiff = (secondDate-firstDate)/1000;
    

    return dateDiff;
}

function reduce(input){
    var sum = 0;
    var docs = input.split(" ");
    
    for (var i=0;i<docs.length;i++){
	var pair = docs[i].split(";");
	
	var id = pair[0];
	var value = parseInt(pair[1]);
	
	sum+= value > 0 ? value : 0;
	
	if(value>600){
	    status("New request on index " + id);
	}
    }
    
    return sum;    
}