const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'text.txt');
const writeStream = fs.createWriteStream(filePath);
const { stdin, stdout, stderr } = process;

stdout.write('Привет как тебя зовут?\n');

// Write.
stdin.on('data', data => {
  const dataStringified = data.toString();

  if (dataStringified.trim() === 'exit') {
    process.exit();
  }

  writeStream.write(data);
});

// Finish.
process.on('exit', code => {
  if (code === 0) {
    stdout.write('\nУдачи в изучении Node.js!\n');
  } else {
    stderr.write(`Error code: ${code}`);
  }
});

// Ctrl + C.
process.on('SIGINT', () => {
  process.exit(0);
});
