import * as d3 from 'd3-selection';
import * as d3Ease from 'd3-ease';
import * as d3Color from 'd3-color';
import transition from 'd3-transition';

export const PLOT_CANVAS_WIDTH = 600;
export const PLOT_CANVAS_HEIGHT = 600;
export const PLOT_CANVAS_RANGE = 600;

const IMG_CANVAS_WIDTH = 300;
const IMG_CANVAS_HEIGHT = 300;

// Reference for CIELAB bounds:
// https://stackoverflow.com/questions/19099063/what-are-the-ranges-of-coordinates-in-the-cielab-color-space
const LAB_A_MIN = -87;
const LAB_A_RANGE = 185;
const LAB_B_MIN = -108;
const LAB_B_RANGE = 203;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const plotCanvas = document.getElementById('plot');
const plotCtx = plotCanvas.getContext('2d');

export const convertRangeA = coord => (
  (((coord - LAB_A_MIN) * PLOT_CANVAS_RANGE) / LAB_A_RANGE)
);

export const convertRangeB = coord => (
  (((coord - LAB_B_MIN) * PLOT_CANVAS_RANGE) / LAB_B_RANGE)
);

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

const formatTooltipRgb = rgb => (
  `
    <span style="color: red; font-weight: 700">R</span> ${rgb[0]}</span>
    <span style="color: green; font-weight: 700">G</span> ${rgb[1]}</span>
    <span style="color: blue; font-weight: 700">B</span> ${rgb[2]}</span>
  `
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

  const centroidRgb = centroid.toString().slice(4, -1).split(',');
  colorTooltip
    .style('visibility', 'visible')
    .style('left', d3.select(d3.event.target).attr('cy') + 'px')
    .style(
      'bottom',
      `${parseInt(d3.select(d3.event.target).attr('cx')) - 26}px`
    )
    .style('box-shadow', '0 1px 4px 0 rgba(12, 12, 13, 0.1)')
    .html(
      `
        <h1>${formatTooltipRgb(centroidRgb)}</h1>
        <h2 style="background-color: ${centroid.toString()}; font-weight: 700">
          #${convertRgbToHex(centroidRgb)}
        </h2>
        <h3>${centroid.clusterLength || 'TBD'} PIXELS</h3>
      `
    );
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
  d3.select('#iteration-number').text('0');
  plotD3
    .selectAll('circle')
    .transition()
    .duration(500)
    .attr('r', 0)
    .remove();
};

export const drawInitialCentroids = (centroids) => {
  // x-axis is a*, y-axis is b*
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
    .ease(d3Ease.easeBounce)
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
