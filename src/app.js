// https://github.com/nwjs/nw.js/wiki/Faq-name-conflict
// work around name conflict between nodejs and requirejs in nwjs
require.nodeRequire = window.requireNode;
window.nodeRequire = window.requireNode;

requirejs.config({
  baseUrl: 'app',
  urlArgs: 'bust=' +  (new Date()).getTime(),
  paths: {
    app: '../app',
    vendor: '../vendor',
    plugins: '../jquery-plugins',
    'handlebars-compiler': '../handlebars-compiler'
  }
});

require(['../require.config'], function(){
  require(['jquery'], function($){
    require(['bootstrap', 'underscore', 'backbone', 'gsap'], function(){
      require(['main']);
    })
  });
});
