define(['views/CardView'], function(CardView){
  function Card(value, type){
    this.value = value;
    this.type = type;

    this.imageIndex = type * 8 + value + 1;
    this.image = 'public/images/cards/' + this.imageIndex + '.jpg';
    this.preview = 'public/images/cards/preview.jpg';

    this.view = new CardView(this);
  }

  var p = Card.prototype;

  p.isWeli = function(){
    return this.value === 0;
  };

  p.isHit = function(){
    var target = require('controllers/MainController').instance.game.target;
    return this.value === target.value;
  };

  p.isTrump = function(){
    var target = require('controllers/MainController').instance.game.target;

    // weli will be a trump by default
    if (this.isWeli()) return true;

    return this.type === target.type;
  };

  p.isLowTrump = function(){
    // all trumps except for hits
    return this.isTrump() && (! (this.isStrongest() || this.isHit()));
  };

  p.isRightOne = function(){
    return this.isHit() && this.isTrump();
  };

  p.isStrongest = function(){
    var target = require('controllers/MainController').instance.game.target;

    // weli will be the strongest card itself
    if (target.isWeli()) return false;

    // get strongest card (next highest hit with the same trump)
    var isStrongest = this.value === target.value + 1 && this.type === target.type;

    // ace was called
    if (target.value === 8 && this.value === 1 && this.type === target.type) isStrongest = true;

    return isStrongest;
  };

  p.isNothing = function(){
    return this.getValue() < 50;
  };

  p.getValue = function(){
    var target = require('controllers/MainController').instance.game.target;

    var value = this.value;

    // calculate card value based on target / called card
    if (this.isStrongest()) value = 200;
    else if (this.isRightOne()) value = 150;
    else if (this.isHit()) value = 100;
    else if (this.isTrump()) value += 50;

    return value;
  };

  p.compare = function(otherCard){
    if (otherCard === null) {
      return this;
    }

    var selfValue = this.getValue();
    var otherValue = otherCard.getValue();

    // if both cards are neither a trump nor any other special card
    if (this.isNothing() && otherCard.isNothing()) {
      // and the card has a higher hit value than the other card
      if (this.value > otherCard.value && this.type === otherCard.type) return true;
      return false;
    }

    if (selfValue > otherValue) return true;
  };

  Card.naming = function(value, type){
    var valueText = ['weli', '7', '8', '9', '10', 'Unter', 'Ober', 'König', 'Ass'];
    var typeText = ['Schell', 'Herz', 'Eichel', 'Laub'];
    return valueText[value] + ' ' + typeText[type];
  };

  return Card;
});
