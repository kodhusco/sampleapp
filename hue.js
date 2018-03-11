
window.Hue = {

    bridgeDiscoveryAddress: 'https://www.meethue.com/api/nupnp',
    bridgeIp: '',
    username: '',
    api: '',
    availableLights: [],
    minHue: 0,
    maxHue: 65280,
    brightnessRange: [0, 255],
    saturation: 100,
    numberOfLamps: 3,
    isStrobe: false,
    strobeInterval: null,
    offState: { on: false },
    onState: { on: true },
    shortFlashState: { alert: 'select' },
    longFlashState: { alert: 'lselect' },

    setLightNum: function(num) {
        this.numberOfLamps = num;
    },
    setBrightnessRange: function(range) {
        this.brightnessRange = range;
    },
    setSaturation: function(val) {
        this.saturation = val;
    },
    setLights: function(lights) {
        this.availableLights = lights.reduce((acc, light) => {
            if (light.active) {
                acc.push(light.index);
            }
            return acc;
        }, []);
        this.setLightNum(this.availableLights.length);
    },
    setHueValues: function(min, max) {
        this.minHue = min;
        this.maxHue = max;
    },
    getBridgeAddress: function() {
        var context = this;
        return new Promise(function(resolve, reject) {
            $.ajax({type: 'GET', url: context.bridgeDiscoveryAddress, success: function(data) {
                if (data.length) {
                    context.bridgeIp = data[0].internalipaddress; // Assuming there is only one bridge setup
                    resolve(context.bridgeIp);
                } else {
                    reject('No bridge was found...!');
                }
            }});
        });
    },
    authenticate: function(deviceName) { // Optional deviceName
        var context = this;
        deviceName = deviceName || 'codityInterface';
        this.username = localStorage['codity_hue_username'] || '';

        return new Promise(function(resolve, reject) {
            if (context.username !== '') {
                context.api = 'http://' + context.bridgeIp + '/api/' +  context.username;
                resolve(context.username);
            }
            $.ajax({ type: 'POST', dataType: 'json', contentType: 'application/json'
                ,url: 'http://' + context.bridgeIp + '/api'
                ,data: '{"devicetype": "huepi#' + deviceName + '"}', success: function(data) {
                    if (data[0].success) {
                        context.username = data[0].success.username;
                        localStorage['codity_hue_username'] = context.username;
                        context.api = 'http://' + context.bridgeIp + '/api/' +  context.username;
                        resolve();
                    } else {
                        reject(data);
                    }
                }
            });
        });
    },
    getLights: function() {
        var context = this;
        return new Promise(function(resolve, reject) {
            $.ajax({type: 'GET', url: context.api + '/lights',
                success: function(data) {
                    context.numberOfLamps = 0;
                    for(var index in data) {
                        context.numberOfLamps++;
                    }
                    resolve(data);
                }
            });
        });
    },
    buildStateURL: function(lampIndex /* Number */) {
        return this.api + '/lights/' + lampIndex + '/state';
    },
    setLightState: function(lampIndex, state, transitionTime) {
        var context = this;
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                $.ajax({
                    type: 'PUT',
                    dataType: 'json',
                    contentType: 'application/json',
                    url: context.buildStateURL(lampIndex),
                    data: JSON.stringify(state),
                    success: function() {
                        resolve();
                    }
                });
            }, (transitionTime || 0));
        });

    },
    setAllLightsState: function(state, delayInBetween) {
        for (var i = 0; i < this.numberOfLamps; i++) {
            this.setLightState(i+1, state);
        }
    },
    flashRandom: function() {
      var lampIndex = Math.floor(Math.random() * this.numberOfLamps) + 1;
      this.setLightState(lampIndex, this.shortFlashState);
    },
    discoRandomColor: function(transitionTime) {
        var randomX = Math.random();
        var randomY = Math.random();
        var state = {
          "on": true,
          "transitiontime": transitionTime,
          "bri": Math.floor(Math.random() * 255) + 1,
          "xy": [
              randomX,
              randomY
          ]
      };
      var lampIndex = Math.floor(Math.random() * this.numberOfLamps) + 1;
      this.setLightState(lampIndex, state);

    },
    discoFlashRandomColor: function(transitionTime) {
        var context = this;
        var randomX = Math.random();
        var randomY = Math.random();
        var randomLightNum = Math.floor(Math.random() * this.numberOfLamps) + 1;
        var state = {
            "on": true,
            "transitiontime": transitionTime,
            "bri": Math.floor(Math.random()*(this.brightnessRange[1] - this.brightnessRange[0] + 1) + this.brightnessRange[0]),
            "hue": Math.floor(Math.random()*(this.maxHue - this.minHue + 1) + this.minHue),
            "sat": this.saturation || 1,
            /*"xy": [
                randomX,
                randomY
            ]*/
        };
        var maxIteration = (context.numberOfLamps < 2) ? context.numberOfLamps : 2;
        var lampIndex = Math.floor(Math.random() * context.numberOfLamps);
        context.setLightState(context.availableLights[lampIndex], state, transitionTime)
            .then(function() {
                state.on = false;
                context.setLightState(lampIndex, state, transitionTime)
            }).then(function() {
            //context.setLightState(lampIndex, context.onState)
        });
    },
    startStrobe: function() {
        for (var i = 0; i < this.numberOfLamps; i++) {
            this.setLightState(i+1, {'on': false, 'transitiontime': 0});
        }
        var context = this;
        this.isStrobe = true;
        var prevRandom;
        this.strobeInterval = setInterval(function() {
            var state = {
                "on": true,
                "transitiontime": 0,
                "bri": Math.floor(Math.random()*(context.brightnessRange[1] - context.brightnessRange[0] + 1) + context.brightnessRange[0]),
                "hue": Math.floor(Math.random()*(context.maxHue - context.minHue + 1) + context.minHue),
                "sat": context.saturation || 1,
            };
            let lampIndex = Math.floor(Math.random() * context.numberOfLamps);
            while(lampIndex === prevRandom) {
                lampIndex = Math.floor(Math.random() * context.numberOfLamps);
            }

            prevRandom = lampIndex;
            context.setLightState(context.availableLights[lampIndex], state).then(function() {
                state.on = false;
                context.setLightState(context.availableLights[lampIndex], state);
            })
        }, 300);




    },
    stopStrobe() {
        this.isStrobe = false;
        clearInterval(this.strobeInterval);
    },
    flashAll: function() {
        this.setAllLightsState(this.shortFlashState)
    },
    longFlashAll: function() {
        this.setAllLightsState(this.longFlashState);
    }

};
