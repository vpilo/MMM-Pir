const os = require("node:os");
const util = require("node:util");
const Exec = util.promisify(require("node:child_process").exec);
const exec = require("child_process").exec;
const events = require("events");
const packageJSON = require("../package.json");

// color codes
const reset = "\x1B[0m";
const red = "\x1B[91m";
const orange = "\x1B[93m";
const green = "\x1B[92m";
const gray = "\x1B[2m";
const blue = "\x1B[94m";
const cyan = "\x1B[96m";

// installer options
function getOptions () {
  var options = packageJSON.installer
  const defaults = {
    "minify": true,
    "rebuild": false,
    "apt": []
  }
  if (!options || typeof options === "string") {
    warning("No installer options!");
    return defaults;
  }
  if (!Array.isArray(options.apt) && options.apt !== undefined) {
    warning("apt format Error!");
    options.apt = []
    return options;
  }
  options = configMerge({}, defaults, options);
  return options;
}
module.exports.getOptions = getOptions

// deep merge
function configMerge (result) {
  var stack = Array.prototype.slice.call(arguments, 1);
  var item;
  var key;
  while (stack.length) {
    item = stack.shift();
    for (key in item) {
      if (item.hasOwnProperty(key)) {
        if (typeof result[key] === "object" && result[key] && Object.prototype.toString.call(result[key]) !== "[object Array]") {
          if (typeof item[key] === "object" && item[key] !== null) {
            result[key] = configMerge({}, result[key], item[key]);
          } else {
            result[key] = item[key];
          }
        } else {
          result[key] = item[key];
        }
      }
    }
  }
  return result;
}

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
function checker (name, callback = () => {}) {
  exec(`dpkg -s ${name}`, function (err) {
    if (err) {
      return callback(0);
    }
    return callback(1);
  });
}

function check (names, callback = () => {}) {
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
function install (names, callback = () => {}) {
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
function prune (callback = () => {}) {
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

/**
 * search all javascript files
 */
function minify (callback = () => {}) {
  var emitter = new events.EventEmitter();
  var child = exec("cd installer && node minify", function (err) {
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
module.exports.minify = minify;

function develop (callback = () => {}) {
  var emitter = new events.EventEmitter();
  var child = exec("cd installer && node dev", function (err) {
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
module.exports.develop = develop;
