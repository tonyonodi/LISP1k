var evaluate = function(input){
    var lexed, parsed;

    lexed = input.replace(/\(/g, " ( ").replace(/\)/g, " ) ").split(" ").filter(function(e){return e!=""});
    
    console.log(parse(lexed));
}

var parse = function(tokens){
    
    // remove first token and save
    token = tokens.shift();

    if (token == "(") {
        var list = [];

        while (tokens[0] != ")") {
            list.push(parse(tokens));
        }

        tokens.shift();  // pop off ")"
        return list;
    } else {
        return Number(token) || token;   // return atom
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


