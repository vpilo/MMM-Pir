const packageJSON = require("../package.json");
const utils = require("./utils");

async function main () {
  // Let's start !
  utils.empty();
  utils.info(`Welcome to ${utils.moduleName()} v${utils.moduleVersion()}`);
  utils.empty();
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
      console.log("done");
      break;
    case "Darwin":
      utils.error(`OS Detected: Darwin (${sysinfo.name} ${sysinfo.version} ${sysinfo.arch})`);
      utils.error("Automatic installation is not included");
      utils.empty();
      process.exit();
      break;
    case "Windows":
      utils.success(`OS Detected: Windows (${sysinfo.name} ${sysinfo.version} ${sysinfo.arch})`);
      installWindowsDeps();
      break;
  }

}

function updatePackageInfoLinux () {
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
  const apt = packageJSON.apt;
  if (!apt || typeof apt === "string") {
    utils.out("No dependecies needed!");
    return;
  }
  if (!Array.isArray(apt)) {
    utils.error("apt format Error!");
    return;
  }
  if (!apt.length) {
    utils.out("No dependecies needed!");
    return;
  }
  /* eslint-disable no-async-promise-executor */
  // to do better
  return new Promise(async (resolve) => {
    var modulesToInstall = await utils.check(apt);
    modulesToInstall = modulesToInstall.toString().replace(",", " ");
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
}

async function installWindowsDeps () {
  utils.empty();
  utils.info("② ➤ Dependencies installer");
  utils.empty();

  utils.show("curl", (err, data) => { console.log("--->", err, data); });
  utils.install("python3", (err, data) => { console.log("--->", err, data); })
    .on("stdout", function (data) {
      utils.out(data.trim());
    })
    .on("stderr", function (data) {
      utils.error(data.trim());
    });


}

main();
