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

// const testScaleX = d3.scaleLinear().domain([
//   0,
//   PLOT_CANVAS_RANGE
// ]).range([0, PLOT_CANVAS_WIDTH]);
//
// const testScaleY = d3.scaleLinear().domain([
//   0,
//   PLOT_CANVAS_RANGE
// ]).range([PLOT_CANVAS_HEIGHT, 0]);

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
    } else {
      setTimeout(() => {
        drawInitialCentroids(kMeans.centroids);
      }, 750);
      setTimeout(() => {
        kMeans.kMeansAlgorithm();
      }, 750);
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
plotD3.attr('transform', 'rotate(-90)');

const convertRgbToHex = () => {

};

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
    .style('bottom', d3.select(d3.event.target).attr('cx') + 'px')
    .style('box-shadow', '0 1px 4px 0 rgba(12, 12, 13, 0.1)')
    .text(centroid.toString());
    // how many items in this cluster?
    // hex color?
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
    .style('box-shadow', 'none')
    .style('visibility', 'hidden');
};

export const clearD3PlotCentroids = () => {
  window.plotD3 = plotD3;
  debugger
  plotD3
    .selectAll('circle')
    .transition()
    .duration(500)
    .attr('r', 0)
    .remove();
  debugger
  // test without the transition?
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
    .attr('r', 9);
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
