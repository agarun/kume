import * as d3 from 'd3-selection';
import * as d3Ease from 'd3-ease';
import * as d3Color from 'd3-color';
import transition from 'd3-transition';
import {
  colorTooltipMouseover,
  colorTooltipMouseout,
} from './tooltip';

export const PLOT_CANVAS_WIDTH = 600;
export const PLOT_CANVAS_HEIGHT = 600;
export const PLOT_CANVAS_RANGE = 600;

export const IMG_CANVAS_WIDTH = 300;
export const IMG_CANVAS_HEIGHT = 300;

// Reference for CIELAB bounds:
// https://stackoverflow.com/questions/19099063/what-are-the-ranges-of-coordinates-in-the-cielab-color-space
const LAB_A_MIN = -87;
const LAB_A_RANGE = 185;
const LAB_B_MIN = -108;
const LAB_B_RANGE = 203;

const plotD3 = d3.select('#d3-plot');
plotD3.attr('width', PLOT_CANVAS_WIDTH);
plotD3.attr('height', PLOT_CANVAS_HEIGHT);
plotD3.attr('transform', 'rotate(-90)');

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
  // x-axis is a*, y-axis is b*,
  // canvas was rotated -90deg to set origin to bottom-left
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

export const redrawCentroids = (centroids, kMeansTransitionDuration) => {
  plotD3
    .selectAll('circle')
    .data(centroids)
    .transition()
    .duration(kMeansTransitionDuration)
    .attr('cy', centroid => convertRangeA(centroid.a))
    .attr('cx', centroid => convertRangeB(centroid.b))
    .attr('fill', centroid => centroid);
};
