var evaluate = function(input){
    var lexed, parsed;

    lexed = input.replace(/\(/g, " ( ").replace(/\)/g, " ) ").split(" ");
    
    parse(lexed)
}

var parse = function(tokens){
    
    // remove all empty strings from array
    var index = tokens.indexOf("");
    while(index >= 0) {
        console.log(tokens);
        tokens.splice(index, 1);
        index = tokens.indexOf("");
    }

    // remove first token and save
    var token = tokens.shift();

    if (token == "(") {
        var list = [];

        while (token != ")") {
            list.push(parse(tokens));
        }

        tokens.shift();  // pop off ")"
        return list;
    } else {
        return token;   // return atom
    }
}

var output = function(i) {
    document.writeln("<br>"+i)
}

while(1) {
    I = window.prompt(">>>");
    output(">"+I);   // output command
    output(evaluate(I)) // output evaluated command
}


