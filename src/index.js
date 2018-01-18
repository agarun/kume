import './scss/main.scss';

// TODO: only use the required imports
// https://github.com/d3/d3-tile/issues/39
import * as d3 from 'd3';
import KMeans from './kmeans';

// TODO: ES2017 version, need to integrate a transpiler
// async function getCanvas() {
//   const ctx = document.getElementById('canvas').getContext('2d');
//
//   let img = await loadImage('../assets/images/demos/1.jpg');
//   ctx.drawImage(img, 0, 0);
// }
//
// function loadImage(path) {
//   return new Promise(
//     resolve => {
//       let img = new Image();
//       img.onload = () => resolve(i);
//       img.src = path;
//     }
//   )
// }

// TODO: image uploads via
// https://stackoverflow.com/questions/10906734/how-to-upload-image-into-html5-canvas

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let canvasImageData;
let canvasImageRgb;
let canvasImageLab;

const loadImage = path => {
  const img = new Image();
  // TODO: use this with file upload:
  // https://stackoverflow.com/questions/10906734/how-to-upload-image-into-html5-canvas
  // TODO: or alternatively get Data URI of the image:
  // https://stackoverflow.com/questions/4773966/drawing-an-image-from-a-data-url-to-a-canvas
  // const url = window.URL.createObjectURL(path);
  img.src = path;
  img.crossOrigin = 'Anonymous';
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    canvasImageData = setImageData();
    canvasImageRgb = getRgbColors();
    canvasImageLab = getLabColors();

    const kmeans = new KMeans(canvasImageLab, 3);
    setTimeout(() => kmeans.kMeansAlgorithm(), 3000);

  };
};

const setImageData = () => {
  const canvasImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return canvasImage.data;
};

const getRgbColors = () => {
  let rgbValues = [];
  for (let i = 0; i < canvasImageData.length; i += 4) {
    rgbValues.push(
      d3.rgb(
        ...canvasImageData.slice(i, i + 3),
        canvasImageData[i + 3] / 255
      )
    );
  }
  return rgbValues;
};

const getLabColors = () => (
  canvasImageRgb.map(rgbColor => (
    d3.lab(rgbColor)
  ))
);

for (var i = 1; i < 10; i++) {
  const newLi = d3
    .select('.image-number')
    .append('li');
  newLi
    .append('input')
    .attr('type', 'radio')
    .attr('id', `image-${i}`)
    .attr('name', 'image-number')
    .attr('value', i);
  newLi
    .append('label')
    .attr('for', `image-${i}`)
    .html(i);
}

const chooseImage = () => {
  loadImage(`public/assets/images/demos/${d3.event.target.value}.jpg`);
};

d3.selectAll('input[name=image-number]').on('change', chooseImage);
