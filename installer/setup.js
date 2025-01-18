const utils = require("./utils");

var options = {};

async function main () {
  // Let's start !
  utils.empty();
  utils.info(`Welcome to ${utils.moduleName()} v${utils.moduleVersion()}`);
  utils.empty();
  options = utils.getOptions();
  await checkOS();
  utils.empty();
}

async function checkOS () {
  utils.info("① ➤ Checking OS...");
  const sysinfo = await utils.checkOS();
  switch (sysinfo.type) {
    case "Linux":
      utils.success(`OS Detected: Linux (${sysinfo.name} ${sysinfo.version} ${sysinfo.arch})`);
      await updatePackageInfoLinux();
      await installLinuxDeps();
      await installNPMDeps();
      await electronRebuild();
      await installFiles();
      done();
      break;
    case "Darwin":
      utils.error(`OS Detected: Darwin (${sysinfo.name} ${sysinfo.version} ${sysinfo.arch})`);
      utils.error("Automatic installation is not included");
      utils.empty();
      process.exit();
      break;
    case "Windows":
      utils.success(`OS Detected: Windows (${sysinfo.name} ${sysinfo.version} ${sysinfo.arch})`);
      await removeWindowsDeps();
      await installNPMDeps();
	  await electronRebuild();
      await installFiles();
      done();
      break;
  }

}

async function updatePackageInfoLinux () {
  utils.empty();
  utils.info("② ➤ Update package informations");
  utils.empty();
  return new Promise((resolve) => {
    utils.update((err) => {
      if (err) {
        utils.error("Error Detected!");
        process.exit();
      }
      resolve();
    })
      .on("stdout", function (data) {
        utils.out(data.trim());
      })
      .on("stderr", function (data) {
        utils.error(data.trim());
      });
  });
}

async function installLinuxDeps () {
  utils.empty();
  utils.info("③ ➤ Dependencies installer");
  utils.empty();
  const apt = options.apt;
  if (!apt.length) {
    utils.out("No dependecies needed!");
    return;
  }

  return new Promise((resolve) => {
    utils.check(apt, (result) => {
      if (!result.length) {
        utils.success("All Dependencies needed are installed !");
        resolve();
      }
      let modulesToInstall = result.toString().replace(",", " ");
      utils.empty();
      utils.info("Installing missing package...");
      utils.install(modulesToInstall, (err) => {
        if (err) {
          utils.error("Error Detected!");
          process.exit();
        }
        resolve();
      })
        .on("stdout", function (data) {
          utils.out(data.trim());
        })
        .on("stderr", function (data) {
          utils.error(data.trim());
        });
    });
  });
}

async function installNPMDeps () {
  utils.empty();
  utils.info("④ ➤ NPM Package installer");
  utils.empty();

  return new Promise((resolve) => {
    utils.prune((err) => {
      if (err) {
        utils.error("Error Detected!");
        process.exit();
      }
      resolve();
    })
      .on("stdout", function (data) {
        utils.out(data.trim());
      })
      .on("stderr", function (data) {
        utils.error(data.trim());
      });
  });
}

async function installFiles () {
  utils.empty();
  utils.info("⑤ ➤ Install Files");
  utils.empty();
  if (options.minify) await minify();
  else await develop();
}

async function minify () {
  return new Promise((resolve) => {
    utils.minify((err) => {
      if (err) {
        utils.error("Error Detected!");
        process.exit();
      }
      resolve();
    })
      .on("stdout", function (data) {
        utils.out(data.trim());
      })
      .on("stderr", function (data) {
        utils.error(data.trim());
      });
  });
}

async function develop () {
  return new Promise((resolve) => {
    utils.develop((err) => {
      if (err) {
        utils.error("Error Detected!");
        process.exit();
      }
      resolve();
    })
      .on("stdout", function (data) {
        utils.out(data.trim());
      })
      .on("stderr", function (data) {
        utils.error(data.trim());
      });
  });
}

async function electronRebuild () {
  utils.empty();
  utils.info("⑤ ➤ Rebuild MagicMirror...");
  utils.empty();
  if (!options.rebuild || (utils.isWin() && !options.windowsRebuild)) {
    utils.out("electron-rebuild is not needed.");
    return;
  }
  return new Promise((resolve) => {
    utils.electronRebuild((err) => {
      if (err) {
        utils.error("Error Detected!");
        process.exit();
      }
      resolve();
    })
      .on("stdout", function (data) {
        utils.out(data.trim());
      })
      .on("stderr", function (data) {
        utils.out(data.trim());
      });
  });
}

function done () {
  utils.empty();
  utils.success(`${utils.moduleName()} is now installed !`);
  utils.empty();
}

// Windows
async function removeWindowsDeps () {
  utils.empty();
  utils.info("② ➤ [Windows] Dependencies remover");
  utils.empty();
  const npm = options.windowsNPMRemove;
  if (!npm.length) {
    utils.out("No dependecies needed!");
    return;
  }
  let modulesToRemove = npm.toString().replace(",", " ");
  utils.info(`[Windows] removing: ${modulesToRemove}`);
  return new Promise((resolve) => {
    utils.npmRemove(modulesToRemove, (err) => {
      if (err) {
        utils.error("Error Detected!");
        process.exit();
      }
      resolve();
    })
      .on("stdout", function (data) {
        utils.out(data.trim());
      })
      .on("stderr", function (data) {
        utils.error(data.trim());
      });
  })
}

main();
