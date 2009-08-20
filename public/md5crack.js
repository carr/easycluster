var letters = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',  
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '*'
]

// return array, but backwards
function radixConvert(number, toBase){
  if(number==0)
    return [0];
        
  var arr = [];
  while(number!=0){
    arr.push(number % toBase);
    number = Math.floor(number / toBase);  
//    status(number);  
  }
//  status(arr.join("-"));
  return arr;
}

function checkmd5(i, word_size, md5){
//    var number = i.toString(letters.length);
    var number = radixConvert(i, letters.length);
    var padding_size = word_size - number.length;
    for(var j=0;j<padding_size;j++){
//      number = "0" + number;
      number.unshift(0);  
    }
//    status(number);
//    number = number.split("");      
    
    var str = "";      
    for(var j=0;j<number.length;j++){
      str += letters[number[j]];
    }
status(str);
    if(hex_md5(str)==md5)
      return str;
    else
      return null;
}

function check_range(start, end, word_size, md5){
    for(var i=start;i<end;i++){
      var res = checkmd5(i, word_size, md5);
      if(res!=null)
        return res;
    }
    return null;
}

function check(){

  var word_size = 3;
  var variations = Math.pow(letters.length, word_size);
  status("variations " + variations);
  return check_range(1200, 2400, word_size, '325455cb91766f38103ee6c1b63bc135') //'0ba64a0dea00947916dfb6a66866e1ca');
//  radixConvert(798, 77);
}

function map(id, input){
//    status("map " + input.join(";"));
//    var bytes = input;
//    
//    var compressed = [];    
//    var old_byte = bytes[0];
//    var count = 0;
//    
//    for(var i=0;i<bytes.length;i++){
//      if(bytes[i]==old_byte){
//        count+=1
//      }else{
//        compressed.push(old_byte);
//        compressed.push(count / 256); // TODO roundanje ovog broja
//        compressed.push(count % 256);        
//        
//        old_byte = bytes[i];
//        count = 1;
//      }
//    }
//    
//    compressed.push(old_byte);
//    compressed.push(count / 256);
//    compressed.push(count % 256);            

//    return compressed.join(";")
}
