const fs = require("fs");
const path = require("path");
const distPath = path.join(__dirname, "..", "dist");

function createFolders([...folders] = ["pdf", "screenshots"]) {
  folders.forEach((folder) => {
    const folderPath = path.join(distPath, folder);
    fs.access(folderPath, (err) => {
      if (err) {
        fs.mkdir(folderPath, (err) => {
          if (err) console.error(err);
          console.log(`${folder} folder created`);
        });
      }
    });
  });
}

module.exports = {
  createFolders,
};
