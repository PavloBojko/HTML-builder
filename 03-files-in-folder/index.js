const fs = require('fs');
const { readdir, stat } = require('fs/promises');
const path = require('path');
const folderPath = path.join(__dirname, 'secret-folder');


fs.access(folderPath, fs.constants.R_OK, (err) => {
  if (err) {
    console.error(`Directory ${folderPath} is not readable: ${err}`);
    return;
  }

  readDir(folderPath, {withFileTypes: true});
});

async function readDir(folderPath, options = {}) {
  try {

    const objects = await readdir(folderPath, options);

    for (const obj of objects) {
      if (obj.isFile()) {
        const fileName = obj.name;
        const filePath = path.join(folderPath, fileName);
        const { name, ext } = path.parse(filePath);
        const fileStat = await stat(filePath);
        const size = fileStat.size;

        console.log(`${name} - ${ext.replace('.', '')} - ${size} bytes`);
      }
    }

  } catch (error) {

    console.error(error);
  }
}
