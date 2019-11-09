const assert = require('assert');
const vscode = require('vscode');

suite('Extension Tests', function () {

  vscode.window.showInformationMessage('Start all tests.');

  // Defines a Mocha unit test
  test('Something 1', function () {
    assert.equal(-1, [1, 2, 3].indexOf(5));
    assert.equal(-1, [1, 2, 3].indexOf(0));
  });

  test('Something 1', function (done) {
    this.timeout(60000);
  });
});
