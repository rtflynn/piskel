(function () {
  var ns = $.namespace('pskl.worker.mapcolors');

  ns.MapColorsWorker = function () {
    var currentStep;
    var currentProgress;
    var currentTotal;

    var mapPixels = function (pixels, map) {
      return pixels.map(function (pixel) {
        if (map[pixel]) {
          return map[pixel];
        }
        return pixel;
      });
    };

    this.onmessage = function(event) {
      try {
        var data = event.data;

        var pixels = mapPixels(data.pixels, data.colormap);

        this.postMessage({
          type : 'SUCCESS',
          pixels : pixels
        });
      } catch (e) {
        this.postMessage({
          type : 'ERROR',
          message : e.message
        });
      }
    };
  };
})();
