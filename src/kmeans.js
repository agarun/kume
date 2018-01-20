import * as d3Color from 'd3-color';
import * as d3Timer from 'd3-timer';

import {
  updateIterationNumber,
  redrawCentroids,
  // redrawClusters, // TODO: voronoi
  clearD3PlotCentroids,
} from './util';

import { drawQuantizedImage } from './quantize';

// First, randomly choose k initial centroids using Forgy initialization
// Calculate the color distance between each color & each cluster's centroid
// Assign each CIELAB color to the cluster with the minimized color difference
// Update & recompute each cluster's centroid
// If the centroids are equivalent, k-menas converges & iterations are complete
// If not, repeatedly alternate between assigning colors
// & updating centroids until convergence

class KMeans {
  // color distance is determined by calculating Euclidean distance
  // in 3d. For CIELAB, find the color difference using
  // the Delta E*ab CIE76 distance metric
  static getColorDifference(labColor1, labColor2) {
    const square = number => Math.pow(number, 2);

    return Math.sqrt(
      square(labColor2.l - labColor1.l) +
      square(labColor2.a - labColor1.a) +
      square(labColor2.b - labColor1.b)
    );
  }

  constructor(labColors, k) {
    this.labColors = labColors;
    this.k = k;
    this.clusters = null;
    this.centroids = this.initialCentroids();
    this.convergence = false;
    this.runningKMeans = null;
    this.kMeansRun = this.kMeansRun.bind(this);
  }

  // Initialization with the Forgy method. k observations are
  // randomly chosen from the data set and used as initial means
  // TODO: handle duplicates
  initialCentroids() {
    let initialCentroids = [];
    while (initialCentroids.length !== this.k) {
      const randomColor = (
        this.labColors[Math.floor(Math.random() * this.labColors.length)]
      );
      initialCentroids.push(randomColor);
    }
    return initialCentroids;
  }

  // alternate between assigning data points to clusters &
  // updating cluster centroids until convergence.
  // convergence occurs when centroid assignments are equivalent
  kMeansRun() {
    updateIterationNumber();

    this.clusters = this.calculateClusters();
    this.centroids = this.recomputeCentroids();

    if (this.convergence) {
      this.runningKMeans.stop();
      drawQuantizedImage(this.clusters, this.centroids);
    }
  }

  kMeansAlgorithm() {
    if (this.cancelKMeans) return clearD3PlotCentroids();

    this.runningKMeans = d3Timer.interval((elapsed) => {
      this.kMeansRun();

      if (elapsed > 22 * 750) {
        this.runningKMeans.stop();
        this.runningKMeans = d3Timer.interval(this.kMeansRun, 200);
      }
    }, 750);
  }

  // Assign each color to the cluster centroid it's closest to based
  // on the Delta E*ab CIE76 distance metric.
  // The metric will compare each data point to the centroids according to
  // the lowest Euclidean distance (color difference in CIELAB space)
  calculateClusters() {
    let newClusters = Array.apply(null, Array(this.k)).map(() => []);

    this.labColors.forEach((labColor) => {
      // for each data point, determine the least squared distance
      // between the color and the cluster centroids and assign
      // the point to the appropriate cluster
      let minimumDistance = Infinity;
      let minimumDistanceCentroidIdx = -1;
      this.centroids.forEach((centroid, i) => {
        const distanceToCentroid = (
          KMeans.getColorDifference(centroid, labColor)
        );
        if (distanceToCentroid < minimumDistance) {
          minimumDistance = distanceToCentroid;
          minimumDistanceCentroidIdx = i;
        }
      });

      newClusters[minimumDistanceCentroidIdx].push(labColor);
    });

    return newClusters;
  }

  // A cluster's centroid is the mean position of all the pixels in the cluster
  computeCentroid(cluster) {
    let newCentroid = Array.apply(null, Array(4)).map(() => 0);

    cluster.forEach((labColor, i) => {
      newCentroid[0] += labColor.l;
      newCentroid[1] += labColor.a;
      newCentroid[2] += labColor.b;
      newCentroid[3] += labColor.opacity;
    });

    newCentroid = newCentroid.map(colorValue => colorValue / cluster.length);
    return d3Color.lab(...newCentroid);
  }

  isEqual(array1, array2) {
    return JSON.stringify(array1) === JSON.stringify(array2);
  }

  // Update the new centroid positions of each cluster
  recomputeCentroids() {
    let newCentroids = [];
    let isConverged = true;
    this.clusters.forEach((cluster, i) => {
      let newCentroid = cluster.length
        ? this.computeCentroid(cluster)
        : this.centroids[i];

      newCentroid.clusterLength = cluster.length;
      if (!this.isEqual(this.centroids[i], newCentroid)) {
        isConverged = false;
      }

      newCentroids.push(newCentroid);
    });

    this.convergence = isConverged;
    redrawCentroids(this.centroids);
    return newCentroids;
  }
}

export default KMeans;
