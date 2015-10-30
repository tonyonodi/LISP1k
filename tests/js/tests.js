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

  var scientificNotation = Lisp.parse(Lisp.lex("3e8"));
  assert.equal(scientificNotation, 300000000, "Parsed a number in scientific notation.");

  var name = Lisp.parse(Lisp.lex("anything"));
  assert.equal(name, "anything", "Parsed a name.");

  var list = Lisp.parse(Lisp.lex("(+ 1 2)"));
  assert.deepEqual(list, ["+", 1, 2], "Parsed a list.");

  var nestedList = Lisp.parse(Lisp.lex("(+ (* 3 4) (/ 5 6))"));
  assert.deepEqual(nestedList, ["+", ["*", 3, 4], ["/", 5, 6]], "Parsed a nested list.");
});
