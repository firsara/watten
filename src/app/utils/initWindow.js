define(['config'], function(config){
  return function(){
    if (!! nodeRequire) {
      var gui = nodeRequire('nw.gui');
      var win = gui.Window.get();
      var mb = new gui.Menu({type: 'menubar'});
      mb.createMacBuiltin(config.name);
      win.menu = mb;
    }
  };
});
