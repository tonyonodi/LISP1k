QUnit.test( "Lisp.lex tests.", function( assert ) {
  var singleNumber = Lisp.lex("500");
  assert.deepEqual(singleNumber, ["500"], "Able to lex a single number.");

  var simpleList = Lisp.lex("(func 500 200)");
  assert.deepEqual(simpleList, ["(", "func", "500", "200", ")"], "Able to lex a simple list.");

  var whitespaceList = Lisp.lex("(\t\tblah\nwoo 500    )");
  assert.deepEqual(whitespaceList, ["(", "blah", "woo", "500", ")"], "Able to lex a list with odd whitespace.");
});
