import vscode, { WorkspaceConfiguration, Uri } from 'vscode';
import { join } from 'path';
import { TEMPLATES_DIR, readDir, readFile, writeFile, mkdir, exists, rename, unlink, copy } from './utils';

export interface Template {
  name?: string;
  label?: string;
  code?: string;
  resourceUri?: Uri;
  path?: string;
}

export interface TemplatesManager<T> {
  workspacePath: string;
  config: WorkspaceConfiguration,
  templates: Template[],
  getFilename(name: string): string,
  has(name: string): Promise<boolean>,
  get(name: string): Promise<string>,
  set(name: string, code: string): Promise<void>,
  clone(name: string, cloneName: string): Promise<void>,
  rename(oldName: string, newName: string): Promise<void>,
  remove(name: string): Promise<void>,
  update(): Promise<void>,
  onDidChange: vscode.EventEmitter<T>,
}

export default async function createTemplatesManager<T>(extensionPath: string, templatesDir: string): Promise<TemplatesManager<T>> {
  function getFilename(name: string) {
    return join(templatesDir, name);
  }

  if (!(await exists(templatesDir))) {
    await mkdir(templatesDir);
    const builtInTemplatesDir = await exists(TEMPLATES_DIR) ? TEMPLATES_DIR : join(extensionPath, 'templates');
    const builtInTemplates: string[] = await readDir(builtInTemplatesDir);
    await Promise.all(
      builtInTemplates.map(builtInTemplate => copy(join(builtInTemplatesDir, builtInTemplate), templatesDir)),
    );
  }
  const templates: Template[] = [];
  const onDidChange = new vscode.EventEmitter<T>();

  async function update() {
    const filenames = await readDir(templatesDir);
    const append: Template[] = await Promise.all(
      filenames.map(async (name: string) => ({
        name,
        code: await readFile(getFilename(name), 'utf8'),
      })),
    );
    templates.splice(0, templates.length, ...append);
    onDidChange.fire();
  }

  await update();

  return {
    get workspacePath() {
      return vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
    },
    get config() {
      return vscode.workspace.getConfiguration('templates');
    },
    templates,
    getFilename,
    async has(name: string) {
      return await exists(getFilename(name));
    },
    async get(name: string) {
      return await readFile(getFilename(name), 'utf8');
    },
    async set(name: string, code: string) {
      await writeFile(getFilename(name), code);
      update();
    },
    async clone(name: string, cloneName: string) {
      const code = await readFile(getFilename(name), 'utf8');
      await writeFile(getFilename(cloneName), code);
      update();
    },
    async rename(oldName: string, newName: string) {
      await rename(getFilename(oldName), getFilename(newName));
      update();
    },
    async remove(name: string) {
      await unlink(getFilename(name));
      update();
    },
    update,
    onDidChange,
  };
};
