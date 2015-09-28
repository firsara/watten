define(['config', 'views/PlayerView', 'utils/sortArrayByKey', 'models/Card'], function(config, PlayerView, sortArrayByKey, Card){
  function Player(index){
    this.isAI = false;
    this.index = index;
    this.friend = null;
    this.enemy = null;
    this.knowsTarget = false;
    this.reset();

    this.view = new PlayerView(this);
  }

  var p = Player.prototype;

  p.getCompoundScore = function(){
    return this.score + this.friend.score;
  };

  p.reset = function(){
    this.assumesCardToBeat = null;
    this.assumptions = [];
    this.cards = [];
    this.score = 0;
  };

  p.initAI = function(){
    this.isAI = true;
  };

  p.learn = function(type, data){
    var game = require('controllers/MainController').instance.game;
    var i = 0, j = 0;
    var playedCards = data.playedCards;
    var card = data.card;

    switch (type) {
      case 'playedCard':

        if (this.assumptions.length === 0) {
          // set basic assumptions to equal neutrally to 1 (so that multiplication is possible later)
          for (i = 0; i <= 8; i++) {
            this.assumptions.push({hit: {value: i, strength: 1}});
          }

          for (j = 0; j < 4; j++) {
            this.assumptions.push({type: {value: j, strength: 1}});
          }

          // will assume that either a trump or a hit was played at first
          if (Math.random() > 0.75) {
            if (Math.random() > 0.5) {
              this.assumptions.push({hit: {value: card.value, strength: 3}});
            } else {
              this.assumptions.push({type: {value: card.type, strength: 3}});
            }
          } else {
            // by default assume that first played card was nothing
            for (i = 0; i <= 8; i++) {
              for (j = 0; j < 4; j++) {
                if (! (card.value === i && card.type === j)) {
                  this.assumptions.push({hit: {value: i, strength: 1}, type: {value: j, strength: 1}});
                }
              }
            }
          }
        }

        var thinksValue = this.assumeValue();
        var thinksType = this.assumeType();

        var oldValue = game.target.value;
        var oldType = game.target.type;
        if (thinksValue === null || typeof thinksValue === 'undefined') thinksValue = game.target.value;
        if (thinksType === null || typeof thinksType === 'undefined') thinksType = game.target.type;
        game.target.value = thinksValue;
        game.target.type = thinksType;

        if (card.compare(this.assumesCardToBeat)) {
          this.assumesCardToBeat = card;
        }

        game.target.value = oldValue;
        game.target.type = oldType;

      break;

      case 'wonRound':

        var currentResult = this.assume();

        // if friend played the winning card (assuming he will play correctly)
        // if friend was the last that played a card
        if (card.player.friend === this.index && game.current.index === this.friend.next()) {
          // TODO: implement check if his card was higher than the one of the opponent etc.
          this.assumptions.push({
            hit: {
              value: card.value,
              strength: currentResult.valueStrengths[card.value] * 2 + 1
            },
            type: {
              value: card.type,
              strength: currentResult.typeStrengths[card.type] * 2 + 1
            }
          });
        } else {
          // TODO: differentiate between hit and trump
          this.assumptions.push({
            hit: {
              value: card.value,
              strength: currentResult.valueStrengths[card.value] * 2 + 1
            },
            type: {
              value: card.type,
              strength: currentResult.typeStrengths[card.type] * 2 + 1
            }
          });
        }

      break;
    }
  };

  p.getAssumedStrength = function(){
    return this.assume();
  };

  p.assume = function(){
    if (this.assumptions.length === 0) {
      return {value: Math.floor(Math.random() * 9), type: Math.floor(Math.random() * 4), valueStrengths: [0, 0, 0, 0, 0, 0, 0, 0, 0], typeStrengths: [0, 0, 0, 0]};
    }

    var result = {valueStrengths: [0, 0, 0, 0, 0, 0, 0, 0, 0], typeStrengths: [0, 0, 0, 0]};

    var hitAssumptions = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    var typeAssumptions = [0, 0, 0, 0];
    var i = 0;

    for (i = 0; i <= 8; i++) {
      hitAssumptions[i] = {hit: i, strength: 0};
    }

    for (i = 0; i < 4; i++) {
      typeAssumptions[i] = {type: i, strength: 0};
    }

    for (i = 0; i < this.assumptions.length; i++) {
      if (this.assumptions[i].hit) {
        hitAssumptions[this.assumptions[i].hit.value].strength += this.assumptions[i].hit.strength;
        result.valueStrengths[this.assumptions[i].hit.value] += this.assumptions[i].hit.strength;
      }

      if (this.assumptions[i].type) {
        typeAssumptions[this.assumptions[i].type.value].strength += this.assumptions[i].type.strength;
        result.typeStrengths[this.assumptions[i].type.value] += this.assumptions[i].type.strength;
      }
    }

    hitAssumptions = sortArrayByKey(hitAssumptions, 'strength');
    hitAssumptions.reverse();

    typeAssumptions = sortArrayByKey(typeAssumptions, 'strength');
    typeAssumptions.reverse();

    result.value = hitAssumptions[0].hit;
    result.type = hitAssumptions[0].type;

    if (result.value === null || typeof result.value === 'undefined') result.value = Math.floor(Math.random() * 9);
    if (result.type === null || typeof result.type === 'undefined') result.type = Math.floor(Math.random() * 4);

    return result;
  };

  p.assumeValue = function(){
    return this.assume().value;
  };

  p.assumeType = function(){
    return this.assume().type;
  };

  p.hasWeli = function(){
    for (var i = 0; i < this.cards.length; i++) {
      if (this.cards[i].isWeli()) return true;
    }

    return false;
  };

  p.next = function(){
    var id = this.index + 1;
    if (id >= 4) id = 0;
    return require('controllers/MainController').instance.game.players[id];
  };

  p.prev = function(){
    var id = this.index - 1;
    if (id < 0) id = 3;
    return require('controllers/MainController').instance.game.players[id];
  };

  p.isAllowedToPlay = function(card){
    var game = require('controllers/MainController').instance.game;

    if (game.playedCards && game.playedCards[0] && game.playedCards[0].isTrump()) {
      var hasTrump = false;

      for (var i = 0; i < this.cards.length; i++) {
        if (this.cards[i].isLowTrump()) {
          hasTrump = true;
          break;
        }
      }

      if (hasTrump) {
        if (! (card.isTrump() || card.isHit())) {
          return false;
        }
      }
    }

    return true;
  };

  p.filter = function(cardType, inCards){
    if (! inCards) inCards = this.cards;
    if (! Array.isArray(cardType)) cardType = [cardType];

    var tmp = [];

    for (var i = 0; i < this.cards.length; i++) {
      var cardIsValid = false;

      for (var j = 0; j < cardType.length; j++) {
        var allPropsAreValid = true;

        for (var k in cardType[j]) {
          var prop = k;
          var val = cardType[j][k];

          if (k.indexOf('!') >= 0) {
            prop = k.replace('!', '');

            if (this.cards[i][prop] === val) {
              allPropsAreValid = false;
            }
          } else {
            if (this.cards[i][prop] !== val) {
              allPropsAreValid = false;
            }
          }
        }

        if (allPropsAreValid) {
          cardIsValid = true;
        }
      }

      if (cardIsValid) {
        tmp.push(this.cards[i]);
      }
    }

    return tmp;
  };

  p.fetchHit = function(callback){
    this.view.$el.find('.notice').html('<strong>Schlag</strong> ansagen').css('display', 'block');

    if (this.isAI === false) {
      this.decide(callback);
    } else {
      var cardByHit = [];
      var chosenHit = -1;
      var card = null;
      var i = 0, j = 0, k = 0;

      for (i = 0; i < this.cards.length; i++) {
        cardByHit[this.cards[i].value] = this.cards[i];
      }

      if (Math.random() > 0.015) {
        // choose trump based on max number of trump cards
        var hitCount = [0, 0, 0, 0, 0, 0, 0, 0, 0];

        for (i = 0; i < this.cards.length; i++) {
          hitCount[this.cards[i].value] += 1;
        }

        for (i = 0; i < hitCount.length; i++) {
          hitCount[i] = {hit: i, count: hitCount[i]};
        }

        hitCount = sortArrayByKey(hitCount, 'count');
        hitCount.reverse();

        // if has same amount of hits on several different hit cards
        if (hitCount[0].count === hitCount[1].count) {
          // choose for possible strongest

          // if has not even a double hit but has got weli (i.e. all different hits)
          if (hitCount[0].count === 1 && cardByHit[0]) {
            // choose weli
            chosenHit = 0;
          } else {
            // otherwise: find a possible good one
            var foundHit = -1;

            // loop through all cards
            for (i = 0; i < this.cards.length; i++) {
              for (j = 0; j < 2; j++) {
                // that match the two highest matching hits in players cards
                if (this.cards[i].value === hitCount[j].hit) {
                  for (k = 0; k < this.cards.length; k++) {
                    // if has at least one card that is higher than the hit he would call (i.e. possibility of strongest one)
                    if (this.cards[k].value - 1 === this.cards[i].value || this.cards[k].value === 1 && this.cards[i].value === 8) {
                      // choose that card
                      foundHit = this.cards[i].value;
                      break;
                    }
                  }
                }
              }
            }

            // if did not find a possible strongest one
            if (foundHit === -1) {
              // simply choose lowest card of same pair (i.e. possibility of higher trumps)
              // TODO: or hit card where player has possible trumps
              if (hitCount[0].hit < hitCount[1].hit) {
                chosenHit = hitCount[0].hit;
              } else {
                chosenHit = hitCount[1].hit;
              }
            } else {
              chosenHit = foundHit;
            }
          }
        } else {
          chosenHit = hitCount[0].hit;
        }

        // if didn't find a hit by mistake
        if (chosenHit === -1) {
          // select a random one
          chosenHit = this.cards[Math.floor(Math.random() * this.cards.length)].value;
        }

        card = cardByHit[chosenHit];
        if (! card) card = this.cards[Math.floor(Math.random() * this.cards.length)];
        this._fakedDecision(callback, card, 500, 500);
      } else {
        // small chance of failing an choosing randomly
        card = this.cards[Math.floor(Math.random() * this.cards.length)];
        this._fakedDecision(callback, card, 500, 500);
      }
    }
  };

  p.fetchTrump = function(callback){
    this.view.$el.find('.notice').html('<strong>Trumpf</strong> ansagen').css('display', 'block');

    if (this.isAI === false) {
      this.decide(callback);
    } else {
      var lowestCardByTrump = [null, null, null, null];
      var chosenTrump = -1;
      var card = null;
      var i = 0;

      for (i = 0; i < this.cards.length; i++) {
        if (! lowestCardByTrump[this.cards[i].type] || this.cards[i].value < lowestCardByTrump[this.cards[i].type]) {
          lowestCardByTrump[this.cards[i].type] = this.cards[i];
        }
      }

      // probably:
      if (Math.random() > 0.2) {
        // choose trump based on combined value of all trump cards
        var trumpValues = [0, 0, 0, 0];

        for (i = 0; i < this.cards.length; i++) {
          trumpValues[this.cards[i].type] += this.cards[i].value;
        }

        trumpValues = [{trump: 0, value: trumpValues[0]}, {trump: 1, value: trumpValues[1]}, {trump: 2, value: trumpValues[2]}, {trump: 3, value: trumpValues[3]}];
        trumpValues = sortArrayByKey(trumpValues, 'value');
        trumpValues.reverse();

        chosenTrump = trumpValues[0].trump;

        card = lowestCardByTrump[chosenTrump];
        if (! card) card = this.cards[Math.floor(Math.random() * this.cards.length)];
        this._fakedDecision(callback, card, 500, 500);
      } else if (Math.random() < 0.985) {
        // otherwise: choose trump based on max number of trump cards
        var trumpCount = [0, 0, 0, 0];

        for (i = 0; i < this.cards.length; i++) {
          trumpCount[this.cards[i].type] += 1;
        }

        trumpCount = [{trump: 0, value: trumpCount[0]}, {trump: 1, value: trumpCount[1]}, {trump: 2, value: trumpCount[2]}, {trump: 3, value: trumpCount[3]}];
        trumpCount = sortArrayByKey(trumpCount, 'value');
        trumpCount.reverse();

        if (trumpCount[0].value === trumpCount[1].value) {
          chosenTrump = trumpCount[Math.floor(Math.random() * trumpCount.length)].trump;
        } else {
          chosenTrump = trumpCount[0].trump;
        }

        card = lowestCardByTrump[chosenTrump];
        if (! card) card = this.cards[Math.floor(Math.random() * this.cards.length)];
        this._fakedDecision(callback, card, 500, 500);
      } else {
        // small chance of failing an choosing randomly
        card = this.cards[Math.floor(Math.random() * this.cards.length)];
        this._fakedDecision(callback, card, 500, 500);
      }
    }
  };

  p.choose = function(callback){
    var game = require('controllers/MainController').instance.game;
    var played = game.playedCards;

    if (this.isAI === false) {
      this.view.$el.find('.notice').html('Karte ausspielen').css('display', 'block');

      var _this = this;

      this.decide(function(card, index){
        _this.cards.splice(index, 1);

        if (callback) {
          callback(card);
        }
      });
    } else {
      var allowedCards = this.cards;
      var card = null;
      var tmpCards = null;
      var uselessCards = null;
      var cardsThatBeat = [];
      var i = 0;

      var thinksValue = null;
      var thinksType = null;
      var thinksCardToBeat = null;

      var debugText = '';

      if (this.knowsTarget) {
        thinksValue = game.target.value;
        thinksType = game.target.type;
        thinksCardToBeat = game.cardToBeat;

        allowedCards = [];

        for (i = 0; i < this.cards.length; i++) {
          if (this.isAllowedToPlay(this.cards[i])) {
            allowedCards.push(this.cards[i]);
          }
        }
      } else {
        thinksValue = this.assumeValue();
        thinksType = this.assumeType();
        thinksCardToBeat = this.assumesCardToBeat;

        debugText = 'tries to ';
        if (config.debug) console.log('player', this.index, 'THINKS ' + Card.naming(thinksValue, thinksType));
      }

      var oldValue = game.target.value;
      var oldType = game.target.type;
      var oldCardToBeat = game.cardToBeat;
      if (thinksValue === null || typeof thinksValue === 'undefined') thinksValue = game.target.value;
      if (thinksType === null || typeof thinksType === 'undefined') thinksType = game.target.type;
      if (oldCardToBeat === null || typeof oldCardToBeat === 'undefined') oldCardToBeat = game.cardToBeat;
      game.target.value = thinksValue;
      game.target.type = thinksType;
      game.cardToBeat = thinksCardToBeat;

      if (played.length > 0) {
        // Still needs to beat the card
        for (i = 0; i < allowedCards.length; i++) {
          if (allowedCards[i].compare(game.cardToBeat)) {
            allowedCards[i]._calculatedValue = allowedCards[i].getValue();
            cardsThatBeat.push(allowedCards[i]);
          }
        }

        cardsThatBeat = sortArrayByKey(cardsThatBeat, '_calculatedValue');
      }

      // if needs to open round
      if (played.length === 0) {
        // and has more than two hits left -> play one directly
        if (this.filter({value: game.target.value}, allowedCards).length > 2 && Math.random() > 0.25) {
          card = this.filter({value: game.target.value, '!type': game.target.type}, allowedCards);
          card = card[0];
          if (config.debug) console.log('player', this.index, debugText + 'open with HIT card');
        } else if (game.target.value <= 6 && Math.random() > 0.3) {
          // if has an ace trump (only if ace was not called and is not good one)
          if (this.filter({value: 8, type: game.target.type}, allowedCards).length > 0) {
            card = this.filter({value: 8, type: game.target.type}, allowedCards);
            card = card[0];
            if (config.debug) console.log('player', this.index, debugText + 'open with ACE trump');
          } else if (this.filter({value: 1, type: game.target.type}, allowedCards).length > 0 && Math.random() > 0.2) {
            card = this.filter({value: 1, type: game.target.type}, allowedCards);
            card = card[0];
            if (config.debug) console.log('player', this.index, debugText + 'open with 7 trump');
          }
        }

        if (! card) {
          uselessCards = this.filter({'!type': game.target.type, '!value': game.target.value}, allowedCards);
          uselessCards = sortArrayByKey(uselessCards, 'value');

          if (Math.random() > 0.5) {
            // try to select an ace of a random color
            uselessCards.reverse();
            card = uselessCards[0];
          } else {
            // try to select lowest possible card
            card = uselessCards[0];
          }

          if (config.debug) console.log('player', this.index, debugText + 'open with useless card');
        }
      } else if (played.length === 3) {
        // if needs to finish round

        // if friend player already won the round
        if (game.cardToBeat.player.friend.index === this.index) {
          // select random useless card
          uselessCards = this.filter({'!type': game.target.type, '!value': game.target.value}, allowedCards);
          uselessCards = sortArrayByKey(uselessCards, 'value');

          // try to select lowest possible card
          card = uselessCards[0];

          if (config.debug) console.log('player', this.index, debugText + 'add useless card (leave friend the round)');
        } else {
          card = cardsThatBeat[0];

          if (config.debug) console.log('player', this.index, debugText + 'try to win round with lowest possible higher card');
        }
      } else if (played.length === 1 || played.length === 2) {
        // if it's a high trump card and has a hit in hand
        if (game.cardToBeat.isLowTrump() && game.cardToBeat.value > 6 && this.filter({value: game.target.value, '!type': game.target.type}, allowedCards).length > 0) {
          card = this.filter({value: game.target.value, '!type': game.target.type}, allowedCards);
          card = card[0];
          if (config.debug) console.log('player', this.index, debugText + 'beats with HIT');
        } else if (game.cardToBeat.isLowTrump() && game.cardToBeat.value <= 6 && this.filter({type: game.target.type, '!value': game.target.value}, allowedCards).length > 0) {
          // if it's a low trump card and has a higher trump card in hand
          tmpCards = this.filter({type: game.target.type, '!value': game.target.value}, allowedCards);
          tmpCards = sortArrayByKey(tmpCards, 'value');

          for (i = 0; i < tmpCards.length; i++) {
            if (tmpCards[i].isLowTrump()) {
              card = tmpCards[i];
              if (config.debug) console.log('player', this.index, debugText + 'beats with higher trump card');
              break;
            }
          }
        } else if (cardsThatBeat[0]) {
          if (! game.cardToBeat.isNothing() && game.round < 2 && ! (cardsThatBeat[0].isHit() || cardsThatBeat[0].isRightOne() || cardsThatBeat[0].isStrongest())) {
            card = cardsThatBeat[0]; if (config.debug) console.log('player', this.index, debugText + 'beats with next lowest possible card');
          } else if (! game.cardToBeat.isNothing() && game.round < 3 && ! (cardsThatBeat[0].isRightOne() || cardsThatBeat[0].isStrongest())) {
            card = cardsThatBeat[0]; if (config.debug) console.log('player', this.index, debugText + 'beats with next lowest possible card');
          } else if (game.cardToBeat.isNothing() && game.round < 1 && cardsThatBeat[0].isNothing()) {
            card = cardsThatBeat[0]; if (config.debug) console.log('player', this.index, debugText + 'beats with next lowest possible card');
          } else if (! game.cardToBeat.isNothing() && this.enemy.getCompoundScore() >= 2) {
            card = cardsThatBeat[0]; if (config.debug) console.log('player', this.index, debugText + 'beats with next lowest possible card');
          } else if (game.cardToBeat.isNothing() && cardsThatBeat[0].isNothing()) {
            card = cardsThatBeat[0]; if (config.debug) console.log('player', this.index, debugText + 'beats with next lowest possible card');
          } else if (Math.random() > 0.25) {
            card = cardsThatBeat[0]; if (config.debug) console.log('player', this.index, debugText + 'beats with next lowest possible card');
          }
        }
      }

      // if desperately needs a score
      if ((this.enemy.getCompoundScore() === 2 && game.round === 2) || (this.enemy.getCompoundScore() === 2 && Math.random() > 0.75)) {
        // and it's not the last card that's needed to be played
        var needsToBeat = true;
        if (this.played >= 2 && game.cardToBeat.player.friend.index === this.index) {
          needsToBeat = false;

          if (this.played === 3 &&  game.cardToBeat.player.friend.index !== this.index) {
            needsToBeat = true;
          }
        }

        if (needsToBeat) {
          // choose highest possible beat card
          card = cardsThatBeat[cardsThatBeat.length - 1];
        }
      }

      // if has no card selected
      if (! card) {
        uselessCards = this.filter({'!type': game.target.type, '!value': game.target.value}, allowedCards);
        uselessCards = sortArrayByKey(uselessCards, 'value');

        // try to select lowest possible card
        card = uselessCards[0];
      }

      // randomly deselect card selection (i.e. a "mistake")
      if (Math.random() > 0.9275) {
        card = null;
        if (config.debug) console.log('player', this.index, debugText + 'deselect card by mistaken');
      }

      if (! card) {
        card = allowedCards[Math.floor(Math.random() * allowedCards.length)];

        if (! card) {
          console.warn('card', card, allowedCards, this.cards);
          card = this.cards[Math.floor(Math.random() * this.cards.length)];
        }
      }


      for (i = 0; i < this.cards.length; i++) {
        if (this.cards[i].value === card.value && this.cards[i].type === card.type) {
          this.cards.splice(i, 1);
          break;
        }
      }

      game.target.value = oldValue;
      game.target.type = oldType;
      game.cardToBeat = oldCardToBeat;

      this._fakedDecision(callback, card, 500, 2000);
    }
  };

  p.decide = function(callback){
    this.view.decide(callback);
  };

  p.confirm = function(callback){
    this.view.confirm(callback);
  };

  p.confirmed = function(){
    this.view.$el.find('.button-ok').css('display', 'none');
  };

  p._fakedDecision = function(callback, card, timeout, additionalTimeout){
    setTimeout(function(){
      callback(card);
    }, timeout + Math.random() * additionalTimeout);
  };

  Player.hideNotices = function(){
    var players = require('controllers/MainController').instance.game.players;
    for (var i = 0; i < players.length; i++) {
      players[i].view.$el.find('.notice').html('').css('display', 'none');
    }
  };

  return Player;
});
