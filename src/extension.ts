import vscode, { ExtensionContext } from 'vscode';
import createTemplatesManager from './TemplatesManager';
import createTemplatesTreeProvider from './TemplatesTreeProvider';

function log(callback: Function) {
  return async (...args: any[]) => {
    try {
      if (callback.name) {
        console.log(`Call ${callback.name}`); //eslint-disable-line no-console
      }
      return await callback(...args);
    } catch (e) {
      console.error(e.stack); //eslint-disable-line no-console
    }
  };
}

export async function activate({ globalStoragePath }: ExtensionContext) {
  const templatesManager = await createTemplatesManager(globalStoragePath);
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

export function deactivate() { }
