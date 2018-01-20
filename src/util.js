import * as d3 from 'd3';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const plotCanvas = document.getElementById('plot');
const plotCtx = plotCanvas.getContext('2d');

const PLOT_CANVAS_WIDTH = 600;
const PLOT_CANVAS_HEIGHT = 600;

const PLOT_CANVAS_RANGE = 600;

// https://stackoverflow.com/questions/19099063/what-are-the-ranges-of-coordinates-in-the-cielab-color-space
const LAB_A_MIN = -87;
const LAB_A_RANGE = 185;
const LAB_B_MIN = -108;
const LAB_B_RANGE = 203;

const convertRangeA = coord => (
  (((coord - LAB_A_MIN) * PLOT_CANVAS_RANGE) / LAB_A_RANGE)
);

const convertRangeB = coord => (
  (((coord - LAB_B_MIN) * PLOT_CANVAS_RANGE) / LAB_B_RANGE)
);

// const testScaleX = d3.scaleLinear().domain([
//   0,
//   PLOT_CANVAS_RANGE
// ]).range([0, PLOT_CANVAS_WIDTH]);
//
// const testScaleY = d3.scaleLinear().domain([
//   0,
//   PLOT_CANVAS_RANGE
// ]).range([PLOT_CANVAS_HEIGHT, 0]);

// import { PLOT_CANVAS_WIDTH, PLOT_CANVAS_HEIGHT } from './util';

// class Pixel {
//   constructor() {
//     this.step = 600;
//     this.drawPixelTimer = null;
//   }
//
//   drawPixel() {
//     const step = this.step;
//     for (let j = i; j < i + step; j++) {
//       // x-axis a* (green-red)
//       const x = convertRangeA(labColors[j].a);
//       // y-axis b* (blue-yellow)
//       const y = convertRangeB(labColors[j].b);
//       // L component is retained drawing the pixel
//       plotCtx.fillStyle = labColors[j].toString();
//       plotCtx.beginPath();
//       plotCtx.arc(x, y, 1.5, 0, 2 * Math.PI, true);
//       plotCtx.fill();
//       plotCtx.closePath();
//     }
//
//     i += step;
//     if (i < 90000) {
//       drawPixelTimer = requestAnimationFrame(drawPixel);
//       // console.log(x);
//     } else {
//       setTimeout(() => drawInitialCentroids(kMeans.centroids), 750);
//       setTimeout(() => kMeans.kMeansAlgorithm(), 750);
//     }
//   }
//
//   drawPixels() {
//
//   }
// }

export const drawPixels = (kMeans) => {
  plotCanvas.width = PLOT_CANVAS_WIDTH;
  plotCanvas.height = PLOT_CANVAS_HEIGHT;

  plotCtx.clearRect(0, 0, plotCanvas.width, plotCanvas.height);
  plotCtx.translate(0, plotCanvas.height);
  plotCtx.scale(1, -1);

  // TODO use a d3.timer instead and interpolate the cluster from a nearby point?
  // https://bocoup.com/blog/smoothly-animate-thousands-of-points-with-html5-canvas-and-d3
  let i = 0;
  const step = 600;
  const { labColors } = kMeans;

  let drawPixelTimer;
  const drawPixel = () => {
    for (let j = i; j < i + step; j++) {
      // x-axis a* (green-red)
      const x = convertRangeA(labColors[j].a);
      // y-axis b* (blue-yellow)
      const y = convertRangeB(labColors[j].b);
      // L component is retained drawing the pixel
      plotCtx.fillStyle = labColors[j].toString();
      plotCtx.beginPath();
      plotCtx.arc(x, y, 1.5, 0, 2 * Math.PI, true);
      plotCtx.fill();
      plotCtx.closePath();
    }

    i += step;
    if (i < 90000) {
      requestAnimationFrame(drawPixel);
      // drawPixelTimer = requestAnimationFrame(drawPixel);
      // console.log(x);
    } else {
      setTimeout(() => drawInitialCentroids(kMeans.centroids), 750);
      setTimeout(() => kMeans.kMeansAlgorithm(), 750);
    }
  };

  // return drawPixelTimer;
  return requestAnimationFrame(drawPixel);
};

export const updateIterationNumber = () => {
  const iterationCount = d3.select('#iteration-number');
  iterationCount.text(parseInt(iterationCount.text()) + 1);
};

const plotD3 = d3.select('#d3-plot');
plotD3.attr('width', PLOT_CANVAS_WIDTH);
plotD3.attr('height', PLOT_CANVAS_HEIGHT);
plotD3.attr('transform', 'rotate(-90)');

const convertRgbToHex = (rgb) => (
  rgb.reduce((hexadecimal, value) => (
    hexadecimal + parseInt(value).toString(16)
  ), '')
);

const colorTooltip = (
  d3.select('.plot-container')
    .append('div')
    .attr('class', 'color-tooltip')
);

