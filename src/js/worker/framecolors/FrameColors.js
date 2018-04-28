(function () {
  var ns = $.namespace('pskl.worker.framecolors');

  /**
   * Worker processor helper. FrameColors worker will extract all the colors
   * contained in the provided frame and will return it as an object in
   * event.data.colors.
   *
   * @param {Object} args
   *        - {Frame} frame
   *        - {Number} maxColors
   * @param {Object} callbacks: onSuccess, onStep, onError
   */
  ns.FrameColors = function (args, callbacks) {
    this.pixels = args.frame.pixels;
    this.maxColors = args.maxColors;

    this.onStep = callbacks.onStep || Constants.EMPTY_FUNCTION;
    this.onSuccess = callbacks.onSuccess || Constants.EMPTY_FUNCTION;
    this.onError = callbacks.onError || Constants.EMPTY_FUNCTION;

    this.worker = pskl.utils.WorkerUtils.createWorker(ns.FrameColorsWorker, 'frame-colors');
    this.worker.onmessage = this.onWorkerMessage.bind(this);
  };

  ns.FrameColors.prototype.process = function () {
    this.worker.postMessage([
      pskl.utils.colorToInt(Constants.TRANSPARENT_COLOR),
      this.maxColors, this.pixels
    ]);
  };

  ns.FrameColors.prototype.onWorkerMessage = function (event) {
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
