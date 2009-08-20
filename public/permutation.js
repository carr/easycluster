// compute the number of permutations
function count(){
    var number = parseInt(calc.number.value, 10);
    var select = parseInt(calc.select.value, 10);

    // check input
    if (isNaN(number)||(number <= 0)||isNaN(select)||(select <= 0)||(select > number)){
        calc.permutations.value = "Error";
        return;
    }
  
    var c = Math.round(permutations(number, select));
    calc.permutations.value = c;
}

// list permutations in a separate window
function listing(){
    var number = letters.length; //parseInt(calc.number.value);
    var select = parseInt(calc.select.value);

    // check input
    if (isNaN(number)||(number <= 0)||isNaN(select)||(select <= 0)||(select > number))
    {
        calc.permutations.value = "Error";
        return;
    }
  
    var c = Math.round(permutations(number, select));
    calc.permutations.value = c;

    msgWindow = window.open("","msgWindow","toolbar=no,status=no,menubar=yes,scrollbars=yes,width=550,height=400");
    msgWindow.document.open();
    msgWindow.document.writeln("<html><head><title>Listing</title></head>");
    msgWindow.document.writeln("<body>");
    msgWindow.document.writeln("<p><tt><sub>" + number + "</sub>P<sub>" + select + "</sub> = " + c + "</tt>");
    msgWindow.document.writeln("<p>listing of permutations");
    msgWindow.document.writeln("<p>");
    msgWindow.document.writeln("<pre>");

    value = new Array()

    var a = new Array();                           // initialize
    for (i = 0; i < select; i++) 
        a[i] = i + 1;                              // 1 - 2 - 3 - 4 - ...

    while (true)
    {       
        for (n = 0; n < select; n++) 
            value[n] = a[n]; 

        // for this combination, list permutations in lexicographical order
        put_next(select);
        while (get_next(select))
            put_next(select);

        // generate next combination in lexicographical order
        i = select - 1;                            // start at last item        
        while (a[i] == (number - select + i + 1))  // find next item to increment 
            --i;

        if (i < 0) break;                          // all done
        ++a[i];                                    // increment

        for (j = i + 1; j < select; j++)           // do next combination 
            a[j] = a[i] + j - i;
    }

    msgWindow.document.writeln("</pre>");
    msgWindow.document.writeln("<p>All done!");
    msgWindow.document.writeln("</body></html>");

    msgWindow.document.close();
}

// compute the number of permutations of r objects from a set on n objects
function permutations( n, r )
{
    var c = parseInt("1");
    if (r > n) return 0;
    var d = n - r;
    
    while (n > 0)
    {
        c = c * n;
        --n; 
    }

    while (d)
    {
        c = c / d;
        --d;
    }

    return c;
}

var value;

// compute the next permutation given the current permutation
function get_next( k ){
console.log(k);
    var i = k - 1;
    while (value[i-1] >= value[i]) 
        i--;

    if (i < 1) return false;                       // all in reverse order 

    var j = k;
    while (value[j-1] <= value[i-1]) 
        j--;

    swap(i - 1, j - 1);

    i++; 
    j = k;

    while (i < j){
        swap(i - 1, j - 1);
        i++;
        j--;
    }

    return true;
}

function swap( a, b ){
    temp     = value[a];
    value[a] = value[b];
    value[b] = temp;
}

function put_next( k ){
    for (i = 0; i < k; i++)
        msgWindow.document.write("  " + letters[value[i]-1]);
    msgWindow.document.writeln("");
}
