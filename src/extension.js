const vscode = require('vscode');
const createTemplatesManager = require('./TemplatesManager');
const createTemplatesTreeProvider = require('./TemplatesTreeProvider');

function log(callback) {
  return async (...args) => {
    try {
      if (callback.name) {
        console.log(`Call ${callback.name}`);
      }
      return await callback(...args);
    } catch (e) {
      console.error(e);
    }
  };
}

async function activate(context) {
  const templatesManager = await createTemplatesManager();
  const templatesTreeProvider = await createTemplatesTreeProvider(templatesManager);

  vscode.window.registerTreeDataProvider('templatesExplorer', templatesTreeProvider);

  vscode.commands.registerCommand('templates.showDialog', log(templatesTreeProvider.showDialog));
  vscode.commands.registerCommand('templates.createFile', log(templatesTreeProvider.createFile));
  vscode.commands.registerCommand('templates.create', log(templatesTreeProvider.create));
  vscode.commands.registerCommand('templates.clone', log(templatesTreeProvider.clone));
  vscode.commands.registerCommand('templates.rename', log(templatesTreeProvider.rename));
  vscode.commands.registerCommand('templates.edit', log(templatesTreeProvider.edit));
  vscode.commands.registerCommand('templates.delete', log(templatesTreeProvider.delete));
  vscode.commands.registerCommand('templates.refresh', log(templatesTreeProvider.refresh));
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;
