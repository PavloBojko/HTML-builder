const fs = require('fs');
const path = require('path');
const { readdir } = require('fs/promises');
const sourceFile = path.join(__dirname, 'project-dist', 'bundle.css');
const source = path.join(__dirname, 'styles');

// Проверка,  доступен ли каталог для чтения.
fs.access(source, fs.constants.R_OK, (err) => {
  if (err) {
    console.error(`Directory ${source} is not readable: ${err}`);
    return;
  }
  merge(source, sourceFile);
});

// Объединие стилей
async function merge(source, sourceFile) {
  const object = await readdir(source, { withFileTypes: true });
  const writeStream = fs.createWriteStream(sourceFile);
  const cssFiles = [];

  // массив необходимых файлов
  for (const obj of object) {
    if (obj.isFile() && path.extname(obj.name) === '.css') {
      cssFiles.push(obj.name);
    }
  }

  // Записать в место назначения.
  for (const [ind, fileName] of cssFiles.entries()) {
    const styleFilePath = path.join(source, fileName);
    const input = fs.createReadStream(styleFilePath, 'utf-8');
    
    for await (const chunk of input) {
      writeStream.write(chunk);
    }
    if (ind === (cssFiles.length - 1)) continue;
    writeStream.write('\n');
  }

  writeStream.end();
}