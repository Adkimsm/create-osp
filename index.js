const fs = require("fs");
const path = require("path");
const argv = require("minimist")(process.argv.slice(2));
const prompts = require("prompts");
const { bold, dim, blue, yellow, green, red, gray } = require("kolorist");
const { version } = require("./package.json");

const cwd = process.cwd();

async function init() {
  console.log(`${bold("Open Source Project Starter")}  ${blue(`v${version}`)}`);

  let targetDir = argv._[0];
  if (!targetDir) {
    const { projectName } = await prompts({
      type: "text",
      name: "projectName",
      message: "Project name:",
      initial: "my-project",
    });
    targetDir = projectName.trim();

    const root = path.join(cwd, targetDir);

    if (!fs.existsSync(root)) {
      fs.mkdirSync(root);
    } else {
      const existing = fs.readdirSync(root);
      if (existing.length) {
        console.log(yellow(`Target directory "${targetDir}" is not empty.`));
        const { yes } = await prompts({
          type: "confirm",
          name: "yes",
          initial: "Y",
          message: "Remove existing files and continue?",
        });
        if (yes) {
          rmFolder(root);
        } else {
          return;
        }
      }
    }

    console.log(`${dim("📁")} ${dim(root)}`);
    console.log(dim("Scaffolding project in ") + targetDir + dim(" ..."));

    const templateDir = path.join(__dirname, "template");

    const { license } = await prompts({
      type: "select",
      name: "license",
      message: "License: ",
      choices: [
        /*bug*/ { title: "Apache License", value: "alv2" },
        { title: "GNU General Public License v3.0", value: "gplv3" },
        /*bug*/ { title: "MIT License", value: "mit" },
        { title: "BSD 2-Clause License", value: "bsdv2" },
        /*bug*/ { title: "BSD 3-Clause License", value: "bsdv3" },
        { title: "Boost Software License", value: "bsl" },
        /*bug*/ {
          title: "Creative Commons Zero v1.0 Universal",
          value: "cc01",
        },
        { title: "Eclipse Public License - v 2.0", value: "eplv2" },
        /*bug*/ {
          title: "GNU Affero General Public License v3.0",
          value: "agplv3",
        },
        { title: "GNU General Public License v2.0", value: "gplv2" },
        /*bug*/ {
          title: "GNU Lesser General Public License v2.1",
          value: "lgplv21",
        },
        { title: "Mozilla Public License 2.0", value: "mplv2" },
        /*bug*/ { title: "The Unlicense", value: "tu" },
      ],
    });
    fs.copyFileSync(
      path.join(templateDir, "licenses", license),
      path.join(root, "LICENSE")
    );
    console.log(green("Done."));
  }
}

function copy(src, dest) {
  try {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) return copyDir(src, dest);
    else return fs.copyFileSync(src, dest);
  } catch (e) {
    console.log(e);
  }
}

function copyDir(srcDir, destDir) {
  try {
    fs.mkdirSync(destDir, { recursive: true });
    for (const file of fs.readdirSync(srcDir)) {
      const srcFile = path.resolve(srcDir, file);
      const destFile = path.resolve(destDir, file);
      copy(srcFile, destFile);
    }
  } catch (e) {
    console.log(e);
  }
}

function rmFolder(pathS) {
  let files = [];
  if (fs.existsSync(pathS)) {
    files = fs.readdirSync(pathS);
    files.forEach(function (file, _index) {
      let curPath = path.join(pathS, file);
      if (fs.statSync(curPath).isDirectory()) {
        rmFolder(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
  }
}
init().catch((e) => {
  console.error(e);
});
