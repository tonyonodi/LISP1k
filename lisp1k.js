var evaluate = function(input){
    var lexed;

    lexed = input.replace(/\(/g, " ( ").replace(/\)/g, " ) ").split(" ").filter(function(e){return e!=""});
    
    return eval(parse(lexed));
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

var eval = function(expression) {
    if(Array.isArray(expression)) {
        var fn = expression.shift();

        return fns[fn](expression.map(eval));
    }
    return env[expression] || expression   // just return if atomic
}

var output = function(i) {
    document.writeln("<br>"+i)
}

var fns = {};
var env = {};    // keep variables in this object

fns['+'] = function(input) {return input[0] + input[1]};
fns['-'] = function(input) {return input[0] - input[1]};
fns['*'] = function(input) {return input[0] * input[1]};
fns['/'] = function(input) {return input[0] / input[1]};

fns['def'] = function(input) { return env[input[0]] =  input[1] };

while(1) {
    I = window.prompt(">>>");
    output(">"+I);   // output command
    output(evaluate(I)) // output evaluated command
}


