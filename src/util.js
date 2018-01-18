import * as d3 from 'd3';

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

export const drawPixels = (labColors) => {
  plotCanvas.width = PLOT_CANVAS_WIDTH;
  plotCanvas.height = PLOT_CANVAS_HEIGHT;

  plotCtx.clearRect(0, 0, plotCanvas.width, plotCanvas.height);
  // debugger

  // FIXME: canvas top left is 0, 0 ...
  plotCtx.translate(0, plotCanvas.height);
  plotCtx.scale(1, -1);

  // TODO: for loop with i += 10 && animating each point to the canvas ?

  // labColors.forEach((color) => {
  //   // x-axis a* (green-red)
  //   const x = convertRangeA(color.a);
  //   // y-axis b* (blue-yellow)
  //   const y = convertRangeB(color.b);
  //   // L component is retained drawing the pixel
  //   plotCtx.fillStyle = color.toString();
  //   // plotCtx.fillRect(x, y, 2, 2);
  //   plotCtx.beginPath();
  //   plotCtx.arc(x, y, 1, 0,  2 * Math.PI, true);
  //   plotCtx.fill();
  //   plotCtx.closePath();
  // });

  // console.log(labColors.length);
  // // http://bl.ocks.org/biovisualize/5400576 TODO
  // for (var i = 0; i < labColors.length; i += 1) {
  //   // x-axis a* (green-red)
  //   const x = convertRangeA(labColors[i].a);
  //   // y-axis b* (blue-yellow)
  //   const y = convertRangeB(labColors[i].b);
  //   // L component is retained drawing the pixel
  //   plotCtx.fillStyle = labColors[i].toString();
  //   // plotCtx.fillRect(x, y, 2, 2);
  //   plotCtx.beginPath();
  //   plotCtx.arc(x, y, 1.5, 0, 2 * Math.PI, true);
  //   plotCtx.fill();
  //   plotCtx.closePath();
  // }

  // const drawPixel = (color) => {
  //   // x-axis a* (green-red)
  //   const x = convertRangeA(color.a);
  //   // y-axis b* (blue-yellow)
  //   const y = convertRangeB(color.b);
  //   // L component is retained drawing the pixel
  //   plotCtx.fillStyle = color.toString();
  //   // plotCtx.fillRect(x, y, 2, 2);
  //   plotCtx.beginPath();
  //   plotCtx.arc(x, y, 1.5, 0, 2 * Math.PI, true);
  //   plotCtx.fill();
  //   plotCtx.closePath();
  // };
  //
  // // const animate = () => {}
  // for (var i = 0; i < labColors.length; i++) {
  //   if (i < 90000) {
  //     requestAnimationFrame(drawPixel.bind(null, labColors[i]));
  //   }
  // }


  // TODO use a d3.timer instead and interpolate the cluster from a nearby point?
  // https://bocoup.com/blog/smoothly-animate-thousands-of-points-with-html5-canvas-and-d3
  let i = 0;
  const step = 1000;

  const drawPixel = () => {
    for (let j = i; j < i + step; j++) {
      if (labColors[j] === undefined) console.log(i);
      // x-axis a* (green-red)
      const x = convertRangeA(labColors[j].a);
      // y-axis b* (blue-yellow)
      const y = convertRangeB(labColors[j].b);
      // L component is retained drawing the pixel
      plotCtx.fillStyle = labColors[j].toString();
      // plotCtx.fillRect(x, y, 2, 2);
      plotCtx.beginPath();
      plotCtx.arc(x, y, 1.5, 0, 2 * Math.PI, true);
      plotCtx.fill();
      plotCtx.closePath();
    }

    // i += 1;
    i += step;
    if (i < 90000) {
      requestAnimationFrame(drawPixel);
    }
  };

  requestAnimationFrame(drawPixel);
};

export const updateIterationNumber = () => {
  const iterationCount = d3.select('#iteration-number');
  iterationCount.text(parseInt(iterationCount.text()) + 1);
};

const plotD3 = d3.select('#d3-plot');
plotD3.attr('width', PLOT_CANVAS_WIDTH);
plotD3.attr('height', PLOT_CANVAS_HEIGHT);
// plotD3.attr('transform', 'rotate(-90)');

// add tooltip div whose contents are redefined on mouseovers of colors
const tooltipColor = (
  plotD3
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)
);

// drawInitialCentroid to make it, drawCentroid will move it?
// try to do this with data?

const tooltipColorMouseover = (data) => {
  // TODO: color background function, which should
  // mouseoff make it transparent or white again ?
  // d3.select('body').style('background-color', centroid.toString());

  // deal with tooltip stuff, add text, etc.
  // dont forget .data(data)
};

const tooltipColorMouseout = (data) => {

};

export const drawInitialCentroids = (centroids) => {
  plotD3.selectAll('circle').remove();

  centroids.forEach((centroid, i) => {
    plotD3
      .append('circle')
      .attr('id', `centroid-${i}`)
      .attr('r', 9)
      .attr('cx', convertRangeA(centroid.a))
      .attr('cy', convertRangeB(centroid.b))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .attr('fill', centroid)
      .on('mouseover', tooltipColorMouseover)
      .on('mouseout', tooltipColorMouseout);
  });
};

export const redrawCentroid = (centroid) => {
  // select the cluster's centroid
  // move it + interpolate
};
