"use strict";

var Lisp = (function() {
  var Lisp = Object.create(null);

  Lisp.lex = function(string) {
    return string.replace(/\(/g, " ( ")
                 .replace(/\)/g, " ) ")
                 .split(" ")
                 .filter(function(token) {
                    return token !== "";
                 });
  }

  Lisp.parse = function(tokens) {
    var token,
        tokenAsNumber;
    // remove first token and save
    token = tokens.shift();

    if (token === "(") {
      var list = [];

      while (tokens[0] !== ")") {
        list.push(Lisp.parse(tokens));
      }

      tokens.shift();  // pop off ")"
      return list;
    } else {
      tokenAsNumber = Number(token);
      if (Number.isNaN(tokenAsNumber)) {
        return token;   // return atom
      } else {
        return tokenAsNumber;
      }
    }
  }

  Lisp.apply = function(args, env) {
    return args.map(function(term) {
      return Lisp.eval(term, env);
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
      appliedArgs = Lisp.apply(args, env)
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

    return Lisp.eval(func.body, newFuncEnv)
  }

  Lisp.eval = function(expression, env) {
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
      fnName = expression[0];
      args = expression.slice(1);
      fnObject = env[fnName];

      if (fnObject.isPrimitive === true) {
          return primitiveFuncEval(fnObject, args, env);
      } else if (fnObject.isPrimitive === false) {
        // use apply on args as there is no reason to delay
        // application for args in non-primitive functions
        args = Lisp.apply(args, env);
        return nonPrimitiveFuncEval(fnObject, args, env);
      } else {
        throw fnName + " is not a function";
      }
    }
  }

  Lisp.repl = function(parentElement) {
    var lastListItem,
      form,
      that;

    that = this;

    that.env = new Env;
    parentElement.append("<ul id=\"lisp-repl\"><li><form><input type=\"text\" autofocus></form></li></ul>");
    that.container = parentElement.find("ul");
    lastListItem = that.container.find("li").last();
    form = lastListItem.find("form");

    form.submit(function(event) {
      var inputElement,
        submitted,
        lexed,
        parsed,
        evaluated;

      event.preventDefault();
      inputElement = $(event.target).find("input");
      submitted = inputElement.val();

      lexed = Lisp.lex(submitted);
      parsed = Lisp.parse(lexed);
      evaluated = Lisp.eval(parsed, that.env);
      $("<li>" + evaluated + "</li>").insertBefore(lastListItem);
      inputElement.val("");
    });
  }

  var Env = function() {
    var that = this;

    that["true"] = true;
    that["false"] = false;
    that["nil"] = null;

    that["+"] = {
      body: function(input) {
        return input.reduce(function(prev, curr) {
          return prev + curr;
        }, 0);
      },
      isPrimitive: true,
      delayArgEvaluation: false
    }

    that["-"] = {
      body: function(input) {
        var first;
        first = input.shift();
        return input.reduce(function(prev, curr) {
          return prev - curr;
        }, first);
      },
      isPrimitive: true,
      delayArgEvaluation: false
    }

    that["*"] = {
      body: function(input) {
        return input.reduce(function(prev, curr) {
          return prev * curr;
        }, 0);
      },
      isPrimitive: true,
      delayArgEvaluation: false
    }

    that["/"] = {
      body: function(input) {
        var first;
        first = input.shift();
        return input.reduce(function(prev, curr) {
          return prev / curr;
        }, first);
      },
      isPrimitive: true,
      delayArgEvaluation: false
    }

    that["="] = {
      body: function(input) {
        var first;
          first = input.shift();
        return input.every(function(value) {
          return value === first;
        });
      },
      isPrimitive: true,
      delayArgEvaluation: false
    }

    that["def"] = {
      body: function(input) {
        return that[input[0]] = input[1];
      },
      isPrimitive: true,
      delayArgEvaluation: false
    }

    that["if"] = {
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
        evaluatedCondition = Lisp.eval(condition, that);
        conditionIsFalsey = ((evaluatedCondition === false) || (evaluatedCondition === null));
        returnValue = conditionIsFalsey ? Lisp.eval(falseExpression, that) :
                                          Lisp.eval(trueExpression, that);

        return returnValue;
      },
      isPrimitive: true,
      delayArgEvaluation: true,
      delayArgEvaluation: true
    }

    that["fn"] = {
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
  }

  return Lisp;
})();
