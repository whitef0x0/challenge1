let fs = require('fs-extra');
let pug = require('pug');
let recursive = require('recursive-readdir');
let calipers = require('calipers')('gif');
let path = require('path');

Array.prototype.groupBy = function(prop) {
  return this.reduce(function(groups, item) {
    var val = item[prop];
    groups[val] = groups[val] || [];
    groups[val].push(item);
    return groups;
  }, {});
}

function ignoreNonGifs(file, stats) {
  // `file` is the path to the file, and `stats` is an `fs.Stats`
  // object returned from `fs.lstat()`.
  return stats.isFile() && path.extname(file).toLowerCase() !== ".gif";
}

async function calculateAspectRatio(imagePath){
	let imageObject = await calipers.measure(imagePath);
	let imageDim = imageObject.pages[0];
	
	//Return aspect ratio to sorting function
	return imageDim.width/imageDim.height;
}

function compareByAspectRatio(a,b) {
  if (a.aspectRatio < b.aspectRatio)
    return -1;
  if (a.aspectRatio > b.aspectRatio)
    return 1;
  return 0;
}


recursive("./data", [ignoreNonGifs], async function (fileReadError, files) {
  if(fileReadError) throw fileReadError;

  let fileObjectArray = await Promise.all(files.map(async function(imagePath){
  	let imageAspectRatio = await calculateAspectRatio(imagePath);
  	return {
  		path: imagePath,
  		aspectRatio: Math.round(imageAspectRatio*10)
  	}
  }));

 	let sortedFileArray = fileObjectArray.sort(compareByAspectRatio);
 	let groupedFiles = fileObjectArray.groupBy("aspectRatio");

 	//Render template with grouped files
 	let htmlTemplate = pug.renderFile('index_groupedfiles.pug', {fileGroups: groupedFiles});
  await fs.writeFile('../www/index.html', htmlTemplate);

});