define([
  'backbone',
  'hbs!templates/index'
], function(
  Backbone,
  template
){
  return Backbone.View.extend({

    className: 'main-wrapper',

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
