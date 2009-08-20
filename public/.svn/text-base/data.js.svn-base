function map(id, input){				
    var words = input.split(/\n|\s/).length;
    
    status("result for map: " + words);
    emit('reduce', {'id': id, 'count': words});
    //setTimeout("emit('reduce', {'id': "+id+", 'count': "+words+"});", 10000);
}

function reduce(input){
    var sum = 0;
    var docs = input.split(" ");
    
    for (var i=0;i<docs.length;i++){
	num = docs[i];    
	sum+= parseInt(num) > 0 ? parseInt(num) : 0;
    }
    
    emit('finalize', {'sum': sum});	
}