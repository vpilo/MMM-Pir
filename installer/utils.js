const os = require("node:os");
const util = require("node:util");
const Exec = util.promisify(require("node:child_process").exec);
const exec = require("child_process").exec;
const events = require("events");
const Path = require("node:path");
const { fdir } = require("fdir");
const esbuild = require("esbuild");
const packageJSON = require("../package.json");

const isWin = process.platform === "win32";
const project = packageJSON.name;
const revision = packageJSON.rev;
const version = packageJSON.version;

const commentIn = "/**";
const commentOut = "**/";
var files = [];

// color codes
const reset = "\x1B[0m";
const red = "\x1B[91m";
const orange = "\x1B[93m";
const green = "\x1B[92m";
const gray = "\x1B[2m";
const blue = "\x1B[94m";
const cyan = "\x1B[96m";

function message (text, color) {
  console.log(`${color}${text}${reset}`);
}

// Display an empty line
function empty () {
  message("", reset);
}

// Display question in cyan
function question (text) {
  message(text, cyan);
}

// Display a error in red
function error (text) {
  message(text, red);
}

// Display a warning in yellow
function warning (text) {
  message(text, orange);
}

// Display a success in green
function success (text) {
  message(text, green);
}

// Display out std message in gray
function out (text) {
  message(text, gray);
}

// Display an information in blue
function info (text) {
  message(text, blue);
}

// Display module Name
function moduleName () {
  return packageJSON.name || "Unknow";
}

// Display module Version
function moduleVersion () {
  return packageJSON.version || "X.Y.Z";
}

// Display module rev date
function moduleRev () {
  return packageJSON.Rev || "------";
}

// checkOS

async function execCMD (command) {
  const { stdout, stderr } = await Exec(command);
  if (stderr) return "Error";
  else return stdout.trim();
}

async function checkOS () {
  let type = os.type();
  let sysinfo = {
    type: null,
    arch: null,
    name: null,
    version: null
  };

  switch (type) {
    case "Linux":
      sysinfo.type = "Linux";
      sysinfo.arch = await execCMD("uname -m");
      sysinfo.name = await execCMD("cat /etc/*release | grep ^ID= | cut -f2 -d=");
      sysinfo.version = await execCMD("cat /etc/*release | grep ^VERSION_ID= | cut -f2 -d= | tr -d '\"'");
      return sysinfo;
    case "Darwin":
      sysinfo.type = "Darwin";
      sysinfo.arch = await execCMD("uname -m");
      sysinfo.name = await execCMD("sw_vers -productName");
      sysinfo.version = await execCMD("sw_vers -productVersion");
      return sysinfo;
    case "Windows_NT":
      sysinfo.type = "Windows";
      return sysinfo;
    default:
      sysinfo.type = undefined;
      return sysinfo;
  }
}

module.exports.empty = empty;
module.exports.question = question;
module.exports.error = error;
module.exports.warning = warning;
module.exports.success = success;
module.exports.out = out;
module.exports.info = info;
module.exports.moduleName = moduleName;
module.exports.moduleVersion = moduleVersion;
module.exports.moduleRev = moduleRev;
module.exports.checkOS = checkOS;

/* apt tools */

/**
 * check the currently installed of the module using dpkg -s
 * return: null if installed or err if not installed
 */
function checker (name, callback) {
  exec(`dpkg -s ${name}`, function (err) {
    if (err) {
      return callback(0);
    }
    return callback(1);
  });
}

function check (names, callback) {
  var modules = [];
  names.forEach((name, i) => {
    checker(name, (result) => {
      if (result === 0) {
        warning(`Missing package: ${name}`);
        modules.push(name);
      }
      if (i === names.length - 1) callback(modules);
    });
  });
}

/**
 * Update the apt cache using apt-get update
 */
function update (callback = () => {}) {
  var emitter = new events.EventEmitter();
  var child = exec("sudo apt-get update", function (err) {
    if (err) {
      return callback(err);
    }

    return callback();
  });

  child.stdout.on("data", function (data) {
    emitter.emit("stdout", data);
  });

  child.stderr.on("data", function (data) {
    emitter.emit("stderr", data);
  });

  return emitter;
}

/**
 * Install the module with the given names
 *
 * @param   {String}    names                names of the modules to install
 */
function install (names, callback) {
  var emitter = new events.EventEmitter();
  var child = exec(`sudo apt-get install -y ${names}`, function (err) {
    if (err) {
      return callback(err);
    }

    return callback();
  });

  child.stdout.on("data", function (data) {
    emitter.emit("stdout", data);
  });

  child.stderr.on("data", function (data) {
    emitter.emit("stderr", data);
  });

  return emitter;
}

/**
 * Install npm dependencies
 */
function prune (callback) {
  var emitter = new events.EventEmitter();
  var child = exec("npm prune", function (err) {
    if (err) {
      return callback(err);
    }

    return callback();
  });

  child.stdout.on("data", function (data) {
    emitter.emit("stdout", data);
  });

  child.stderr.on("data", function (data) {
    emitter.emit("stderr", data);
  });

  return emitter;
}

module.exports.check = check;
module.exports.update = update;
module.exports.install = install;
module.exports.prune = prune;

/*
 * Code minifier
 * @busgounet
*/

/**
 * search all javascript files
 */
async function searchFiles () {
  const components = await new fdir()
    .withBasePath()
    .filter((path) => path.endsWith(".js"))
    .crawl("./src")
    .withPromise();

  files = files.concat(components);
  info(`Found: ${files.length} files to install and minify\n`);
}

/**
 * Minify all files in array with Promise
 */
async function minifyFiles () {
  await searchFiles();
  await Promise.all(files.map((file) => { return minify(file); })).catch(() => {
    error("Error Detected");
    process.exit();
  });
}

/**
 * Minify filename with esbuild
 * @param {string} file to minify
 * @returns {boolean} resolved with true
 */
function minify (file) {
  var FileName, MyFileName;
  const modulePath = Path.resolve(__dirname, "../");
  if (isWin) {
    FileName = file.replace("src\\", ""); minify;
    MyFileName = `${project}\\${FileName}`;
  } else {
    FileName = file.replace("src/", "");
    MyFileName = `${project}/${FileName}`;
  }
  let pathInResolve = Path.resolve(modulePath, file);
  let pathOutResolve = Path.resolve(modulePath, FileName);
  return new Promise((resolve, reject) => {
    try {
      out(`Process File: ${MyFileName}`);
      esbuild.buildSync({
        entryPoints: [pathInResolve],
        allowOverwrite: true,
        minify: true,
        outfile: pathOutResolve,
        banner: {
          js: `${commentIn} ${project}\n  * File: ${MyFileName}\n  * Version: ${version}\n  * Revision: ${revision}\n  * ⚠ This file must not be modified ⚠\n${commentOut}`
        },
        footer: {
          js: `${commentIn} ❤ Coded With Heart by @bugsounet -- https://www.bugsounet.fr ${commentOut}`
        }
      });
      resolve(true);
    } catch {
      reject();
    }
  });
}
module.exports.minify = minifyFiles;
