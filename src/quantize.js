import * as d3Color from 'd3-color';
import {
  IMG_CANVAS_WIDTH,
  IMG_CANVAS_HEIGHT,
} from './util';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Map each pixel to the color of the centroid from its cluster
export const drawQuantizedImage = (clusters, centroids) => {
  const buffer = (
    new Uint8ClampedArray(IMG_CANVAS_WIDTH * IMG_CANVAS_HEIGHT * 4)
  );

  clusters.forEach((cluster, i) => {
    cluster.forEach((color) => {
      const rgb = d3Color.rgb(centroids[i]);
      const j = color.pixelPosition * 4;
      buffer[j] = rgb.r;
      buffer[j + 1] = rgb.g;
      buffer[j + 2] = rgb.b;
      buffer[j + 3] = 255;
    });
  });

  const image = ctx.createImageData(IMG_CANVAS_WIDTH, IMG_CANVAS_HEIGHT);
  image.data.set(buffer);
  ctx.putImageData(image, 0, 0);
};
