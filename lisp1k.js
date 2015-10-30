"use strict";

var Lisp = (function() {
  var self = Object.create(null);

  self.lex = function(string) {
    return string.replace(/\(/g, " ( ")
                 .replace(/\)/g, " ) ")
                 .split(/\s/)
                 .filter(function(token) {
                    return token !== "";
                 });
  }

  self.parse = function(tokens) {
    var token,
        tokenAsNumber;
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

    return self.eval(func.body, newFuncEnv)
  }

  self.eval = function(expression, env) {
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
        args = self.apply(args, env);
        return nonPrimitiveFuncEval(fnObject, args, env);
      } else {
        throw fnName + " is not a function";
      }
    }
  }

  self.repl = function(parentElement) {
    var lastListItem,
      form,
      that;

    that = this;

    that.env = new Env;
    parentElement.append("<ul id=\"lisp-repl\"><li class=\"input-form\"><form><label>&gt;&gt;&gt;&nbsp;</label><input type=\"text\" autofocus></form></li></ul>");
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

      lexed = self.lex(submitted);
      parsed = self.parse(lexed);
      evaluated = self.eval(parsed, that.env);
      $("<li class=\"input\">" + submitted + "</li>").insertBefore(lastListItem);
      $("<li class=\"output\">" + evaluated + "</li>").insertBefore(lastListItem);
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
        evaluatedCondition = self.eval(condition, that);
        conditionIsFalsey = ((evaluatedCondition === false) || (evaluatedCondition === null));
        returnValue = conditionIsFalsey ? self.eval(falseExpression, that) :
                                          self.eval(trueExpression, that);

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

  return self;
})();
