define([
  'config',
  'utils/initWindow',
  'controllers/MainController'
],
function(
  config,
  initWindow,
  MainController
){
  initWindow();

  MainController.instance = new MainController();
  MainController.instance.game.start();
  $('body').append(MainController.instance.view.$el);
});
