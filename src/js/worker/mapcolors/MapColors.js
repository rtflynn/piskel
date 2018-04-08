(function () {
  var ns = $.namespace('pskl.worker.mapcolors');

  ns.MapColors = function (pixels, colormap, onSuccess, onStep, onError) {
    this.colormap = colormap;
    this.pixels = pixels;

    this.onStep = onStep;
    this.onSuccess = onSuccess;
    this.onError = onError;

    this.worker = pskl.utils.WorkerUtils.createWorker(ns.MapColorsWorker, 'image-colors-processor');
    this.worker.onmessage = this.onWorkerMessage.bind(this);
  };

  ns.MapColors.prototype.process = function () {
    this.worker.postMessage({
      colormap : this.colormap,
      pixels : this.pixels
    });
  };

  ns.MapColors.prototype.onWorkerMessage = function (event) {
    if (event.data.type === 'STEP') {
      this.onStep(event);
    } else if (event.data.type === 'SUCCESS') {
      this.onSuccess(event);
      this.worker.terminate();
    } else if (event.data.type === 'ERROR') {
      this.onError(event);
      this.worker.terminate();
    }
  };
})();
