import panini from 'panini';
import fs from 'fs';

var aReturn = [];
var directoryChecker = 0;
var directoryCheckerDone = 0;

module.exports = () => {
  panini.refresh();
  getListOfAllFilesFromFolder('./dist').then(() => {
      while (directoryChecker !== directoryCheckerDone) {
        setTimeout(() => {
        }, 500);
      }
      if (aReturn.length > 0) {
        const prepData = prepDataForHtmlLinkElement(aReturn);
        const indexListFileContent = `
          module.exports = function(content) {
            return ${JSON.stringify(createHtmlLinkElement(prepData))};
          };`;
        fs.readFile('./src/helpers/indexList.js', "utf8", (readError, data) => {
          if (readError) throw readError;
          if (data !== indexListFileContent) {
            fs.writeFile('./src/helpers/indexList.js', indexListFileContent, writeError => {
              if (writeError) throw writeError;
            });
          }
        });
      }
    }
  );
};

function getListOfAllFilesFromFolder(sDir) {
  return new Promise(function (resolve, reject) {
    if (fs.existsSync(sDir)) {
      const aFiles = fs.readdirSync(sDir);
      aFiles.forEach(file => {
        const sDirectoryCheck = `${sDir}/${file}`;
        if (fs.lstatSync(sDirectoryCheck).isDirectory()) {
          directoryChecker++;
          getListOfAllFilesFromFolder(sDirectoryCheck).then(() => directoryCheckerDone++);
        } else {
          if (file.search('.ftl') > 0) {
            aReturn.push(sDirectoryCheck);
          }
        }
      });
    }
    resolve();
  });
}

function prepDataForHtmlLinkElement(aFiles) {
  let fileCategories = [];

  aFiles.forEach(file => {
    const fileData = {
      category: getCategoryFromFilePath(file),
      type: getFileTypeFromFilePath(file),
      class: getElementFromFilePath(file, 6),
      link: `/displayFile?filePath=${file}`,
      country: getElementFromFilePath(file, 3),
      language: getElementFromFilePath(file, 4),
      market: getElementFromFilePath(file, 5)

    };
    if (fileCategories[getCategoryFromFilePath(file)] === undefined) {
      fileCategories[getCategoryFromFilePath(file)] = [];
    }
    fileCategories[getCategoryFromFilePath(file)].push(fileData);
  });

  fileCategories = sortArrayByKey(fileCategories);

  return fileCategories;
}

function createHtmlLinkElement(dataOfFiles) {
  let sReturn = "";
  Object.keys(dataOfFiles).forEach(fileKey => {
    if (fileKey !== "") {
      const objectOfFiles = dataOfFiles[fileKey].sort(sortArrayWithObjects('country'));
      let countryCheck = "";
      sReturn += `<h1 class="indexCategories" onClick="toggleList('${fileKey}')">${fileKey}</h1>
        <div class="sliderClosed indexCategoriesChild" id="${fileKey}_child">`;
      objectOfFiles.forEach(fileData => {
        if (countryCheck !== fileData.country) {
          if (countryCheck !== "") {
            sReturn += '</div>';
          }
          sReturn += `<div class="indexCountries" onClick="toggleList('${fileKey}_${fileData.country}')">${fileData.country}</div>
            <div class="sliderClosed indexCountriesChild" id="${fileKey}_${fileData.country}_child">`;
          countryCheck = fileData.country;
        }
        sReturn += `<a class="indexLinks" target="_blank" href="${fileData.link}">${fileData.market} ${fileData.type}</a><br>`;
      });
      sReturn += '</div></div>';
    }
  });
  return sReturn;
}

//get File Type Customer/Fulfiller
function getFileTypeFromFilePath(path) {
  let sReturn = "";
  if (path.search('customer') > 0) {
    sReturn = "Customer";
  } else {
    sReturn = "Fulfiller";
  }

  return sReturn;
}

//get File category
function getCategoryFromFilePath(path) {
  return getElementFromFilePath(path, 2);
}

function getElementFromFilePath(path, index) {
  return path.split('/')[index];
}
//sorts Array with Objects
function sortArrayWithObjects(property) {
  let sortOrder = 1;
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return (a, b) => {
    return ((a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0) * sortOrder;
  }
}

//sort array by keys
function sortArrayByKey(arrayWithKeys) {
  const returnArray = [];
  const listOfKeysFromArray = Object.keys(arrayWithKeys);
  listOfKeysFromArray.sort();
  listOfKeysFromArray.forEach(arrayKey => {
    returnArray[arrayKey] = arrayWithKeys[arrayKey];
  });
  return returnArray;
}
