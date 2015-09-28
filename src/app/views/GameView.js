define([
  'backbone',
  'hbs!templates/game'
], function(
  Backbone,
  template
){
  return Backbone.View.extend({

    className: 'game-wrapper',

    template: template,

    initialize: function(){
      this.render();
    },

    render: function(){
      this.$el.html(this.template());
      return this;
    }

  });
});
