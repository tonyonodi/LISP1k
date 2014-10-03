E=function(i){
    var lexed, parsed;

    lexed = i.replace(/\(/g, " ( ").replace(/\)/g, " ) ").split(" ");

    return lexed
}

O = function(i) {
    document.writeln("<br>"+i)
}

while(1) {
    I = window.prompt(">>>");
    O(">"+I);   // output command
    O(E(I)) // output evaluated command
}


