const assert = require('assert');

suite('Extension Tests', function () {

  after(() => {
    vscode.window.showInformationMessage('All tests done!');
  });
    
  // Defines a Mocha unit test
  test('Something 1', function () {
    assert.equal(-1, [1, 2, 3].indexOf(5));
    assert.equal(-1, [1, 2, 3].indexOf(0));
  });
});
