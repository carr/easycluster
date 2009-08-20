function map(id, input){
    status("map " + input.join(";"));
    var bytes = input;
    
    var compressed = [];    
    var old_byte = bytes[0];
    var count = 0;
    
    for(var i=0;i<bytes.length;i++){
      if(bytes[i]==old_byte){
        count+=1
      }else{
        compressed.push(old_byte);
        compressed.push(count / 256); // TODO roundanje ovog broja
        compressed.push(count % 256);        
        
        old_byte = bytes[i];
        count = 1;
      }
    }
    
    compressed.push(old_byte);
    compressed.push(count / 256);
    compressed.push(count % 256);            

    return compressed.join(";")
}

function reduce(input){
    var sum = 0;
    
    var data = input.split(" ");
    var together = new Array(data.length);
    for(var i=0;i<data.length;i++){
	var parts = data[i].split("|");
	var id = parts[0].replace("compress/", "").replace(".txt", "");
	together[parseInt(id)] = parts[1]
    }
    return together.join(";");
}
