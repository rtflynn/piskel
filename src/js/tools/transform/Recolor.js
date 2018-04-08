(function () {
  var ns = $.namespace('pskl.tools.transform');

  ns.Recolor = function () {
    this.toolId = 'tool-recolor';
    this.helpText = 'Open the recolor window';
  };

  pskl.utils.inherit(ns.Recolor, pskl.tools.Tool);

  ns.Recolor.prototype.applyTransformation = function () {
    $.publish(Events.DIALOG_SHOW, {
      dialogId : 'recolor'
    });
  };

})();
