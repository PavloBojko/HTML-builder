const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'text.txt');

// fs.readFile(
//     path.join(__dirname, 'text.txt'),
//     'utf-8',
//     (err, data) => {
//         if (err) throw err;
//         console.log(data);
//     }
// );

 
//fs.ReadStream наследует от stream.Readable
var stream = new fs.ReadStream(filePath, {encoding: 'utf-8'});
 
stream.on('readable', function(){
    var data = stream.read();
    if (data!==null) {
      console.log(data);
    }
});
 
stream.on('end', function(){
    // console.log("THE END");
});
stream.on('error', function(err){
  if(err.code == 'ENOENT'){
      console.log("Файл не найден");
  }else{
      console.error(err);
  }
});

