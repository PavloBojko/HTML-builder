const fs = require('fs');
const { mkdir, readdir, copyFile, rm } = require('fs/promises');
const path = require('path');
const sourceHtmlFile = path.join(__dirname, 'template.html');
const destinationFolder = path.join(__dirname, 'project-dist');
const componentsFolder = path.join(__dirname, 'components');
const sourceStyles = path.join(__dirname, 'styles');
const styleCSSout = path.join(destinationFolder, 'style.css');
const asset = path.join(__dirname, 'assets');
const assetOut = path.join(destinationFolder, 'assets');

// читается ли файл template.html.
fs.access(sourceHtmlFile, fs.constants.R_OK, (err) => {
  if (err) {
    console.error(`File ${sourceHtmlFile} is not readable: ${err}`);
    return;
  }

  buildHtml();
});

// доступен ли для чтения каталог стилей.
fs.access(sourceStyles, fs.constants.R_OK, (err) => {
  if (err) {
    console.error(`Directory ${sourceStyles} is not readable: ${err}`);
    return;
  }

  mergeStyles(sourceStyles, styleCSSout);
});

// доступен ли для чтения assets
fs.access(asset, fs.constants.R_OK, (err) => {
  if (err) {
    console.error(`Directory ${asset} is not readable: ${err}`);
    return;
  }

  copyDir(asset, assetOut);
});

/**
 * файл html из шаблона.
 */
async function buildHtml() {
  await mkdir(destinationFolder, { recursive: true });
  const htmlWriteStream = fs.createWriteStream(path.join(destinationFolder, 'index.html'));
  const input = fs.createReadStream(sourceHtmlFile, 'utf-8');

  for await (let chunk of input) {
    const regexp = /{{\s*(\w+)\s*}}/g;
    let match;

    // Замените шаблон файлом компонента.
    while ((match = regexp.exec(chunk)) !== null) {
      const fileName = match[1];
      const replaceFilePath = path.join(componentsFolder, `${fileName}.html`);
      const replaceContent = await readComponent(replaceFilePath);

      chunk = chunk.replace(match[0], replaceContent);
    }

    htmlWriteStream.write(chunk);
  }

  htmlWriteStream.end();
}

// Чтение файла компонента
async function readComponent(replaceFilePath) {
  const readStream = fs.createReadStream(replaceFilePath, 'utf-8');
  let content = '';

  return new Promise((resolve, reject) => {
    readStream.on('data', (data) => {
      content += data;
    });

    readStream.on('end', () => {
      resolve(content);
    });

    readStream.on('error', reject);
  });
}

// Объединение стилей в один пакет.
async function mergeStyles(sourceStyles, destionationPath) {
  const objects = await readdir(sourceStyles, { withFileTypes: true });
  const writeStream = fs.createWriteStream(destionationPath);
  const cssFiles = [];

  // Создание массива необходимых файлов стилей.
  for (const obj of objects) {
    if (obj.isFile() && path.extname(obj.name) === '.css') {
      cssFiles.push(obj.name);
    }
  }

  // Записываем каждый файл стилей в место назначения.
  for (const [ind, fileName] of cssFiles.entries()) {
    const styleFilePath = path.join(sourceStyles, fileName);
    const input = fs.createReadStream(styleFilePath, 'utf-8');

    for await (const chunk of input) {
      writeStream.write(chunk);
    }

    if (ind === (cssFiles.length - 1)) continue;

    writeStream.write('\n');
  }

  writeStream.end();
}

// копирование каталогов
async function copyDir(sourcePath, destinationFolder) {
  try {

    await mkdir(destinationFolder, { recursive: true });
    await purge(destinationFolder, sourcePath);
    const objects = await readdir(sourcePath, { withFileTypes: true });

    // копируем содержымое каталогов
    for (const obj of objects) {
      const objName = obj.name;
      const sourceObjPath = path.join(sourcePath, objName);
      const destinationObjPath = path.join(destinationFolder, objName);

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

// Удаление файлов и каталогов
async function purge(destinationFolder, sourcePath) {
  const destinationObjects = await readdir(destinationFolder, { withFileTypes: true });
  for (const obj of destinationObjects) {
    if (obj.isDirectory()) {
      const destinationDirPath = path.join(destinationFolder, obj.name);
      await purge(destinationDirPath, sourcePath);
      await rm(destinationDirPath, { recursive: true });
    }
    else {
      const pathToCheck = path.join(sourcePath, obj.name);
      fs.access(pathToCheck, fs.F_OK, (err) => {
        if (err) {
          const destinationFilePath = path.join(destinationFolder, obj.name);
          rm(destinationFilePath, { recursive: true });
        }
      });
    }
  }
}