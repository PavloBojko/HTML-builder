const { stdin, stdout } = process;
const fs = require('fs');
const path = require('path');

stdout.write('Привет как тебя зовут?\n')
stdin.on('data', data => {
  fs.mkdir(path.join(__dirname, 'notes'), err => {
    if (err) throw err;
  });
  fs.writeFile(
    path.join(__dirname, 'notes', 'text.txt'),
    data.toString(),
    (err) => {
      if (err) throw err;
      console.log('Файл был создан');
      process.exit();
    }
  );
});
process.on('exit', () => stdout.write('Удачи в изучении Node.js!'));
