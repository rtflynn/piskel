(function () {
  var ns = $.namespace('pskl.tools.transform');

  ns.TransformUtils = {
    VERTICAL : 'VERTICAL',
    HORIZONTAL : 'HORIZONTAL',
    flip : function (frame, axis) {
      var clone = frame.clone();
      var rightFlipBoundary;
      var topFlipBoundary;
      var selection = pskl.app.selectionManager.currentSelection;
      var selectionIsRectangle = false;
      var minx = +Infinity;
      var miny = +Infinity;
      var maxx = 0;
      var maxy = 0;
      if (selection) {
        var px = selection.pixels;
        if (px) {
          for (var i = 0; i < px.length; ++i) {
            var pixel = px[i];
            minx = Math.min(minx, pixel.col);
            miny = Math.min(miny, pixel.row);
            maxx = Math.max(maxx, pixel.col);
            maxy = Math.max(maxy, pixel.row);
          }
        }
        var boundingRectArea = (maxx - minx + 1) * (maxy - miny + 1);
        selectionIsRectangle = (boundingRectArea == px.length) && (px.length != 0);
        topFlipBoundary = maxy;
        rightFlipBoundary = maxx;
      }
      if (selectionIsRectangle) {
        topFlipBoundary = miny + maxy + 1;
        rightFlipBoundary = minx + maxx + 1;
      } else {
        topFlipBoundary = frame.getHeight();
        rightFlipBoundary = frame.getWidth();
      }

      clone.forEachPixel(function (color, x, y) {
        if (selectionIsRectangle) {
          if (((x < minx) || (x > maxx)) || ((y < miny) || (y > maxy))) {
            return;
          }
        }
        if (axis === ns.TransformUtils.VERTICAL) {
          x = rightFlipBoundary - x - 1;
        } else if (axis === ns.TransformUtils.HORIZONTAL) {
          y = topFlipBoundary - y - 1;
        }
        frame.setPixel(x, y, color);
      });

      return frame;
    },

    CLOCKWISE : 'clockwise',
    COUNTERCLOCKWISE : 'counterclockwise',
    rotate : function (frame, direction) {
      var clone = frame.clone();
      var w = frame.getWidth();
      var h = frame.getHeight();

      var max =  Math.max(w, h);
      var xDelta = Math.ceil((max - w) / 2);
      var yDelta = Math.ceil((max - h) / 2);

      frame.forEachPixel(function (color, x, y) {
        var _x = x;
        var _y = y;

        // Convert to square coords
        x = x + xDelta;
        y = y + yDelta;

        // Perform the rotation
        var tmpX = x;
        var tmpY = y;
        if (direction === ns.TransformUtils.CLOCKWISE) {
          x = tmpY;
          y = max - 1 - tmpX;
        } else if (direction === ns.TransformUtils.COUNTERCLOCKWISE) {
          y = tmpX;
          x = max - 1 - tmpY;
        }

        // Convert the coordinates back to the rectangular grid
        x = x - xDelta;
        y = y - yDelta;
        if (clone.containsPixel(x, y)) {
          frame.setPixel(_x, _y, clone.getPixel(x, y));
        } else {
          frame.setPixel(_x, _y, Constants.TRANSPARENT_COLOR);
        }
      });

      return frame;
    },

    getBoundaries : function(frames) {
      var minx = +Infinity;
      var miny = +Infinity;
      var maxx = 0;
      var maxy = 0;

      var transparentColorInt = pskl.utils.colorToInt(Constants.TRANSPARENT_COLOR);

      frames.forEach(function (frame) {
        frame.forEachPixel(function (color, x, y) {
          if (color !== transparentColorInt) {
            minx = Math.min(minx, x);
            maxx = Math.max(maxx, x);
            miny = Math.min(miny, y);
            maxy = Math.max(maxy, y);
          }
        });
      });

      return {
        minx: minx,
        maxx: maxx,
        miny: miny,
        maxy: maxy,
      };
    },

    moveFramePixels : function (frame, dx, dy) {
      var clone = frame.clone();
      frame.forEachPixel(function(color, x, y) {
        var _x = x;
        var _y = y;

        x -= dx;
        y -= dy;

        if (clone.containsPixel(x, y)) {
          frame.setPixel(_x, _y, clone.getPixel(x, y));
        } else {
          frame.setPixel(_x, _y, Constants.TRANSPARENT_COLOR);
        }
      });
    },

    center : function(frame) {
      // Figure out the boundary
      var boundaries = ns.TransformUtils.getBoundaries([frame]);

      // Calculate how much to move the pixels
      var bw = (boundaries.maxx - boundaries.minx + 1) / 2;
      var bh = (boundaries.maxy - boundaries.miny + 1) / 2;
      var fw = frame.width / 2;
      var fh = frame.height / 2;

      var dx = Math.floor(fw - bw - boundaries.minx);
      var dy = Math.floor(fh - bh - boundaries.miny);

      // Actually move the pixels

      ns.TransformUtils.moveFramePixels(frame, dx, dy);
      return frame;
    }
  };
})();
