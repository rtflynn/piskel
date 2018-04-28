(function () {
  var ns = $.namespace('pskl.worker.mapcolors');

  /**
   * Worker processor helper. MapColors worker will transform an array
   * of pixels using the provided color map. The color map should have
   * an entry for each of the colors found in the pixels array.
   *
   * @param {Object} args
   *        - {Array} pixels: array of pixels
   *        - {Object} colorMap
   * @param {Object} callbacks: onSuccess, onStep, onError
   */
  ns.MapColors = function (args, callbacks) {
    this.colorMap = args.colorMap;
    this.pixels = args.pixels;

    this.onStep = callbacks.onStep;
    this.onSuccess = callbacks.onSuccess;
    this.onError = callbacks.onError;

    this.worker = pskl.utils.WorkerUtils.createWorker(ns.MapColorsWorker, 'image-colors-processor');
    this.worker.onmessage = this.onWorkerMessage.bind(this);
  };

  ns.MapColors.prototype.process = function () {
    this.worker.postMessage({
      colorMap : this.colorMap,
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
