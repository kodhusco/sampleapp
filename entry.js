
import React from 'react';
import ReactDOM from 'react-dom';

import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {Tabs, Tab} from 'material-ui/Tabs';
//import Slider from 'material-ui/Slider';
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

import Button from './Button';
import ColorPicker from './ColorPicker';
import StrobeButton from './StrobeButton';
import $ from 'jquery';
window.$ = $;
import './hue';

import './styles.css';

const styles = {
    headline: {
      fontSize: 24,
      paddingTop: 16,
      marginBottom: 12,
      fontWeight: 400,
    },
};

const muiTheme = getMuiTheme({
    palette: {
        textColor: '#888',
        accent1Color: '#fff'

    }
});



class App extends React.Component {
    constructor() {
        super();
        this.state = {
            lights: [],
            volSens: localStorage.getItem('disco_hue_mic') || 1,
            saturation: localStorage.getItem('disco_hue_saturation') || 100,
            brightness:  JSON.parse(localStorage.getItem('disco_hue_brightness')) || [0, 100],
            playing: false,
            minHue: 0,
            maxHue: 65280
        }
        this.micHandler = this.micHandler.bind(this);
        this.saturationHandler = this.saturationHandler.bind(this);
        this.brightnessHandler = this.brightnessHandler.bind(this);
        this.init = this.init.bind(this);
        this.play = this.play.bind(this);

        this.setLights = this.setLights.bind(this);
        this.setLightStatus = this.setLightStatus.bind(this);
        this.setHueValues = this.setHueValues.bind(this);
    }
    componentDidMount() {
        this.init();
    }
    init() {
        Hue.setHueValues(this.state.minHue, this.state.maxHue);
        let threshold = 33;
        let levelsCount = 32;
        let levelBins;
        let levelsData = [];
        let level = 0;
        let levelHistory = [];
        let beatCutOff = 0;
        let beatTime = 0;

        let beatHoldTime = 10;
        let beatDecayRate = 0.60;

        let BEAT_MIN = 0.15;
        let bpmTime = 0;
        let msecsFirst = 0;
        let msecsPrevious = 0;
        let msecsAvg = 633;
        var transitionTime = 10;
        let bpmStart;

        var canvas = document.querySelector('.visualize');
        var WIDTH = $('.settings').width();
        $(canvas).width(WIDTH);
        var HEIGHT = 100;
        console.log(WIDTH, HEIGHT);
        let canvasCtx = canvas.getContext('2d');

        let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        let  analyser = audioCtx.createAnalyser();
        navigator.getUserMedia({audio: true}, (stream) => {
            var source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            analyser.fftSize = 1024;
            levelBins = Math.floor(analyser.frequencyBinCount / levelsCount);
            var bufferLength = analyser.frequencyBinCount;
            var dataArray = new Uint8Array(bufferLength);
            let updateBeat;
            let drawVisual;

            let draw = () => {
                canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
                drawVisual = requestAnimationFrame(draw);
                if (this.state.playing) {
                    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
                    analyser.getByteFrequencyData(dataArray);
                    canvasCtx.fillStyle = 'rgb(51, 51, 51)';
                    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
                    var barWidth = (1380 / bufferLength);
                    var barHeight;
                    var x = 0;
                    for (var i = 0; i < bufferLength; i++) {
                        barHeight = dataArray[i] / 2;

                        canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',40, 40)';
                        canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight);

                        x += barWidth + 1;
                    }
                }
            };
            draw();

            let update = () => {
                updateBeat = requestAnimationFrame(update);
                if (this.state.playing && !Hue.isStrobe) {
                    analyser.getByteFrequencyData(dataArray);
                    for (var i = 0; i < levelsCount; i++) {
                        var sum = 0;
                        for (var j = 0; j < levelBins; j++) {
                            sum += dataArray[(i * levelBins) + j];
                        }
                        levelsData[i] = sum / levelBins/256 * this.state.volSens;
                    }

                    var sum = 0;

                    for (var i = 0; i < levelsCount; i++) {
                        sum += levelsData[i];
                    }
                    level = sum / levelsCount;
                    levelHistory.push(level);

                    levelHistory.shift(1);


                    // Beat detection
                    if (level > beatCutOff && level > BEAT_MIN) {
                        //Hue.discoRandomColor(this.transitiontime); // automatic coloring
                        Hue.discoFlashRandomColor(transitionTime, this.state.saturation);
                        beatCutOff = level *1.1;
                        beatTime = 0;
                    } else {
                        if (beatTime <= beatHoldTime){
                            beatTime ++;
                        } else {
                            beatCutOff *= beatDecayRate;
                            beatCutOff = Math.max(beatCutOff,BEAT_MIN);
                        }
                    }
                }
            }
            update();


        }, function(err) {
            console.log(err);
        });
    }
    micHandler(value) {
        this.setState({volSens: value});
        localStorage.setItem('disco_hue_mic', value);
    }
    saturationHandler(value) {
        this.setState({saturation: value});
        Hue.setSaturation(value);
        localStorage.setItem('disco_hue_saturation', value);
    }
    brightnessHandler(value) {
        Hue.setBrightnessRange(value);
        this.setState({brightness: value});
        localStorage.setItem('disco_hue_brightness', JSON.stringify(value));
    }
    
    play() {
        this.setState((prevState) => {
            this.actionBtn.className = (prevState.playing) ? 'ion-play' : 'ion-stop';
            return {
                playing: !prevState.playing
            }
        });
    }
    setLights(lights) {
        this.setState({lights: lights});
        Hue.setLights(lights);
    }
    setHueValues(min, max) {
        this.setState((prevState) => {
            Hue.setHueValues(min, max);
            return {
                minHue: min,
                maxHue: max
            }
        })
    }

    setLightStatus(index, status) {
        this.setState((prevState) => {
            let lights = prevState.lights;
            lights[index].active = status;
            Hue.setLights(lights);
            return {
                lights: lights
            }
        });
    }

    render() {
        return <MuiThemeProvider muiTheme={muiTheme}>
        <Tabs>
            <Tab label="Disco controls">
                <div class="tab-content">
                    <ul className="settings">
                        <li>
                            <span className="setting-icon-container">
                                <i class="material-icons">mic</i></span>
                            <span>
                            <Slider defaultValue={this.state.volSens} min={0} max={60} onChange={this.micHandler}/>
                                {/* <Slider defaultValue={this.state.volSens} min={0} max={60} onChange={this.micHandler}/> */}
                            </span>
                        </li>
                        <li>
                            <span className="setting-icon-container">
                                <i class="material-icons">invert_colors</i>
                                <div class="setting-label">Color</div>
                            </span>
                            <span>
                                <Slider defaultValue={this.state.saturation} min={0} max={255} onChange={this.saturationHandler}/>
                            </span>
                        </li>
                        <li>
                            <span className="setting-icon-container">
                                <i class="material-icons">brightness_high</i>
                                <div class="setting-label">Brightness</div>
                            </span>
                            <span>
                                <Range defaultValue={this.state.brightness} onChange={this.brightnessHandler}/>
                                {/* <Slider defaultValue={this.state.brightness} min={0} max={100} onChange={this.brightnessHandler}/> */}
                            </span>
                        </li>
                        <li className="no-select">
                            <span className="setting-icon-container no-select">
                                <i class="material-icons">color_lens</i></span>
                            <span className="no-select">
                               <ColorPicker setHueValues={this.setHueValues}/>
                            </span>
                        </li>
                    </ul>
                    <div className="controls">
                        <StrobeButton/>
                        <button className="action-btn start-stop-btn" onClick={this.play}>
                            <i ref={(icon) => {this.actionBtn = icon;}} class="ion-play"></i>
                        </button>
                    </div>
                    <div className="visualization">
                        <canvas className="visualize" width={600} height="100"></canvas>
                    </div>
                </div>
            </Tab>
            <Tab label="Lights">
                <div className="bridge-lights tab-content">
                    <Button lights={this.state.lights} setLights={this.setLights} setLightStatus={this.setLightStatus}/>
                </div>
            </Tab>
        </Tabs>
    </MuiThemeProvider>;
    }
}

ReactDOM.render(<App />, document.getElementById('app'));