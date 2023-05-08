const fs = require('fs');
const { mkdir, readdir, copyFile, rm } = require('fs/promises');
const path = require('path');
const oldDir = path.join(__dirname, 'files');
const newDir = path.join(__dirname, 'files-copy');

// Проверка,  доступен ли каталог для чтения.
fs.access(oldDir, fs.constants.R_OK, (err) => {
  if (err) {
    console.error(`Directory ${oldDir} is not readable: ${err}`);
    return;
  }

  copyDir(oldDir, newDir);
});

// Копировать каталог
async function copyDir(oldDir, newDir) {
  try {
    await mkdir(newDir,  {recursive: true} );
    await purge(newDir);

    const objects = await readdir(oldDir, {withFileTypes: true});
    // console.log(objects);

    // Копирует содержимое каталога.
    for (const obj of objects) {
      const objName = obj.name;
      const sourceObjPath = path.join(oldDir, objName);
      const destinationObjPath = path.join(newDir, objName);

      if (obj.isDirectory()) {
        await copyDir(sourceObjPath, destinationObjPath);
      }
      else {
        await copyFile(sourceObjPath, destinationObjPath);
      }

    }
  } catch (err) {

    console.error(err.message);
  }
}

async function purge(newDir) {
  const destinationObjects = await readdir(newDir, {withFileTypes: true});
  for (const obj of destinationObjects) {
    if (obj.isDirectory()) {
      const destinationDirPath = path.join(newDir, obj.name);
      await purge(destinationDirPath);
      await rm(destinationDirPath, {recursive: true});
    }
    else {
      const pathToCheck = path.join(oldDir, obj.name);
      fs.access(pathToCheck, fs.F_OK, (err) => {
        if (err) {
          const destinationFilePath = path.join(newDir, obj.name);
          rm(destinationFilePath, {recursive: true});
        }
      });
    }
  }
}
