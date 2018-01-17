# kume

[kume]() is a visualization of image segmentation and color quantization using [k-means clustering](https://en.wikipedia.org/wiki/K-means_clustering).

## Background

The [k-means clustering](https://en.wikipedia.org/wiki/K-means_clustering) [unsupervised algorithm](https://en.wikipedia.org/wiki/Unsupervised_learning) is used to partition a data set into *k* groups. Each data point is assigned to a particular cluster based on mean positions.

The algorithm begins by randomly initializing *k* data points as the initial means as suggested by the standard Forgy method.

After the initial placement, each data point is assigned to a cluster. Each observation is associated with the nearest mean as calculated by euclidean distance, ultimately yielding *k* clusters for all the data points.

The [centroids](https://en.wikipedia.org/wiki/Centroids) of each cluster are recomputed. The algorithm repeatedly finds the new centroid by reassigning and repartitioning the data set until the assignments no longer change.

[Image segmentation](https://en.wikipedia.org/wiki/Image_segmentation) is the process of partioning an image into sets of pixel segments, and is often applied in medical imaging, surveillance, and recognition tasks like face recognition. K-means clustering is an iterative algorithm that can be applied to accomplish image segmentation by color quantization.

[Color quantization](https://en.wikipedia.org/wiki/Color_quantization) is the method of reducing the number of distinct colors used in an image to only the dominant colors. Each pixel in the image is assigned and reassigned to *k* clusters until the distance between the pixel and its cluster's centroid cannot be further minimized.

## Outline

Phase 1. Users can choose an image to analyze and set the value of *k*.
  * Read image data
  * Convert RGB data set to Lab color space
  * Classify the colors in L*a*b space using k-means clustering for *k* clusters and display *i* iterations
    * Pick *k* cluster centroids randomly (Forgy method)
    * Assign each pixel data point in the image to the cluster that minimizes the distance between the cluster's center and the pixel location
    * Recompute cluster centroids and sort pixels by means, continuing until convergence (no more new assignments)

Phase 2. K-means clustering picks the dominant colors in the Lab color space and displays them in a plot.
  * Label every pixel in the image following k-means
  * Draw each pixel at their positions based on means and animate the iterations if applicable
  * Bonus: Draw interpolation of pixels to their spatial clusters. [Inspiration](https://github.com/anvaka/gauss-distribution)
  * Bonus: Draw [Voronoi cells](https://en.wikipedia.org/wiki/Voronoi_diagram) for the clusters over the original image

Phase 3. Draw the color quantization of the image at different values of *k*. [Inspiration](https://www.youtube.com/watch?v=yR7k19YBqiw&t=5m50s)
  * Create separate segmented images from color data sets at each *k*
  * Bonus: Lab color space lightness (**L**) vs. pixels plot or 3D Lab color space visualization

## Wireframes

<p align="center">
<img width=75% src="https://i.imgur.com/DLYfrfL.jpg" />
</p>

## Technologies

[D3.js 4.12+](https://github.com/d3/d3) for plotting & color space conversion.
