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
});

QUnit.test("Lisp.prototype.eval tests.", function(assert) {
  var lispInstance = new Lisp();

  // atomic number
  var atomicNumber = lispInstance.eval(5);
  assert.equal(atomicNumber, 5, "Evaluated atomic expression (number).");

  // atomic number
  var atomicBool = lispInstance.eval(true);
  assert.equal(atomicBool, true, "Evaluated atomic expression (boolean).");

  var nestedExpressionResult = lispInstance.eval(["*", ["+", 3, 3], ["+", 3, 3]]);
  assert.equal(nestedExpressionResult, 36, "Nesting expressions works.");
});


QUnit.test("Primitive function tests.", function() {
  var lispInstance = new Lisp();

  var additionResult = lispInstance.eval(["+", 3, 4]);
  assert.equal(additionResult, 7, "Addition works.");

  var additionResult = lispInstance.eval(["-", 8, 2]);
  assert.equal(additionResult, 6, "Subtraction works.");

  var multiplicationResult = lispInstance.eval(["*", 2, 3]);
  assert.equal(multiplicationResult, 6, "Multiplication works.");

  var divisionResult = lispInstance.eval(["/", 15, 3]);
  assert.equal(divisionResult, 5, "Division works.");

  var falseEqualitynResult = lispInstance.eval(["=", 1, 2]);
  assert.equal(falseEqualitynResult, false, "Equality returned false.");

  var trueEqualitynResult = lispInstance.eval(["=", 1, 1]);
  assert.equal(trueEqualitynResult, true, "Equality returned true.");

  var ifTrueResult = lispInstance.eval(["if", true, 1, 2]);
  assert.equal(ifTrueResult, 1, "If true works.");

  var ifFalseResult = lispInstance.eval(["if", false, 1, 2]);
  assert.equal(ifTrueResult, 1, "If false works.");

  var defReturnValue = lispInstance.eval([def, "x", 5]);
  assert.equal(defReturnValue, 5, "Def returns assigned value");

  var savedVar = lispInstance.eval("x");
  assert.equal(savedVar, 5, "Saving variables works.");

  var fnNoArgs = lispInstance.eval([["fn", [], 5]]);
  assert.equal(fnNoArgs, 5, "Evaluated anonymous function (no args)");

  var fnOneArg = lispInstance.eval([["fn", ["x"] ["+", "x", 1]], 5]);
  assert.equal(fnOneArg, 6, "Evaluated anonymous function (one arg).");

  var fnTwoArgs = lispInstance.eval([["fn", ["x"] ["+", "x", 1]], 5]);
  assert.equal(fnTwoArgs, 6, "Evaluated anonymous function (one arg).");
});
