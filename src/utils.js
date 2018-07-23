const doT = require('doT');
const fs = require('fs');
const os = require('os');
const path = require('path');
const mkdirp = require('mkdirp');

function promisify(method, bindTo = null) {
  return (...args) =>
    new Promise((resolve, reject) => {
      args.push((error, value) => {
        if (error) {
          reject(error);
        } else {
          resolve(value);
        }
      });
      method.apply(bindTo, args);
    });
}
function falseCatch(fn) {
  return (...args) =>
    fn(...args)
      .then(() => true)
      .catch(() => false);
}

exports.copy = function(fromFilename, toDir) {
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

exports.stat = promisify(fs.stat, fs);
exports.isFile = path => exports.stat(path).then(stat => stat.isFile());
exports.isDir = path => exports.stat(path).then(stat => stat.isDirectory());
exports.access = promisify(fs.access, fs);
exports.exists = falseCatch(path => exports.access(path, fs.constants.F_OK));
exports.readDir = promisify(fs.readdir, fs);
exports.readFile = promisify(fs.readFile, fs);
exports.writeFile = promisify(fs.writeFile, fs);
exports.rename = promisify(fs.rename, fs);
exports.unlink = promisify(fs.unlink, fs);
exports.mkdir = promisify(mkdirp, fs);

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

exports.TEMPLATES_DIR = path.join(getOSAppDir(), 'Code', 'User', 'CodeTemplates');

const dotSettings = {
  evaluate: /\{\{([\s\S]+?)\}\}\n?/g,
  interpolate: /\{\{=([\s\S]+?)\}\}/g,
  encode: /\{\{!([\s\S]+?)\}\}\n?/g,
  use: /.*?\{\{#([\s\S]+?)\}\}\n?/g,
  define: /.*?\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}\n?/g,
  conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}\n?/g,
  iterate: /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})\n?/g,
  varname: '$',
  strip: false,
  append: true,
  selfcontained: false,
};

exports.compile = function(content, context) {
  return doT.template(content, dotSettings, context);
};

exports.interpolate = function(content, params, context) {
  const template = doT.template(content, dotSettings, context);
  return template(params);
};
