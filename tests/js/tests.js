QUnit.test( "Lisp.lex tests.", function(assert) {
  var singleNumber = Lisp.lex("500");
  assert.deepEqual(singleNumber, ["500"], "Able to lex a single number.");

  var simpleList = Lisp.lex("(func 500 200)");
  assert.deepEqual(simpleList, ["(", "func", "500", "200", ")"], "Able to lex a simple list.");

  var whitespaceList = Lisp.lex("(\t\tblah\nwoo 500    )");
  assert.deepEqual(whitespaceList, ["(", "blah", "woo", "500", ")"], "Able to lex a list with odd whitespace.");
});

QUnit.test("Lisp.parse tests.", function(assert) {
  var number = Lisp.parse(Lisp.lex("5"));
  assert.equal(number, 5, "Parsed a number.");

  var trueVal = Lisp.parse(Lisp.lex("true"))
  assert.equal(trueVal, "true", "Evaluates true.");

  var falseVal = Lisp.parse(Lisp.lex("false"))
  assert.equal(falseVal, "false", "Evaluates false.");

  var scientificNotation = Lisp.parse(Lisp.lex("3e8"));
  assert.equal(scientificNotation, 300000000, "Parsed a number in scientific notation.");

  var name = Lisp.parse(Lisp.lex("anything"));
  assert.equal(name, "anything", "Parsed a name.");

  var list = Lisp.parse(Lisp.lex("(+ 1 2)"));
  assert.deepEqual(list, ["+", 1, 2], "Parsed a list.");

  var nestedList = Lisp.parse(Lisp.lex("(+ (* 3 4) (/ 5 6))"));
  assert.deepEqual(nestedList, ["+", ["*", 3, 4], ["/", 5, 6]], "Parsed a nested list.");

  assert.throws(function() {
    Lisp.parse(Lisp.lex("(+ (* 3 4 (- 2 5))"));
  }, /syntax error/i,
  "Threw error for incorrectly matched parens.")
});

QUnit.test("Lisp.prototype.eval tests.", function(assert) {
  var env = Lisp.defaultEnv;

  // atomic number
  var atomicNumber = Lisp.eval(5, env);
  assert.equal(atomicNumber, 5, "Evaluated atomic expression (number).");

  // atomic number
  var atomicBool = Lisp.eval(true, env);
  assert.equal(atomicBool, true, "Evaluated atomic expression (boolean).");

  var nestedExpressionResult = Lisp.eval(["*", ["+", 3, 3], ["+", 3, 3]], env);
  assert.equal(nestedExpressionResult, 36, "Nesting expressions works.");
});


QUnit.test("Primitive function tests.", function(assert) {
  var env = Lisp.defaultEnv;

  var additionResult = Lisp.eval(["+", 3, 4], env);
  assert.equal(additionResult, 7, "Addition works.");

  var additionResult = Lisp.eval(["-", 8, 2], env);
  assert.equal(additionResult, 6, "Subtraction works.");

  var multiplicationResult = Lisp.eval(["*", 2, 3], env);
  assert.equal(multiplicationResult, 6, "Multiplication works.");

  var divisionResult = Lisp.eval(["/", 15, 3], env);
  assert.equal(divisionResult, 5, "Division works.");

  var falseEqualitynResult = Lisp.eval(["=", 1, 2], env);
  assert.equal(falseEqualitynResult, false, "Equality returned false.");

  var trueEqualitynResult = Lisp.eval(["=", 1, 1], env);
  assert.equal(trueEqualitynResult, true, "Equality returned true.");

  var ifTrueResult = Lisp.eval(["if", true, 1, 2], env);
  assert.equal(ifTrueResult, 1, "If true works.");

  var ifFalseResult = Lisp.eval(["if", false, 1, 2], env);
  assert.equal(ifTrueResult, 1, "If false works.");

  var defReturnValue = Lisp.eval(["def", "x", 5], env);
  assert.equal(defReturnValue, 5, "Def returns assigned value");

  var savedVar = Lisp.eval("x", env);
  assert.equal(savedVar, 5, "Saving variables works.");

  var anonFnNoArgs = Lisp.eval([["fn", [], 5]], env);
  assert.equal(anonFnNoArgs, 5, "Evaluated anonymous function (no args)");

  var anonFnOneArg = Lisp.eval([["fn", ["x"], ["+", "x", 1]], 5], env);
  assert.equal(anonFnOneArg, 6, "Evaluated anonymous function (one arg).");

  var anonFnTwoArgs = Lisp.eval([["fn", ["x"], ["+", "x", 1]], 5], env);
  assert.equal(anonFnTwoArgs, 6, "Evaluated anonymous function (one arg).");
});

QUnit.test("Test recursion.", function(assert) {
  var env = Lisp.defaultEnv;

  // create recursive function
  var defineFactorial = "(def factorial (fn (n) (if (= n 0) 1 (* n (factorial (- n 1))))))";
  Lisp.parseEval(defineFactorial, env);

  // run recursive function
  var fiveFactorialResult = Lisp.parseEval("(factorial 5)", env);
  assert.equal(fiveFactorialResult, 120, "Able to recursively call function.");
});
