define([
  'backbone',
  'views/MainView',
  'controllers/GameController'
], function(
  Backbone,
  MainView,
  GameController
){
  function MainController(){
    this.view = new MainView();

    this.game = new GameController();
    this.view.$el.append(this.game.view.$el);
  }

  var p = MainController.prototype;

  return MainController;
});
