var EPT = {};

EPT.Sfx = {
	manage: function(type, mode, game, button, label) {
		switch(mode) {
			case 'init': {
        EPT.Storage.initUnset('EPT-'+type, true);
        EPT.Sfx.status = EPT.Sfx.status || [];
        EPT.Sfx.status[type] = EPT.Storage.get('EPT-'+type);
        if(type == 'sound') {
          EPT.Sfx.sounds = [];
          EPT.Sfx.sounds['click'] = game.sound.add('sound-click');
        }
        else { // music
          if(!EPT.Sfx.music || !EPT.Sfx.music.isPlaying) {
            EPT.Sfx.music = game.sound.add('music-theme');
            EPT.Sfx.music.volume = 0.5;
          }
        }
				break;
			}
			case 'on': {
				EPT.Sfx.status[type] = true;
				break;
			}
			case 'off': {
				EPT.Sfx.status[type] = false;
				break;
			}
			case 'switch': {
				EPT.Sfx.status[type] =! EPT.Sfx.status[type];
				break;
			}
			default: {}
    }
    EPT.Sfx.update(type, button, label);

    if(type == 'music' && EPT.Sfx.music) {
      if(EPT.Sfx.status['music']) {
        if(!EPT.Sfx.music.isPlaying) {
          EPT.Sfx.music.play({loop:true});
        }
      }
      else {
        EPT.Sfx.music.stop();
      }
    }

    EPT.Storage.set('EPT-'+type, EPT.Sfx.status[type]);
	},
	play: function(audio) {
    if(audio == 'music') {
      if(EPT.Sfx.status['music'] && EPT.Sfx.music && !EPT.Sfx.music.isPlaying) {
        EPT.Sfx.music.play({loop:true});
      }
    }
    else { // sound
      if(EPT.Sfx.status['sound'] && EPT.Sfx.sounds && EPT.Sfx.sounds[audio]) {
        EPT.Sfx.sounds[audio].play();
      }
    }
  },
  update: function(type, button, label) {
    if(button) {
      if(EPT.Sfx.status[type]) {
        button.setTexture('button-'+type+'-on');
      }
      else {
        button.setTexture('button-'+type+'-off');
      }
    }
    if(label) {
      if(EPT.Sfx.status[type]) {
        label.setText(EPT.Lang.text[EPT.Lang.current][type+'-on']);
      }
      else {
        label.setText(EPT.Lang.text[EPT.Lang.current][type+'-off']);
      }
    }
  }
};
EPT.fadeOutIn = function(passedCallback, context) {
  context.cameras.main.fadeOut(250);
  context.time.addEvent({
    delay: 250,
    callback: function() {
      context.cameras.main.fadeIn(250);
      passedCallback(context);
    },
    callbackScope: context
  });  
}
EPT.fadeOutScene = function(sceneName, context) {
  context.cameras.main.fadeOut(250);
  context.time.addEvent({
      delay: 250,
      callback: function() {
        context.scene.start(sceneName);
      },
      callbackScope: context
  });
};

class Button extends Phaser.GameObjects.Image {
  constructor(x, y, texture, callback, scene, noframes) {
    super(scene, x, y, texture, 0);
    this.setInteractive({ useHandCursor: true });
    
    this.on('pointerup', function() {
      if(!noframes) {
        this.setFrame(1);
      }
    }, this);

    this.on('pointerdown', function() {
      if(!noframes) {
        this.setFrame(2);
      }
      callback.call(scene);
    }, this);

    this.on('pointerover', function() {
      if(!noframes) {
        this.setFrame(1);
      }
    }, this);

    this.on('pointerout', function() {
      if(!noframes) {
        this.setFrame(0);
      }
    }, this);

    scene.add.existing(this);
  }
};

EPT.Storage = {
	availability: function() {
		if(!(!(typeof(window.localStorage) === 'undefined'))) {
			console.log('localStorage not available');
			return null;
		}
	},
	get: function(key) {
		this.availability();
		try {
			return JSON.parse(localStorage.getItem(key));
		}
		catch(e) {
			return window.localStorage.getItem(key);
		}
	},
	set: function(key, value) {
		this.availability();
		try {
			window.localStorage.setItem(key, JSON.stringify(value));
		}
		catch(e) {
			if(e == QUOTA_EXCEEDED_ERR) {
				console.log('localStorage quota exceeded');
			}
		}
	},
	initUnset: function(key, value) {
		if(this.get(key) === null) {
			this.set(key, value);
		}
	},
	getFloat: function(key) {
		return parseFloat(this.get(key));
	},
	setHighscore: function(key, value) {
		if(value > this.getFloat(key)) {
			this.set(key, value);
		}
	},
	remove: function(key) {
		this.availability();
		window.localStorage.removeItem(key);
	},
	clear: function() {
		this.availability();
		window.localStorage.clear();
	}
};

