define([
  'backbone',
  'config',
  'views/GameView',
  'models/Player',
  'models/Deck',
  'models/Card'
], function(
  Backbone,
  config,
  GameView,
  Player,
  Deck,
  Card
){
  function GameController(){
    this.view = new GameView();

    this.players = [];

    for (var i = 0; i < 4; i++) {
      var player = new Player(i);

      if (config.AI) {
        player.initAI();
      } else {
        if (i !== 0) player.initAI();
      }

      this.players.push(player);
      this.view.$el.append(player.view.$el);
    }

    this.players[0].friend = this.players[2];
    this.players[1].friend = this.players[3];
    this.players[2].friend = this.players[0];
    this.players[3].friend = this.players[1];

    this.players[0].enemy = this.players[1];
    this.players[1].enemy = this.players[2];
    this.players[2].enemy = this.players[3];
    this.players[3].enemy = this.players[0];
  }

  var p = GameController.prototype;

  p.start = function(){
    this.hit = null;
    this.trump = null;
    this.round = -1;

    for (var i = 0; i < this.players.length; i++) {
      this.players[i].reset();

      for (var j = 0; j < 5; j++) {
        var card = Deck.instance.getRandom();
        card.player = this.players[i];

        if (i === 0 || config.debug) card.view.show();
        this.players[i].cards.push(card);
        this.players[i].view.addCard(card);
      }
    }

    this.current = Math.floor(Math.random() * 4);
    this.current = 1;
    this.current = this.players[this.current];

    this.current.knowsTarget = true;
    this.current.prev().knowsTarget = true;

    this.current.friend.knowsTarget = config.open;
    this.current.prev().friend.knowsTarget = config.open;

    this.current.fetchHit(this.gotHit.bind(this));
    this.current.prev().fetchTrump(this.gotTrump.bind(this));
  };

  p.gotHit = function(card){
    this.hit = card;
    if (this.hit && this.trump) this.init();
  };

  p.gotTrump = function(card){
    this.trump = card;
    if (this.hit && this.trump) this.init();
  };

  p.init = function(){
    Player.hideNotices();

    if (this.current.index === 0) this.trump.view.show();
    if (this.current.index === 1) this.hit.view.show();

    this.view.$el.find('.target-hit-card').html('');
    this.view.$el.find('.target-trump-card').html('');
    this.target = new Card(this.hit.value, this.trump.type);

    if (this.hit.isWeli()) {
      var weliHit = new Card(0, 0);
      var weliTrump = new Card(this.trump.value, this.trump.type);

      if (this.players[0].knowsTarget) {
        weliHit.view.show();
        weliTrump.view.show();
      }

      this.view.$el.find('.target-hit-card').append(weliHit.view.$el);
      this.view.$el.find('.target-trump-card').append(weliTrump.view.$el);
      this.view.$el.find('.target-trump-card-wrapper').css('display', '');
      this.view.$el.find('.target-hit-card-title').css('display', '');
      this.view.$el.find('.target-hit-card-title-both').css('display', 'none');
    } else {
      this.view.$el.find('.target-hit-card').append(this.target.view.$el);
      this.view.$el.find('.target-trump-card-wrapper').css('display', 'none');
      this.view.$el.find('.target-hit-card-title').css('display', 'none');
      this.view.$el.find('.target-hit-card-title-both').css('display', '');
    }

    if (this.players[0].knowsTarget) {
      this.target.view.show();
      this.view.$el.find('.target-card').fadeOut(0).delay(200).fadeIn(1000);

      this.players[0].confirm(this.close.bind(this));
    }

    this._closeTimeout = setTimeout(this.close.bind(this), 20000);
  };

  p.close = function(){
    if (this._closeTimeout) clearTimeout(this._closeTimeout);
    this.players[0].confirmation = null;

    if (this.current.index === 0 && ! config.debug) this.trump.view.hide();
    if (this.current.index === 1 && ! config.debug) this.hit.view.hide();

    this.nextRound();
  };

  p.nextRound = function(){
    this.round++;
    this.cardToBeat = null;
    this.current = this.current;
    this.playerToPlayCard = this.current.prev();

    for (var i = 0; i < this.players.length; i++) {
      this.players[i].assumesCardToBeat = null;
    }

    this.playedCards = [];
    this.nextCard();
  };

  p.nextCard = function(){
    Player.hideNotices();

    this.playerToPlayCard = this.playerToPlayCard.next();
    this.playerToPlayCard.choose(this.gotCard.bind(this));
  };

  p.gotCard = function(card){
    card.view.center(this.playerToPlayCard.index);
    this.playedCards.push(card);

    for (var i = 0; i < this.players.length; i++) {
      if (! this.players[i].knowsTarget) {
        this.players[i].learn('playedCard', {card: card});
      }
    }

    if (card.compare(this.cardToBeat)) {
      this.cardToBeat = card;
    }

    if (this.playedCards.length === 4) {
      Player.hideNotices();
      setTimeout(this.showRoundStatus.bind(this), 1500);
    } else {
      this.nextCard();
    }
  };

  p.showRoundStatus = function(){
    for (var i = 0; i < this.players.length; i++) {
      if (! this.players[i].knowsTarget) {
        this.players[i].learn('wonRound', {playedCards: this.playedCards, card: this.cardToBeat});
      }
    }

    this.cardToBeat.player.score++;
    this.cardToBeat.player.view.$el.find('.notice').html('Gestochen').css('display', 'block');

    this.view.$el.find('.current-score').html('<strong>' + this.players[0].getCompoundScore() + '</strong>:' + this.players[0].enemy.getCompoundScore());

    this.players[0].confirm(this.unlockRound.bind(this));
    this._unlockRoundTimeout = setTimeout(this.unlockRound.bind(this), 30000);
  };

  p.unlockRound = function(){
    if (this._unlockRoundTimeout) clearTimeout(this._unlockRoundTimeout);
    this.players[0].confirmation = null;

    this.moveCardsToWinner();

    if (this.cardToBeat.player.getCompoundScore() >= 3) {
      this.cardToBeat.player.view.$el.find('.notice').html('<strong>Player ' + (this.cardToBeat.player.index + 1) + ' + ' + (this.cardToBeat.player.friend.index + 1) + '</strong> WON').css('display', 'block');
    } else {
      this.current = this.cardToBeat.player;
      this.nextRound();
    }
  };

  p.moveCardsToWinner = function(){
    for (var i = 0; i < this.playedCards.length; i++) {
      this.playedCards[i].view.moveTo(this.cardToBeat.player.index);
    }
  };

  return GameController;
});
