const os = require("node:os");

const util = require("node:util");
const packageJSON = require("../package.json");
const exec = util.promisify(require("node:child_process").exec);


// color codes
const reset = "\x1B[0m";
const red = "\x1B[91m";
const orange = "\x1B[93m";
const green = "\x1B[92m";
const gray = "\x1B[2m";
const blue = "\x1B[94m";
const cyan = "\x1B[96m";
//const pink = "\x1B[95m";

function message (text, color) {
  console.log(`${color}${text}${reset}`);
}

module.exports = {
  // Display an empty line
  empty () {
    message("", reset);
  },

  // Display question in cyan
  question (text) {
    message(text, cyan);
  },

  // Display a error in red
  error (text) {
    message(text, red);
  },

  // Display a warning in yellow
  warning (text) {
    message(text, orange);
  },

  // Display a success in green
  success (text) {
    message(text, green);
  },

  // Display out std message in gray
  out (text) {
    message(text, gray);
  },

  // Display an information in blue
  info (text) {
    message(text, blue);
  },

  // Display module Name
  moduleName () {
    return packageJSON.name || "Unknow";
  },

  // Display module Version
  moduleVersion () {
    return packageJSON.version || "X.Y.Z";
  },

  // Display module rev date
  moduleRev () {
    return packageJSON.Rev || "------";
  },

  // checkOS

  async execCMD (command) {
    const { stdout, stderr } = await exec(command);
    if (stderr) return "Error";
    else return stdout.trim();
  },


  async checkOS () {
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
        sysinfo.arch = await this.execCMD("uname -m");
        sysinfo.name = await this.execCMD("cat /etc/*release | grep ^ID= | cut -f2 -d=");
        sysinfo.version = await this.execCMD("cat /etc/*release | grep ^VERSION_ID= | cut -f2 -d= | tr -d '\"'");
        return sysinfo;
      case "Darwin":
        sysinfo.type = "Darwin";
        sysinfo.arch = await this.execCMD("uname -m");
        sysinfo.name = await this.execCMD("sw_vers -productName");
        sysinfo.version = await this.execCMD("sw_vers -productVersion");
        return sysinfo;
      case "Windows_NT":
        sysinfo.type = "Windows";
        return sysinfo;
      default:
        sysinfo.type = undefined;
        return sysinfo;
    }
  }

  /*
  case "$OSTYPE" in
    linux*)   platform="linux"
              arch="$(uname -m)"
              os_name="$(cat /etc/*release | grep ^ID= | cut -f2 -d=)"
              os_version="$(cat /etc/*release | grep ^VERSION_ID= | cut -f2 -d= | tr -d '"')"
              ;;
    darwin*)  platform="osx"
              arch="$(uname -m)"
              os_name="$(sw_vers -productName)"
              os_version="$(sw_vers -productVersion)"
              ;;
    *)        Installer_error "$OSTYPE is not a supported platform"
              exit 0;;
  esac
}
*/
  /*
  isWin () {
    return process.platform === "win32";
  },
  */
};