EPT.Lang = {
  current: 'en',
  options: ['en', 'pl'],
  parseQueryString: function(query) {
    var vars = query.split('&');
    var query_string = {};
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (typeof query_string[pair[0]] === 'undefined') {
        query_string[pair[0]] = decodeURIComponent(pair[1]);
      } else if (typeof query_string[pair[0]] === 'string') {
        var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
        query_string[pair[0]] = arr;
      } else {
        query_string[pair[0]].push(decodeURIComponent(pair[1]));
      }
    }
    return query_string;
  },
  updateLanguage: function(lang) {
    var query = window.location.search.substring(1);
    var qs = EPT.Lang.parseQueryString(query);
    if(qs && qs['lang']) {
      console.log('LANG: '+qs['lang']);
      EPT.Lang.current = qs['lang'];
    } else {
      if(lang) {
        EPT.Lang.current = lang;
      }
      else {
        EPT.Lang.current = navigator.language;
      }
    }
    if(EPT.Lang.options.indexOf(EPT.Lang.current) == -1) {
      EPT.Lang.current = 'en';
    }
  },
  text: {
    'en': {
      'FONT': 'Berlin',
      'settings': 'SETTINGS',
      'sound-on': 'Sound: ON',
      'sound-off': 'Sound: OFF',
      'music-on': 'Music: ON',
      'music-off': 'Music: OFF',
      'keyboard-info': 'Press K for keyboard shortcuts',
      'credits': 'CREDITS',
      'madeby': 'EPT made by',
      'team': 'THE TEAM',
      'coding': 'coding',
      'design': 'design',
      'testing': 'testing',
      'musicby': 'Music by',
      'key-title': 'KEYBOARD SHORTCUTS',
      'key-settings-title': 'Settings',
      'key-settings-onoff': 'S - show/hide settings',
      'key-audio': 'A - turn sound on/off',
      'key-music': 'M - turn music on/off',
      'key-credits': 'C - show/hide credits',
      'key-shortcuts': 'K - show/hide keyboard shortcuts',
      'key-menu': 'Main menu',
      'key-start': 'Enter - start game',
      'key-continue': 'Enter - continue',
      'key-gameplay': 'Gameplay',
      'key-button': 'Enter - activate CLICK ME button',
      'key-pause': 'P - turn pause screen on/off',
      'key-pause-title': 'Pause screen',
      'key-back': 'B - back to main menu',
      'key-return': 'P - return to the game',
      'key-gameover': 'Game over screen',
      'key-try': 'T - try again',
      'gameplay-score': 'Score: ',
      'gameplay-timeleft': 'Time left: ',
      'gameplay-paused': 'PAUSED',
      'gameplay-gameover': 'GAME OVER',
      'menu-highscore': 'Highscore: ',
      'screen-story-howto': 'Story / how to play\nscreen'
    },
    'pl': {
      'FONT': 'Arial',
      'settings': 'USTAWIENIA',
      'sound-on': 'D??wi??k: W??.',
      'sound-off': 'D??wi??k: WY??.',
      'music-on': 'Muzyka: W??.',
      'music-off': 'Muzyka: WY??.',
      'keyboard-info': 'Wci??nij K by zobaczy?? skr??ty klawiszowe',
      'credits': 'AUTORZY',
      'madeby': 'EPT stworzone przez',
      'team': 'ZESP????',
      'coding': 'kodowanie',
      'design': 'grafika',
      'testing': 'testowanie',
      'musicby': 'Muzyka autorstwa',
      'key-title': 'SKR??TY KLAWISZOWE',
      'key-settings-title': 'Ustawienia',
      'key-settings-onoff': 'S - poka??/ukryj ustawienia',
      'key-audio': 'A - w????cz/wy????cz d??wi??k',
      'key-music': 'M - w????cz/wy????cz muzyk??',
      'key-credits': 'C - poka??/ukryj autor??w',
      'key-shortcuts': 'K - poka??/ukryj skr??ty klawiszowe',
      'key-menu': 'Menu g????wne',
      'key-start': 'Enter - zacznij gr??',
      'key-continue': 'Enter - kontynuuj',
      'key-gameplay': 'Rozgrywka',
      'key-button': 'Enter - aktywuj przycisk CLICK ME',
      'key-pause': 'P - w????cz/wy????cz pauz??',
      'key-pause-title': 'Ekran pauzy',
      'key-back': 'B - powr??t do menu g????wnego',
      'key-return': 'P - powr??t do gry',
      'key-gameover': 'Ekran ko??ca gry',
      'key-try': 'T - spr??buj ponownie',
      'gameplay-score': 'Wynik: ',
      'gameplay-timeleft': 'Pozosta??y czas: ',
      'gameplay-paused': 'PAUZA',
      'gameplay-gameover': 'KONIEC GRY',
      'menu-highscore': 'Rekord: ',
      'screen-story-howto': 'Ekran fabu??y / jak gra??'
    }
  }
};

// Usage tracking - remember to replace with your own!
var head = document.getElementsByTagName('head')[0];
var script = document.createElement('script');
script.type = 'text/javascript';
script.onload = function() {
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'UA-30485283-26');
}
script.src = 'https://www.googletagmanager.com/gtag/js?id=UA-30485283-26';
head.appendChild(script);