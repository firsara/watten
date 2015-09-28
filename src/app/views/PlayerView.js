define([
  'backbone',
  'hbs!templates/player'
], function(
  Backbone,
  template
){
  return Backbone.View.extend({

    className: 'player',

    template: template,

    events: {
      'click .card': 'chooseCard',
      'click .button-ok': 'confirmed'
    },

    addCard: function(card){
      this.$el.find('.cards').append(card.view.$el);
    },

    initialize: function(model){
      this.$el.addClass('player-' + model.index);
      this.$el.attr('data-id', model.index);
      this.model = model;
      this.render();
    },

    render: function(){
      this.$el.html(this.template(this.model));
      return this;
    },

    confirm: function(callback){
      var _this = this;

      this.$el.find('.button-ok').css('display', 'block');

      this.model.confirmation = function(){
        if (callback) {
          callback();
        }

        _this.model.confirmation = null;
        _this.$el.find('.button-ok').css('display', 'none');
      };
    },

    confirmed: function(){
      if (this.model.confirmation) {
        this.model.confirmation();
      }
    },

    decide: function(callback){
      var _this = this;

      this.model.decision = function(card){
        if (callback) {
          var index = null;

          for (var i = 0; i < _this.model.cards.length; i++) {
            if (_this.model.cards[i] === card) {
              index = i;
              break;
            }
          }

          callback(card, index);
        }

        _this.model.decision = null;
      };
    },

    chooseCard: function(event){
      if (this.model.decision) {
        var card = event.currentTarget.view;

        if (this.model.isAllowedToPlay(card.model)) {
          this.model.decision(card.model);
        } else {
          this.$el.find('.notice').html('Trumpf zugeben').css('display', 'block');
        }
      }
    }

  });
});
