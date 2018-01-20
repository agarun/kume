import {
  PLOT_CANVAS_WIDTH,
  PLOT_CANVAS_HEIGHT,
  convertRangeA,
  convertRangeB,
  drawInitialCentroids,
} from './util';

class Pixel {
  constructor(kMeans) {
    this.i = 0;
    this.step = 600;
    this.drawPixelTimer = null;
    this.cancelAnimation = null;
    this.kMeans = kMeans;
    this.labColors = kMeans.labColors;

    this.canvas = document.getElementById('plot');
    this.ctx = this.canvas.getContext('2d');
    this.drawPixel = this.drawPixel.bind(this);
    this.resetCanvas();
  }

  resetCanvas() {
    const canvas = this.canvas;
    const ctx = this.ctx;

    canvas.width = PLOT_CANVAS_WIDTH;
    canvas.height = PLOT_CANVAS_HEIGHT;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
  }

  drawPixel() {
    if (this.cancelAnimation) return;

    const step = this.step;
    const ctx = this.ctx;
    const labColors = this.labColors;
    const kMeans = this.kMeans;

    for (let j = this.i; j < this.i + step; j++) {
      // x-axis a* (green-red)
      const x = convertRangeA(labColors[j].a);
      // y-axis b* (blue-yellow)
      const y = convertRangeB(labColors[j].b);
      // L component is still retained drawing the pixel
      ctx.fillStyle = labColors[j].toString();
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, 2 * Math.PI, true);
      ctx.fill();
      ctx.closePath();
    }

    this.i += step;
    if (this.i < 90000) {
      this.drawPixelTimer = requestAnimationFrame(this.drawPixel);
    } else {
      setTimeout(() => drawInitialCentroids(kMeans.centroids), 750);
      setTimeout(() => kMeans.kMeansAlgorithm(), 750);
    }
  }

  drawPixels() {
    this.drawPixelTimer = requestAnimationFrame(this.drawPixel);
  }
}

export default Pixel;
// TODO: use a d3.timer instead and interpolate the cluster from a nearby point?
// https://bocoup.com/blog/smoothly-animate-thousands-of-points-with-html5-canvas-and-d3
