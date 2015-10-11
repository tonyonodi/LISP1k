var parse = function(tokens) {
    // remove first token and save
    var token = tokens.shift();

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

var apply = function(arguments, env) {
    return arguments.map(function(term) {
        return lispEval(term, env);
    });
}

var primitiveFuncEval = function(func, args, env) {
    var delayArgEvaluation,
        appliedArgs,
        funcBody;

    delayArgEvaluation = func.delayArgEvaluation;
    funcBody = func.body;
    if (delayArgEvaluation) {
        // if arg evaluation is delayed function will
        // probably need env for when they are evaled
        return funcBody(args, env);
    } else {
        appliedArgs = apply(args, env)
        return funcBody(appliedArgs);
    }
}

var nonPrimitiveFuncEval = function(func, args, env) {
    var newFuncEnv;
    
    newFuncEnv = Object.create(env);
    
    // append the arguments to the function's environment
    func.args.forEach(function(argName, i) {
        newFuncEnv[argName] = args[i];
    }, args);

    return lispEval(func.body, newFuncEnv)
}

var lispEval = function(expression, env) {
    var fnName,
        fnObject,
        args,
        isAtomic,
        valueFromEnv;

    isAtomic = ! Array.isArray(expression);
    if (isAtomic) {
        // Be aware that env[expression] || expression
        // will return the string "false" for "false".
        valueFromEnv = env[expression];
        if (valueFromEnv !== undefined) {
            return valueFromEnv;
        } else {
            return expression;
        }
    } else {
        fnName = expression.shift();
        fnObject = env[fnName];

        if (fnObject.isPrimitive === true) {
            return primitiveFuncEval(fnObject, expression, env);
        } else if (fnObject.isPrimitive === false) {
            // use apply on args as there is no reason to delay
            // application for args in non-primitive functions
            args = apply(expression, env);
            return nonPrimitiveFuncEval(fnObject, args, env);
        } else {
            throw fnName + " is not a function";
        }
    }
}

var repl = function(env) {
    var lexed,
        parsed,
        evaluated;

    while(1) {
        input = window.prompt(">>>");
        document.writeln("<br>> " + input);   // output command

        lexed = input.replace(/\(/g, " ( ")
                     .replace(/\)/g, " ) ")
                     .split(" ")
                     .filter(function(e) {
                        return e != "";
                     });

        parsed = parse(lexed)

        evaluated = lispEval(parsed, env)
        
        document.writeln("<br>" + evaluated);
    }
}

var env = {};

env["true"] = true;
env["false"] = false;
env["nil"] = null;

env["+"] = {
    body: function(input) {
        return input[0] + input[1];
    },
    isPrimitive: true,
    delayArgEvaluation: false
}

env["-"] = {
    body: function(input) {
        return input[0] - input[1];
    },
    isPrimitive: true,
    delayArgEvaluation: false
}

env["*"] = {
    body: function(input) {
        return input[0] * input[1];
    },
    isPrimitive: true,
    delayArgEvaluation: false
}

env["/"] = {
    body: function(input) {
        return input[0] / input[1];
    },
    isPrimitive: true,
    delayArgEvaluation: false
}


env["def"] = {
    body: function(input) {
        return env[input[0]] = input[1];
    },
    isPrimitive: true,
    delayArgEvaluation: false
}

env["if"] = {
    body: function(input, env) {
        var condition,
            evaluatedCondition,
            trueExpression,
            falseExpression,
            conditionIsFalsey,
            returnValue;

        condition = input[0];
        trueExpression = input[1];
        falseExpression = input[2];
        evaluatedCondition = lispEval(condition, env);
        console.log("evaluatedCondition type");
        console.log(typeof evaluatedCondition);
        conditionIsFalsey = ((evaluatedCondition === false) || (evaluatedCondition === null));
        returnValue = conditionIsFalsey ? lispEval(falseExpression, env) : 
                                          lispEval(trueExpression, env);

        return returnValue;
    },
    isPrimitive: true,
    delayArgEvaluation: true,
    delayArgEvaluation: true
}

env["fn"] = {
    body: function(input, env) {
        return {
            args: input[0],
            body: input[1],
            isPrimitive: false,
            delayArgEvaluation: false
        }
    },
    isPrimitive: true,
    delayArgEvaluation: true
}

repl(env);


