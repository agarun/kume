import * as d3 from 'd3-selection';
import transition from 'd3-transition';

const colorTooltip = (
  d3.select('.plot-container')
    .append('div')
    .attr('class', 'color-tooltip')
);

const convertRgbToHex = (rgb) => (
  rgb.reduce((hexadecimal, value) => (
    hexadecimal + parseInt(value).toString(16)
  ), '')
);

const formatTooltipRgb = rgb => (
  `
    <span style="color: red; font-weight: 700">R</span> ${rgb[0]}</span>
    <span style="color: green; font-weight: 700">G</span> ${rgb[1]}</span>
    <span style="color: blue; font-weight: 700">B</span> ${rgb[2]}</span>
  `
);

export const colorTooltipMouseover = (centroid) => {
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

export const colorTooltipMouseout = (centroid) => {
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
