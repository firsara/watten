define(function(){
  var css3 = {};

  css3.transformStylePrefix = (function(){
    var prefix = 'transform';

    if (! (prefix in document.body.style)) {
      var v = ['ms', 'Khtml', 'O', 'moz', 'Moz', 'webkit', 'Webkit'];

      while (v.length) {
        var prop = v.pop() + 'Transform';
        if (prop in document.body.style) {
          prefix = prop;
        }
      }
    }

    return prefix;
  })();

  css3.filterStylePrefix = (function(){
    var prefix = 'unknownFilter';

    if (! (prefix in document.body.style)) {
      var v = ['ms', 'Khtml', 'O', 'moz', 'Moz', 'webkit', 'Webkit'];

      while (v.length) {
        var prop = v.pop() + 'Filter';
        if (prop in document.body.style) {
          prefix = prop;
        }
      }
    }

    if (prefix === 'unknownFilter') {
      prefix = 'filter';
    }

    return prefix;
  })();

  css3.getRotation = function(domElement){
    // TODO: make simpler
    //var matrix = domElement.style[css3.transformStylePrefix];

    var obj = $(domElement);
    var matrix = obj.css('-webkit-transform') ||
                 obj.css('-moz-transform')    ||
                 obj.css('-ms-transform')     ||
                 obj.css('-o-transform')      ||
                 obj.css('transform');

    var angle = 0;

    if (matrix !== 'none') {
      var values = matrix.split('(')[1].split(')')[0].split(',');
      var a = values[0];
      var b = values[1];
      angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
    } else {
      angle = 0;
    }

    return (angle < 0) ? angle + 360 : angle;
  };

  return css3;
});
