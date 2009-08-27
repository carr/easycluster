var letters = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '*'
]

var codes = [
    97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122,
    65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90,
    48, 49, 50, 51, 52, 53, 54, 55, 56, 57,     35, 42
]

function checkmd5(number, word_size, md5){
    toBase = letters.length;
    var arr = new Array(word_size);

    for(var j=0;j<arr.length;j++)
        arr[j] = 0;

    var pos = word_size-1;
    while(number!=0){
        arr[pos] = number % toBase; // number >> ?? (6)
        number = Math.floor(number / toBase);
        pos--;
    }

    var bin = Array();
//      var mask = (1 << chrsz) - 1;
      for(var i = 0; i < word_size * chrsz; i += chrsz)
//        bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
        bin[i>>5] |= (codes[arr[(i / chrsz)]]) << (i%32);

//    return hex_md5(str)==md5 ? str : null;
    return binl2hex(core_md5(bin, word_size * 8))==md5 ? binl2str(bin) : null;
}

function check_range(start, end, word_size, md5){
    var res;
    for(var i=start;i<end;i++){
      res = checkmd5(i, word_size, md5);
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

