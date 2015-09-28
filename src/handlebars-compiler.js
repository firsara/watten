// NOTE: workaround for hbs template compiler
// uses "handlebars-compiler" which is actually Handlebars itself
define('handlebars-compiler', ['handlebars'], function(Handlebars){
  return Handlebars;
});