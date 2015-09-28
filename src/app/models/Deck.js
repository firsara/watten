define(['models/Card'], function(Card){
  function Deck(){
    this.reset();
  }

  var p = Deck.prototype;

  p.reset = function(){
    this.cards = [];
    this.cards.push(new Card(0, 0));

    for (var j = 0; j < 4; j++) {
      for (var i = 1; i <= 8; i++) {
        this.cards.push(new Card(i, j));
      }
    }
  };

  p.getRandom = function(){
    var index = Math.floor(Math.random() * this.cards.length);
    return this.getCardByIndex(index);
  };

  p.getCard = function(card){
    var index = this.getCardIndex(card);
    return this.getCardByIndex(index);
  };

  p.getCardByIndex = function(index){
    var card = this.cards.splice(index, 1);
    return card[0];
  };

  p.getCardIndex = function(card){
    for (var i = 0; i < this.cards.length; i++) {
      if (this.cards[i].value === card.value && this.cards[i].type === card.type) {
        return i;
      }
    }

    return -1;
  };

  Deck.instance = new Deck();

  return Deck;
});
