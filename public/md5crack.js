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
//    status(str);

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

function map(id, data){
  var arr = id.split(";");
  var res = check_range(parseInt(arr[1]), parseInt(arr[2]), parseInt(arr[0]), data['hash']);
  return res;
}
function startTask(){
    status("Started");
    timeStart();

    startWork();
    bl = 0;
    timeStop("rezultat " + bl);
}

