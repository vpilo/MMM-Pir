const utils = require("./utils");

async function main () {
  // Let's start !
  utils.info(`Welcome to ${utils.moduleName()} v${utils.moduleVersion()}`);
  utils.empty();
  utils.info("① Checking OS...")
  let sysinfo = await utils.checkOS();
  console.log(sysinfo);
  utils.empty();
  utils.info("② ➤ dependencies installer");
  utils.empty();
}

main();
