define(['text!../config.json'], function(config){
  config = JSON.parse(config);
  config.debug = window.location.href.indexOf('debug') >= 0;
  config.AI = window.location.href.indexOf('ai') >= 0;
  config.open = window.location.href.indexOf('open') >= 0;
  return config;
});