const colorTooltipMouseover = (centroid) => {
  d3.select(d3.event.target)
    .attr('stroke', 'rgba(255, 255, 255, 0.6)')
    .attr('stroke-width', 3);

  d3.select('body')
    .transition()
    .duration(400)
    .style(
      'background-color',
      `rgba${centroid.toString().slice(3, -1)}, 0.35)`
    );

  colorTooltip
    .style('visibility', 'visible')
    .style('left', d3.select(d3.event.target).attr('cy') + 'px')
    .style(
      'bottom',
      `${parseInt(d3.select(d3.event.target).attr('cx')) - 33}px`
    )
    .style('box-shadow', '0 1px 4px 0 rgba(12, 12, 13, 0.1)')
    .html(
      `<h1>RGB ${centroid.toString()}</h1>` +
      `<h2>HEX #${convertRgbToHex(
        centroid.toString().slice(4, -1).split(',')
      )}</h2>`
    )
    .on('mouseover', d => {
      colorTooltip
        .transition()
        .duration(0)
        .style('visibility', 'visible');
    })
    .on('mouseout', d => {
      colorTooltip
        .style('visibility', 'hidden');
    });
    // how many items in this cluster?
    // hex color?

    // TODO current issues:
    //   hovering over tooltips quickly is a bug bc no tooltip... bc of how i did it
    //   keep bg color while looking at tooltip
    //   cant cancel a building requestAnimationFrame...
};

const colorTooltipMouseout = (centroid) => {
  d3.select(d3.event.target)
    .attr('stroke', 'white')
    .attr('stroke-width', 2);

  d3.select('body')
    .transition()
    .duration(200)
    .style('background-color', 'transparent');

  colorTooltip
    .transition()
    .delay(50)
    .style('box-shadow', 'none')
    .style('visibility', 'hidden');
};

export const clearD3PlotCentroids = () => {
  d3.select('#iteration-number').text('0');

  window.plotD3 = plotD3;
  // debugger
  plotD3
    .selectAll('circle')
    .transition()
    .duration(500)
    .attr('r', 0)
    .remove();
  // debugger
};

export const drawInitialCentroids = (centroids) => {
  // x-axis is a* and y-axis is b*
  // (canvas was rotated -90deg to set origin to bottom-left)
  const circles = plotD3
    .selectAll('circle')
    .data(centroids)
    .enter()
    .append('circle')
    .attr('r', 0)
    .attr('cy', centroid => convertRangeA(centroid.a))
    .attr('cx', centroid => convertRangeB(centroid.b))
    .attr('stroke', 'white')
    .attr('stroke-width', 2)
    .attr('fill', centroid => centroid)
    .on('mouseover', colorTooltipMouseover)
    .on('mouseout', colorTooltipMouseout);

  circles
    .transition()
    .duration(2000)
    .ease(d3.easeBounce)
    .attr('r', 10);
};

export const redrawCentroids = (centroids) => {
  plotD3
    .selectAll('circle')
    .data(centroids)
    .transition()
    .duration(1000)
    .attr('cy', centroid => convertRangeA(centroid.a))
    .attr('cx', centroid => convertRangeB(centroid.b))
    .attr('fill', centroid => centroid);
};

// const voronoi = d3
//   .voronoi()
//   .y(color => convertRangeA(color.a) + Math.random() - 0.5 )
//   .x(color => convertRangeB(color.b) + Math.random() - 0.5 )
//   .extent([-1, -1], [plotD3.width + 1, plotD3.height + 1]);
//   // .size([600, 600])
//
// export const redrawClusters = (clusters) => {
//   plotD3
//     .append('path')
//     .data(voronoi.polygons(clusters[0]))
//     .style('stroke', 'tomato')
//     .style('fill', 'none')
//     .style('opacity', 0.1)
//     .attr('d', d => `M${d.join('L')}Z`);
// };

// const flattenArray = arrayOfArrays => (
//   [].concat.apply([], arrayOfArrays)
// );
//
// export const drawQuantizedImage = (clusters) => {
//   const allClusters = flattenArray(clusters);
//   const allClustersSorted
// };

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 300;

// get the length of each cluster
// map with each color
// reshape the image
// FIXME can't do that because they're not kept in order...
export const drawQuantizedImage = (clusters, centroids) => {
  const buffer = new Uint8ClampedArray(CANVAS_WIDTH * CANVAS_HEIGHT * 4);

  clusters.forEach((cluster, i) => {
    cluster.forEach((color) => {
      const rgb = d3.rgb(centroids[i]);
      const j = color.pixelPosition * 4;
      buffer[j] = rgb.r;
      buffer[j + 1] = rgb.g;
      buffer[j + 2] = rgb.b;
      buffer[j + 3] = 255;
    });
  });
  const image = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
  image.data.set(buffer);
  ctx.putImageData(image, 0, 0);
};
