/*
 * Install src code without minify
 * @busgounet
*/

const path = require("node:path");
const { copyFileSync } = require("node:fs");
const { fdir } = require("fdir");

var files = [];
var isWin = process.platform === "win32";

let project = require("../package.json").name;

/**
 * search all javascript files
 */
async function searchFiles () {
  const components = await new fdir()
    .withBasePath()
    .filter((path) => path.endsWith(".js"))
    .crawl("../src")
    .withPromise();

  files = files.concat(components);
  console.log(`Found: ${files.length} files to install\n`);
}

/**
 * Install all files in array with Promise
 */
async function installFiles () {
  console.log("⚠ This Tools is reserved for develop only ⚠\n");
  await searchFiles();
  await Promise.all(files.map((file) => { return install(file); })).catch(() => process.exit(255));
  console.log("\n✅ All sources files are installed and ready for developing\n");
}

/**
 * Install filename with copyFileSync
 * @param {string} file to install
 * @returns {boolean} resolved with true
 */
function install (file) {
  var FileName, MyFileName;
  if (isWin) {
    FileName = file.replace("..\\src\\", "..\\");
    MyFileName = `${project}\\${FileName.replace("..\\", "")}`;
  } else {
    FileName = file.replace("../src/", "../");
    MyFileName = `${project}/${FileName.replace("../", "")}`;
  }
  let pathInResolve = path.resolve(__dirname, file);
  let pathOutResolve = path.resolve(__dirname, FileName);
  console.log("Process File:", MyFileName);
  return new Promise((resolve, reject) => {
    try {
      copyFileSync(pathInResolve, pathOutResolve);
      resolve(true);
    } catch {
      reject();
    }
  });
}

installFiles();
