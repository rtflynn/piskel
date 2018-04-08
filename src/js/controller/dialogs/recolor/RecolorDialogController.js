(function () {
  var ns = $.namespace('pskl.controller.dialogs.recolor');

  ns.RecolorDialogController = function (piskelController) {};

  pskl.utils.inherit(ns.RecolorDialogController, pskl.controller.dialogs.AbstractDialogController);

  ns.RecolorDialogController.prototype.init = function () {
    this.superclass.init.call(this);

    var bwButton = document.querySelector('.to-black-white');
    bwButton.addEventListener('click', this.onBwButtonClick_.bind(this));
  };

  function simpleWorkerPromise(_Worker, a1, a2) {
    var deferred = Q.defer();
    var onSuccess = function (event) {
      deferred.resolve(event);
    };
    var onStep = function () {};
    var onError = function (e) {
      deferred.reject(e);
    };
    var worker = new _Worker(a1, a2, onSuccess, onStep, onError);
    worker.process();

    return deferred.promise;
  }

  function batchAll(frames, job) {
    var batches = [];
    frames = frames.slice(0);
    while (frames.length) {
      batches.push(frames.splice(0, 10));
    }
    var result = Q([]);
    batches.forEach(function (batch) {
      result = result.then(function (results) {
        return Q.all(batch.map(job)).then(function (partials) {
          return results.concat(partials);
        });
      });
    });
    return result;
  };

  ns.RecolorDialogController.prototype.getColorsFromAllFrames = function (frames) {
    return batchAll(frames, function (frame) {
      var worker = pskl.worker.framecolors.FrameColors;
      return simpleWorkerPromise(worker, frame, 1000000).then(function (event) {
        return event.data.colors;
      });
    }).then(function (results) {
      var colors = {};
      results.forEach(function (result) {
        Object.keys(result).forEach(function (color) {
          colors[color] = true;
        });
      });
      // Remove transparent color from used colors
      delete colors[pskl.utils.colorToInt(Constants.TRANSPARENT_COLOR)];
      return colors;
    });
  };

  ns.RecolorDialogController.prototype.mapColorsToPalette = function (colors, palette) {
    var constantTransparentColorInt = pskl.utils.colorToInt(Constants.TRANSPARENT_COLOR);

    var paletteColors = palette.colors.map(function (c) {
      return pskl.utils.colorToInt(c);
    });

    var paletteColorsRgb = paletteColors.map(function (c) {
      return window.tinycolor(pskl.utils.intToColor(c)).toRgb();
    });

    var colorMap = {};
    for (var color in colors) {
      var colorInt = color * 1;
      var rgb = window.tinycolor(pskl.utils.intToColor(colorInt)).toRgb();
      var nearestColorIndex = pskl.utils.ColorUtils.getNearestColorIndex(rgb, paletteColorsRgb);
      colorMap[color] = paletteColors[nearestColorIndex];
    }

    return colorMap;
  };

  ns.RecolorDialogController.prototype.onBwButtonClick_ = function () {
    this.mapToCurrentPalette_();
  };

  ns.RecolorDialogController.prototype.replay = function () {
    this.mapToCurrentPalette_();
  };

  ns.RecolorDialogController.prototype.mapToCurrentPalette_ = function () {
    var currentPiskel = pskl.app.piskelController.getPiskel();

    // Get all frames in a single array.
    var frames = currentPiskel.getLayers().reduce(function (p, l) {
      return p.concat(l.getFrames());
    }, []);

    this.getColorsFromAllFrames(frames).then(function (colors) {
      var paletteId = pskl.UserSettings.get(pskl.UserSettings.SELECTED_PALETTE);
      var palette = pskl.app.paletteService.getPaletteById(paletteId);
      var colorsMap = this.mapColorsToPalette(colors, palette);

      return batchAll(frames, function (frame) {
        var worker = pskl.worker.mapcolors.MapColors;
        return simpleWorkerPromise(worker, frame.getPixels(), colorsMap)
          .then(function (event) {
            frame.setPixels(event.data.pixels);
          });
      });
    }.bind(this)).then(function () {
      $.publish(Events.PISKEL_RESET);
      $.publish(Events.PISKEL_SAVE_STATE, {
        type : pskl.service.HistoryService.REPLAY,
        scope : this,
        replay : {}
      });
    }.bind(this));
  };
})();
