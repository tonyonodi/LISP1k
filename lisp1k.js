"use strict";
var count = 0;
var Lisp = (function() {
  var self = Object.create(null);

  self.lex = function(string) {
    return string.replace(/\(|\)/g, " $& ")
                 .split(/\s/)
                 .filter(function(token) {
                    return token !== "";
                 });
  }

  self.parse = function(tokens) {
    var token,
      tokenAsNumber;

    if (tokens.length === 0) {
      throw "Syntax error: unexpected end of input."
    }
    // remove first token and save
    token = tokens.shift();

    if (token === "(") {
      var list = [];

      while (tokens[0] !== ")") {
        list.push(self.parse(tokens));
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

  self.apply = function(args, env) {
    return args.map(function(term) {
      return self.eval(term, env);
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
      appliedArgs = self.apply(args, env)
      return funcBody(appliedArgs, env);
    }
  }

  var nonPrimitiveFuncEval = function(func, args, env) {
    var newFuncEnv;

    newFuncEnv = Object.create(env);
    func.args;
    // append the arguments to the function's environment
    func.args.forEach(function(argName, i) {
      newFuncEnv[argName] = args[i];
    }, args);

    return self.eval(func.body, newFuncEnv)
  }

  var evaluateAtom = function(atom, env) {
    // Be aware that env[expression] || expression
    // will return the string "false" for "false".
    if (atom in env) {
      return env[atom];;
    } else {
      return atom;
    }
  }

  var evaluateList = function(expression, env) {
    var first,
      fnObject,
      args;

    first = expression[0];
    // if anonymous function evaluate to get fnObject
    if (Array.isArray(first)) {
      fnObject = self.eval(first, env);
    } else if (typeof first === "string") {
      fnObject = env[first];
    } else {
      throw first + " is not a function";
    }

    args = expression.slice(1);

    if (fnObject.isPrimitive === true) {
      return primitiveFuncEval(fnObject, args, env);
    } else if (fnObject.isPrimitive === false) {
      // use apply on args as there is no reason to delay
      // application for args in non-primitive functions
      args = self.apply(args, env);
      return nonPrimitiveFuncEval(fnObject, args, env);
    }
  }

  self.eval = function(expression, env) {
    var isList;

    isList = Array.isArray(expression);
    if (isList) {
      return evaluateList(expression, env);
    } else {
      return evaluateAtom(expression, env);
    }
  }

  self.run = function(code, env) {
    var tokens,
      ast,
      evaluated;

    tokens = self.lex(code);
    try {
      ast = self.parse(tokens);
    } catch (e) {
      return e;
    }
    evaluated = self.eval(ast, env);
    return evaluated;
  }

  self.repl = function(parentElement) {
    var lastListItem,
      form,
      repl;

    repl = this;

    repl.env = Object.create(self.defaultEnv);
    parentElement.append("<ul id=\"lisp-repl\"><li class=\"input-form\"><form><label>&gt;&gt;&gt;&nbsp;</label><input type=\"text\" autofocus></form></li></ul>");
    repl.container = parentElement.find("ul");
    lastListItem = repl.container.find("li").last();
    form = lastListItem.find("form");

    form.submit(function(event) {
      var inputElement,
        submitted,
        evaluated,
        replListElement;

      event.preventDefault();
      inputElement = $(event.target).find("input");
      submitted = inputElement.val();

      evaluated = self.run(submitted, repl.env);
      $("<li class=\"input\">" + submitted + "</li>").insertBefore(lastListItem);
      $("<li class=\"output\">" + evaluated + "</li>").insertBefore(lastListItem);
      inputElement.val("");
      // scroll to the bottom
      replListElement = $("#lisp-repl")
      replListElement.scrollTop(replListElement[0].scrollHeight);
    });
  }

  var defaultEnv = {
    "true": true,
    "false": false,
    "nil": null,
    "+": {
      body: function(input) {
        return input.reduce(function(prev, curr) {
          return prev + curr;
        }, 0);
      },
      isPrimitive: true,
      delayArgEvaluation: false
    },
    "-": {
      body: function(input) {
        var first;
        first = input.shift();
        return input.reduce(function(prev, curr) {
          return prev - curr;
        }, first);
      },
      isPrimitive: true,
      delayArgEvaluation: false
    },
    "*": {
      body: function(input) {
        return input.reduce(function(prev, curr) {
          return prev * curr;
        });
      },
      isPrimitive: true,
      delayArgEvaluation: false
    },
    "/": {
      body: function(input) {
        return input.reduce(function(prev, curr) {
          return prev / curr;
        });
      },
      isPrimitive: true,
      delayArgEvaluation: false
    },
    "=": {
      body: function(input) {
        var first;
          first = input.shift();
        return input.every(function(value) {
          return value === first;
        });
      },
      isPrimitive: true,
      delayArgEvaluation: false
    },
    "<": {
      body: function(input) {
        var first;
          first = input.shift();
        return input.every(function(value) {
          return first < value;
        });
      },
      isPrimitive: true,
      delayArgEvaluation: false
    },
    ">": {
      body: function(input) {
        var first;
          first = input.shift();
        return input.every(function(value) {
          return first > value;
        });
      },
      isPrimitive: true,
      delayArgEvaluation: false
    },
    "def": {
      body: function(input, env) {
        return env[input[0]] = input[1];
      },
      isPrimitive: true,
      delayArgEvaluation: false
    },
    "if": {
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
        evaluatedCondition = self.eval(condition, env);
        conditionIsFalsey = ((evaluatedCondition === false) || (evaluatedCondition === null));
        returnValue = conditionIsFalsey ? self.eval(falseExpression, env) :
                                          self.eval(trueExpression, env);

        return returnValue;
      },
      isPrimitive: true,
      delayArgEvaluation: true,
      delayArgEvaluation: true
    },
    "fn": {
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

  Object.defineProperty(self, "defaultEnv", {
      get: function() {
        return defaultEnv;
      }
  });

  return self;
})();
