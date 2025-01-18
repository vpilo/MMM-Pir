/*
 * Install new source code to src (develop)
 * @busgounet
*/

const path = require("node:path");
const { copyFileSync } = require("node:fs");
const { fdir } = require("fdir");
const utils = require("./utils");

const isWin = utils.isWin();
const project = utils.moduleName();

var files = [];

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
  if (files.length) utils.success(`Found: ${files.length} files to install\n`);
  else utils.warning("no files found!");
}

/**
 * Install all files in array with Promise
 */
async function installFiles () {
  await searchFiles();
  if (files.length) {
    await Promise.all(files.map((file) => { return install(file); })).catch(() => process.exit(255));
    utils.success("\n✅ All new sources files are copied to the src folder\n");
  }
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
  utils.out(`Process File: \x1B[3m${MyFileName}`);
  return new Promise((resolve, reject) => {
    try {
      copyFileSync(pathOutResolve, pathInResolve);
      resolve(true);
    } catch {
      reject();
    }
  });
}

installFiles();
