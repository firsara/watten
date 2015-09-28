define([
  'backbone',
  'hbs!templates/card',
  'utils/css3'
], function(
  Backbone,
  template,
  css3
){
  return Backbone.View.extend({

    className: 'card',

    template: template,

    initialize: function(model){
      this.model = model;
      this.render();
    },

    render: function(){
      this.$el.html(this.template(this.model));
      this.el.view = this;
      return this;
    },

    show: function(){
      this.$el.addClass('flip');
    },

    hide: function(){
      this.$el.removeClass('flip');
    },

    toggle: function(){
      this.$el.toggleClass('flip');
    },

    center: function(playerIndex){
      var _this = this;

      var top = _this.$el.offset().top;
      var left = _this.$el.offset().left;

      _this.$el.addClass('no-transition');
      _this.$el.css('top', top);
      _this.$el.css('left', left);
      _this.$el.remove().appendTo($('.game-wrapper'));

      setTimeout(function(){
        _this.$el.removeClass('no-transition');
        _this.$el.addClass('center');
        _this.show();

        var cardOffset = 100;
        cardOffset = cardOffset - 20 + 40 * Math.random();

        if (playerIndex === 0) {
          _this.el.style[css3.transformStylePrefix] = 'rotate(' + (0 - 10 + Math.random() * 20) + 'deg)';
          _this.$el.css('left', window.innerWidth / 2 - _this.$el.width() / 2);
          _this.$el.css('top', window.innerHeight / 2 - _this.$el.height() / 2 + cardOffset);
        } else if (playerIndex === 1) {
          _this.el.style[css3.transformStylePrefix] = 'rotate(' + (90 - 10 + Math.random() * 20) + 'deg)';
          _this.$el.css('left', window.innerWidth / 2 - _this.$el.width() / 2 - cardOffset);
          _this.$el.css('top', window.innerHeight / 2 - _this.$el.height() / 2);
        } else if (playerIndex === 2) {
          _this.el.style[css3.transformStylePrefix] = 'rotate(' + (180 - 10 + Math.random() * 20) + 'deg)';
          _this.$el.css('left', window.innerWidth / 2 - _this.$el.width() / 2);
          _this.$el.css('top', window.innerHeight / 2 - _this.$el.height() / 2 - cardOffset);
        } else if (playerIndex === 3) {
          _this.el.style[css3.transformStylePrefix] = 'rotate(' + (-90 - 10 + Math.random() * 20) + 'deg)';
          _this.$el.css('left', window.innerWidth / 2 - _this.$el.width() / 2 + cardOffset);
          _this.$el.css('top', window.innerHeight / 2 - _this.$el.height() / 2);
        }
      }, 100);
    },

    moveTo: function(playerIndex){
      this.hide();

      var cardOffset = -50;
      cardOffset = cardOffset + 20 - 40 * Math.random();

      if (playerIndex === 0) {
        this.el.style[css3.transformStylePrefix] = 'rotate(' + (0 - 10 + Math.random() * 20) + 'deg)';
        this.$el.css('left', window.innerWidth / 2 - this.$el.width() / 2);
        this.$el.css('top', window.innerHeight - this.$el.height() / 2 + cardOffset);
      } else if (playerIndex === 1) {
        this.el.style[css3.transformStylePrefix] = 'rotate(' + (90 - 10 + Math.random() * 20) + 'deg)';
        this.$el.css('left', 0 - this.$el.width() / 2 - cardOffset);
        this.$el.css('top', window.innerHeight / 2 - this.$el.height() / 2);
      } else if (playerIndex === 2) {
        this.el.style[css3.transformStylePrefix] = 'rotate(' + (180 - 10 + Math.random() * 20) + 'deg)';
        this.$el.css('left', window.innerWidth / 2 - this.$el.width() / 2);
        this.$el.css('top', 0 - this.$el.height() / 2 - cardOffset);
      } else if (playerIndex === 3) {
        this.el.style[css3.transformStylePrefix] = 'rotate(' + (-90 - 10 + Math.random() * 20) + 'deg)';
        this.$el.css('left', window.innerWidth - this.$el.width() / 2 + cardOffset);
        this.$el.css('top', window.innerHeight / 2 - this.$el.height() / 2);
      }
    }

  });
});
