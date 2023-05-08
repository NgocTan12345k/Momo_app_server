const fs = require("fs");

const deleteFile = (filePathArr) => {
  // fs.unlink(filePath, (err) => {
  //   if (err) {
  //     throw err;
  //   }
  // });
  filePathArr.forEach((path) => {
    try {
      fs.unlinkSync(path);
    } catch (error) {
      console.log(error);
    }
  });
};

exports.deleteFile = deleteFile;
