const vscode = require('vscode');
const { join } = require('path');
const { TEMPLATES_DIR, readDir, readFile, writeFile, mkdir, exists, rename, unlink, copy } = require('./utils');

module.exports = async function createTemplatesManager(templatesDir) {
  function getFilename(name) {
    return join(templatesDir, name);
  }

  if (!(await exists(templatesDir))) {
    await mkdir(templatesDir);
    const builtInTemplatesDir = await exists(TEMPLATES_DIR) ? TEMPLATES_DIR : `${__dirname}/../templates`;
    const builtInTemplates = await readDir(builtInTemplatesDir);
    await Promise.all(
      builtInTemplates.map(builtInTemplate => copy(join(builtInTemplatesDir, builtInTemplate), templatesDir)),
    );
  }
  const templates = [];
  const onChange = [];

  async function update() {
    const filenames = await readDir(templatesDir);
    const append = await Promise.all(
      filenames.map(async (name) => ({
        name,
        code: await readFile(getFilename(name), 'utf8'),
      })),
    );
    templates.splice(0, templates.length, ...append);
    onChange.forEach(listener => listener());
  }

  await update();

  return {
    rootPath: vscode.workspace.rootPath,
    get config() {
      return vscode.workspace.getConfiguration('templates');
    },
    templates,
    getFilename,
    async has(name) {
      return await exists(getFilename(name));
    },
    async get(name) {
      return await readFile(getFilename(name), 'utf8');
    },
    async set(name, code) {
      await writeFile(getFilename(name), code);
      update();
    },
    async clone(name, cloneName) {
      const code = await readFile(getFilename(name), 'utf8');
      await writeFile(getFilename(cloneName), code);
      update();
    },
    async rename(oldName, newName) {
      await rename(getFilename(oldName), getFilename(newName));
      update();
    },
    async remove(name) {
      await unlink(getFilename(name));
      update();
    },
    update,
    onDidChange(listener) {
      onChange.push(listener);
    },
  };
};
