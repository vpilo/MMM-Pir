/*
 * Code minifier
 * @busgounet
*/

const path = require("node:path");
const { fdir } = require("fdir");
const esbuild = require("esbuild");
const utils = require("./utils");

const isWin = utils.isWin();
const project = utils.moduleName();
const revision = utils.moduleRev();
const version = utils.moduleVersion();

const commentIn = "/**";
const commentOut = "**/";

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
  if (files.length) utils.success(`Found: ${files.length} files to install and minify\n`);
  else utils.warning("no files found!");
}

/**
 * Minify all files in array with Promise
 */
async function minifyFiles () {
  await searchFiles();
  if (files.length) await Promise.all(files.map((file) => { return minify(file); })).catch(() => process.exit(255));
}

/**
 * Minify filename with esbuild
 * @param {string} file to minify
 * @returns {boolean} resolved with true
 */
function minify (file) {
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

minifyFiles();
