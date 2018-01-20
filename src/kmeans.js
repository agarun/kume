import * as d3 from 'd3';
import {
  updateIterationNumber,
  redrawCentroids,
  // redrawClusters,
  drawQuantizedImage,
} from './util';

// First, randomly choose k initial centroids using Forgy initialization
// Calculate the color distance between each color & each cluster's centroid
// Assign each CIELAB color to the cluster with the minimized color difference
// Update & recompute each cluster's centroid
// If the centroids are equivalent, k-menas converges & iterations are complete.
// If not, repeatedly alternate between assigning colors & updating centroids
// until convergence.

// TODO: `Cluster` class, `Centroid` class
// TODO: for visualization, plot a* on x-axis, b* on y-axis
// TODO: what is d3-interpolate used for?

class KMeans {
  // color difference is determined by calculating Euclidean distance in
  // three dimensions. For CIELAB, we find the color difference using
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
  }

  // Initialization with the Forgy method. k observations are
  // randomly chosen from the data set and used as initial means.
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
  // updating & updating cluster centroids until convergence:
  // when centroid assignments are equivalent
  kMeansAlgorithm() {
    this.runningKMeans = d3.interval(() => {
      updateIterationNumber();
      this.clusters = this.calculateClusters();
      // redrawClusters(this.clusters);
      this.centroids = this.recomputeCentroids();
      if (this.convergence) {
        this.runningKMeans.stop();
        debugger
        drawQuantizedImage(this.clusters, this.centroids);
      }
    }, 800);
  }

  // Assign each color to the cluster centroid it's closest to based
  // on the Delta E*ab CIE76 distance metric.
  // The metric will compare each data point to the centroids according to
  // the lowest Euclidean distance (color difference in CIELAB space)
  // TODO: The Voronoi diagram will come from here -> "the means generate a Voronoi diagram"
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

  computeCentroid(cluster) {
    let newCentroid = Array.apply(null, Array(4)).map(() => 0);

    // debugger
    cluster.forEach((labColor) => {
      newCentroid[0] += labColor.l;
      newCentroid[1] += labColor.a;
      newCentroid[2] += labColor.b;
      newCentroid[3] += labColor.opacity;
    });

    newCentroid = newCentroid.map(colorValue => colorValue / cluster.length);
    if (isNaN(newCentroid[3])) {
      debugger
      console.log(newCentroid[3]);
    }
    return d3.lab(...newCentroid);
  }

  isEqual(array1, array2) {
    return JSON.stringify(array1) === JSON.stringify(array2);
  }

  // Update the new centroid positions of each cluster
  recomputeCentroids() {
    let newCentroids = [];
    let isConverged = true;
    // average for attribute for cluster === new centroid
    // calculate mean for attribute for cluster
    this.clusters.forEach((cluster, i) => {
      let newCentroid = cluster.length
        ? this.computeCentroid(cluster)
        : this.centroids[i];

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

// color quantization -> replace final clusters with their centroid
// & append to new image data object, then write to canvas !
