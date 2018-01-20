# kume

[kume](https://agarun.com/kume) is a visualization of image segmentation and color quantization using [k-means clustering](https://en.wikipedia.org/wiki/K-means_clustering)

## Background

The [k-means clustering](https://en.wikipedia.org/wiki/K-means_clustering) [unsupervised algorithm](https://en.wikipedia.org/wiki/Unsupervised_learning) is used to partition a data set into *k* groups. Each data point is assigned to a particular cluster based on mean positions.

The algorithm randomly initializes *k* data points as the initial means with the standard Forgy method.

First, each pixel is assigned to the cluster with the smallest color distance to its centroid. Then, the [centroids](https://en.wikipedia.org/wiki/Centroids) of each cluster are recomputed. Since the centroid is the mean data point of the cluster's pixels, it is the cluster's average color, and one of the image's prominent colors. The algorithm repeatedly finds better centroids by reassigning and repartitioning the data set until the assignments no longer change.

[Image segmentation](https://en.wikipedia.org/wiki/Image_segmentation) is the process of partitioning an image into sets of pixel segments, and is often applied in medical imaging, surveillance, and recognition tasks like face recognition. K-means clustering is an iterative algorithm that can be applied to accomplish image segmentation by color quantization.

[Color quantization](https://en.wikipedia.org/wiki/Color_quantization) is the method of reducing the number of distinct colors used in an image to only the dominant colors. Each pixel in the image is assigned and reassigned to *k* clusters until the distance between the pixel and its cluster's centroid cannot be further minimized.

The [CIE L\*a\*b\*](https://en.wikipedia.org/wiki/Lab_color_space) color space describes all visible colors to humans. The *L*\* component describes lightness, the *a*\* channel for red-green, and *b*\* for blue-yellow. Changes in CIELAB channels are intended to mimic the responses of the human eye. CIELAB is perceptually uniform because uniform changes in L\*a\*b\* components correspond to uniform changes in color as perceived by humans & matched by Euclidean distance.

## Usage

Choose a value of *k* and a sample image. Image pixels are plotted to an HTML5 Canvas. The visual 2D representation shows the colors in the sRGB gamut (x-axis *a*\*, y-axis *b*\*) and has some pixel overlap since it omits a separate component for *L*\*.

*k* colors are initialized as centroids. Each centroid is represented by its mean color for the cluster with an SVG & tooltip. Clusters and centroids are repeatedly assigned and updated until convergence. D3 handles animating each iteration.

When there are no more new centroid assignments, the cluster data is used to draw a quantized version of the sample image using only *k* prominent colors.

## Technologies

[D3v4](https://github.com/d3/d3) for plotting & color space conversion

## Planned Features

* Handling uploads & scaling
* Visualizing & interacting with the [Voronoi cells]() created by the algorithm
* Interpolating pixels from the image - [Inspiration](https://github.com/anvaka/gauss-distribution)
* Chromaticity diagram with a fixed illuminant for a truer representation
* 3D Plotting color space components - [Inspiration](https://mollermara.com/blog/kmeans/)
* Better-performing initialization methods
  * e.g. [k-means++](https://en.wikipedia.org/wiki/K-means%2B%2B)

## References
* K-means [1](http://www.marmakoide.org/download/teaching/dm/dm-kmeans.pdf), [2](https://www.slideshare.net/djempol/kmeans-initialization-15041920), [3](https://jpgdatascience.wordpress.com/2016/05/02/image-compression-k-means-clustering/), [4](http://www.onmyphd.com/?p=k-means.clustering), [5](https://www.naftaliharris.com/blog/visualizing-k-means-clustering/)
* Color spaces [1](https://engineering.purdue.edu/~bouman/ece637/notes/pdf/ColorSpaces.pdf), [2](http://www.easyrgb.com/en/math.php), [3](http://hyperphysics.phy-astr.gsu.edu/hbase/vision/cie.html)
* Image segmentation [1](https://www.youtube.com/watch?v=yR7k19YBqiw)
* [Delta E*ab CIE76 color distance](https://en.wikipedia.org/wiki/Color_difference#CIELAB_Delta_E)
* Canvas pixel manipulation [1](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas)
