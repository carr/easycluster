var letters = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '*'
]

var codes = [
    97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122,
    65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90,
    48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 35, 42
]

function arrToString(arr){
    var str = '';
    for(var i =0;i<arr.length;i++){
        str+=letters[arr[i]];
    }
    return str;
}

function check_job(number, word_size, md5){
    var tmp = number;
    toBase = letters.length;
    var arr = new Array(word_size);

    var pos = word_size-1;
    while(pos >= 0){
        arr[pos] = number % toBase;
        number = Math.floor(number / toBase);
        pos--;
    }

    var bin = Array();
    for(var i = 0; i < word_size * chrsz; i += chrsz)
        bin[i>>5] |= (codes[arr[(i / chrsz)]]) << (i%32);

    return binl2hex(core_md5(bin, word_size * 8))==md5 ? arrToString(arr) : null;
}

var DEFAULT_CHUNK_SIZE = 1000;
var DEFAULT_SPEED = 15;

var chunk_size = DEFAULT_CHUNK_SIZE; // 400
var CHUNK_INTERVAL = 1; // 200

function check_range(start, end, word_size, md5, callback){
    var res;

    var busy = false;
    var timer = setInterval(function(){
        chunk_size = Math.floor(DEFAULT_CHUNK_SIZE / (DEFAULT_SPEED / lastAverageProcessingSpeed));

        if(!busy && !pauseProcessing){
            busy = true;
            for(var i=start; i<(start+chunk_size); i++){
                if(i>end){
                    clearInterval(timer);
                    callback.call();
                    break;
                }

                result = check_job(i, word_size, md5);

                if(result!=null){
                    // we have a result
                    clearInterval(timer);
                    callback.call();
                }
            }
            start+=chunk_size;

            busy = false;
        }

    }, CHUNK_INTERVAL);
}
function check_package(id, hash, callback){
  var arr = id.split(";");
  check_range(parseInt(arr[2]), parseInt(arr[3]), parseInt(arr[1]), hash, callback);
}
function startTask(){
    status("Started");
    timeStart();

    startWork();
    bl = 0;
    timeStop("rezultat " + bl);
}

