import './scss/main.scss';

// TODO: only use the required imports
// https://github.com/d3/d3-tile/issues/39
import * as d3 from 'd3';
import KMeans from './kmeans';
import { drawPixels, clearD3PlotCentroids } from './util';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// TODO: update k on change of input's value.
// TODO: latch onto kmeans timer as a global var so we can clear if necessary?
let k = parseInt(d3.select('#k').attr('value'));

let canvasImageData;
let canvasImageRgb;
let canvasImageLab;
let kMeansAlgorithmTimer;

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

    clearInterval(kMeansAlgorithmTimer);
    // debugger
    clearD3PlotCentroids();
    setTimeout(() => {
      const kMeans = new KMeans(canvasImageLab, k);
      kMeansAlgorithmTimer = drawPixels(kMeans);
    }, 500);
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
  // if (i === 10) {
  //   input type=file, add a separate file handler... can I pass data URI in?
  //   going to have to rescale / fit it to 300 somehow.
  // }
}

const chooseImage = () => {
  loadImage(`public/assets/images/demos/${d3.event.target.value}.jpg`);
};

d3.selectAll('input[name=image-number]').on('change', chooseImage);
