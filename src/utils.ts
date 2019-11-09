import doT, { TemplateSettings } from 'dot';
import fs, { Stats } from 'fs';
import os, { freemem } from 'os';
import path from 'path';
import mkdirp from 'mkdirp';
import { promisify } from 'util';

function falseCatch(fn: Function) {
  return (...args: any[]) =>
    fn(...args)
      .then(() => true)
      .catch(() => false);
}

export const copy = function (fromFilename: string, toDir: string) {
  const toFilename = path.join(toDir, path.basename(fromFilename));
  return new Promise((resolve, reject) => {
    const rs = fs.createReadStream(fromFilename);
    rs.on('error', reject).once('open', () => {
      const ws = fs.createWriteStream(toFilename);
      ws
        .on('error', reject)
        .on('open', () => rs.pipe(ws))
        .once('close', resolve);
    });
  });
};

export const stat = promisify(fs.stat.bind(fs));
export const isFile = (path: string) => exports.stat(path).then((stats: Stats) => stats.isFile());
export const isDir = (path: string) => exports.stat(path).then((stats: Stats) => stats.isDirectory());
export const access = promisify(fs.access.bind(fs));
export const exists = falseCatch((path: string) => exports.access(path, fs.constants.F_OK));
export const readDir = promisify(fs.readdir.bind(fs));
export const readFile = promisify(fs.readFile.bind(fs));
export const writeFile = promisify(fs.writeFile.bind(fs));
export const rename = promisify(fs.rename.bind(fs));
export const unlink = promisify(fs.unlink.bind(fs));
export const mkdir = promisify(mkdirp.bind(fs));

function getOSAppDir() {
  switch (process.platform) {
    case 'linux':
      return path.join(os.homedir(), '.config');
    case 'darwin':
      return path.join(os.homedir(), 'Library', 'Application Support');
    case 'win32':
      return process.env.APPDATA;
    default:
      throw Error('Unrecognizable operative system');
  }
}

export const TEMPLATES_DIR = path.join(getOSAppDir(), 'Code', 'User', 'CodeTemplates');

const dotSettings: TemplateSettings = {
  evaluate: /\{\{([\s\S]+?)\}\}\n?/g,
  interpolate: /\{\{=([\s\S]+?)\}\}/g,
  encode: /\{\{!([\s\S]+?)\}\}\n?/g,
  use: /.*?\{\{#([\s\S]+?)\}\}\n?/g,
  useParams:   /(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$\.]+|\"[^\"]+\"|\'[^\']+\'|\{[^\}]+\})/g,
  define: /.*?\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}\n?/g,
  defineParams:/^\s*([\w$]+):([\s\S]+)/,
  conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}\n?/g,
  iterate: /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})\n?/g,
  varname: '$',
  strip: false,
  append: true,
  selfcontained: false,
};

export const compile = function (content: string, context: any) {
  return doT.template(content, dotSettings, context);
};

export const interpolate = function (content: string, params: any, context: any) {
  const template = doT.template(content, dotSettings, context);
  return template(params);
};
