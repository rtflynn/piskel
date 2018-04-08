(function () {
  var ns = $.namespace('pskl.utils');

  ns.ColorUtils = {
    getUnusedColor : function (usedColors) {
      usedColors = usedColors || [];
      // create check map
      var colorMap = {};
      usedColors.forEach(function (color) {
        colorMap[color.toUpperCase()] = true;
      });

      // start with white
      var color = {
        r : 255,
        g : 255,
        b : 0
      };
      var match = null;
      while (true) {
        var hex = window.tinycolor(color).toHexString().toUpperCase();

        if (!colorMap[hex]) {
          match = hex;
          break;
        } else {
          // pick a non null component to decrease its value
          var component = (color.r && 'r') || (color.g && 'g') || (color.b && 'b');
          if (component) {
            color[component] = color[component] - 1;
          } else {
            // no component available, no match found
            break;
          }
        }
      }

      return match;
    },

    toBlackOrWhite: function (pixels) {
      var constantTransparentColorInt = pskl.utils.colorToInt(Constants.TRANSPARENT_COLOR);
      var black = pskl.utils.colorToInt('rgba(0,0,0,1)');
      var white = pskl.utils.colorToInt('rgba(255,255,255,1)');
      var copy = [];
      for (var i = 0, length = pixels.length; i < length; i++) {
        var pixel = pixels[i];
        if (pixel !== constantTransparentColorInt) {
          var color = window.tinycolor(pskl.utils.intToColor(pixel)).toRgb();
          if ((color.r + color.g + color.b) < (3 * 128)) {
            copy.push(black);
          } else {
            copy.push(white);
          }
        } else {
          copy.push(pixel);
        }
      }
      return copy;
    },

    getNearestColorIndex: function(color, colors) {
      var nearestColorIndex = -1;
      var distance = Infinity;
      for (var i = 0 ; i < colors.length ; i++) {
        var d = pskl.utils.ColorUtils.getDistance(color, colors[i]);
        if (d < distance) {
          distance = d;
          nearestColorIndex = i;
        }
      }
      return nearestColorIndex;
    },

    getDistance: function(c1, c2) {
      // From https://en.wikipedia.org/wiki/Color_difference
      var dR = Math.pow(c1.r - c2.r, 2);
      var dG = Math.pow(c1.g - c2.g, 2);
      var dB = Math.pow(c1.b - c2.b, 2);
      var rR = (c1.r + c2.r) / 2;
      var intCalc = rR * (dR - dB) / 256;
      var calc = 2 * dR + 4 * dG + 3 * dB + intCalc;
      return Math.sqrt(calc);
    }
  };
})();
