import './scss/main.scss';

import * as d3 from 'd3-selection';
import * as d3Color from 'd3-color';
import KMeans from './kmeans';
import Pixel from './pixel';
import { clearD3PlotCentroids } from './util';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let canvasImageData;
let canvasImageRgb;
let canvasImageLab;

let kMeans;
let pixelAnimation;

const inputK = d3.select('#k');
let k = parseInt(inputK.attr('value'));
inputK.on('change', () => {
  k = parseInt(d3.event.target.value);
});

const loadImage = path => {
  const img = new Image();
  img.src = path;
  img.crossOrigin = 'Anonymous';
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    newCanvasImage(img);
  };
};

const newCanvasImage = (img) => {
  let opacity = 0;

  const fadeInImage = () => {
    ctx.globalAlpha = opacity;
    ctx.drawImage(img, 0, 0);

    if (opacity < 1) {
      opacity += 0.03;
      requestAnimationFrame(fadeInImage);
    } else {
      ctx.drawImage(img, 0, 0);
      parseCanvasImage();
      runKMeans();
    }
  };

  fadeInImage();
};

const cancelKMeans = () => {
  if (kMeans && kMeans.runningKMeans) {
    kMeans.runningKMeans.stop();
  } else if (kMeans) {
    kMeans.cancelKMeans = true;
  }
};

const cancelPixelAnimation = () => {
  if (pixelAnimation) pixelAnimation.cancelAnimation = true;
};

const startNewKMeansRun = () => {
  kMeans = new KMeans(canvasImageLab, k);
  pixelAnimation = new Pixel(kMeans);
  pixelAnimation.drawPixels();
};

const getImageData = () => (
  ctx.getImageData(0, 0, canvas.width, canvas.height).data
);

const getRgbColors = () => {
  let rgbValues = [];
  for (let i = 0; i < canvasImageData.length; i += 4) {
    rgbValues.push(
      d3Color.rgb(
        ...canvasImageData.slice(i, i + 3),
        canvasImageData[i + 3] / 255
      )
    );
  }
  return rgbValues;
};

const getLabColors = () => (
  canvasImageRgb.map((rgbColor, i) => {
    const labColor = d3Color.lab(rgbColor);
    labColor.pixelPosition = i;
    return labColor;
  })
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

let lastChosenImageValue;
const chooseImage = () => {
  lastChosenImageValue = d3.event.target.value;
  loadImage(`public/assets/images/demos/${lastChosenImageValue}.jpg`);
};

d3.selectAll('input[name=image-number]')
  .on('change', chooseImage);

d3.select('.restart-iteration')
  .on('click', () => {
    loadImage(`public/assets/images/demos/${lastChosenImageValue}.jpg`);
  });

const parseCanvasImage = () => {
  canvasImageData = getImageData();
  canvasImageRgb = getRgbColors();
  canvasImageLab = getLabColors();
};

const runKMeans = () => {
  cancelKMeans();
  cancelPixelAnimation();
  clearD3PlotCentroids();
  setTimeout(startNewKMeansRun, 500);
};

setTimeout(() => {
  lastChosenImageValue = 1;
  loadImage(`public/assets/images/demos/1.jpg`);
}, 1000);
