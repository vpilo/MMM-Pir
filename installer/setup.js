const utils = require("./utils");
const functions = require("./functions");

async function main () {
  // Let's start !
  utils.empty();
  utils.info(`Welcome to ${utils.moduleName()} v${utils.moduleVersion()}`);
  utils.empty();
  await checkOS();
  utils.empty();
}

async function checkOS () {
  utils.info("➤ Checking OS...");
  const sysinfo = await utils.checkOS();
  switch (sysinfo.type) {
    case "Linux":
      utils.success(`OS Detected: Linux (${sysinfo.name} ${sysinfo.version} ${sysinfo.arch})`);
      await functions.updatePackageInfoLinux();
      await functions.installLinuxDeps();
      await functions.installNPMDeps();
      await functions.electronRebuild();
      await functions.installFiles();
      functions.done();
      break;
    case "Darwin":
      utils.error(`OS Detected: Darwin (${sysinfo.name} ${sysinfo.version} ${sysinfo.arch})`);
      utils.error("Automatic installation is not included");
      utils.empty();
      process.exit(1);
      break;
    case "Windows":
      utils.success(`OS Detected: Windows (${sysinfo.name} ${sysinfo.version} ${sysinfo.arch})`);
      await functions.removeWindowsDeps();
      await functions.installNPMDeps();
      await functions.electronRebuild();
      await functions.installFiles();
      functions.done();
      break;
  }
}

main();
