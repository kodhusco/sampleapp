import React from 'react';
import $ from 'jquery';

class ColorPicker extends React.Component {

    constructor(props) {
        super();
        this.mouseMove = this.mouseMove.bind(this);
    }
    
    generatePallete(hGrad) {
        hGrad.addColorStop(0 / 6, '#F00');
        hGrad.addColorStop(1 / 6, '#FF0');
        hGrad.addColorStop(2 / 6, '#0F0');
        hGrad.addColorStop(3 / 6, '#0FF');
        hGrad.addColorStop(4 / 6, '#00F');
        hGrad.addColorStop(5 / 6, '#F0F');
        hGrad.addColorStop(6 / 6, '#F00');
    }
    componentDidMount() {

        var ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        var hGrad = ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        this.generatePallete(hGrad);

        ctx.fillStyle = hGrad;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        

        let slider1Active = false;
        $(this.slider1).mousedown((e) => {
            slider1Active = true;
        });
        $(document).mouseup((e) => {
            slider1Active = false;
            slider2Active = false;
        });
        
        let slider2Active = false;
        $(this.slider2).mousedown((e) => {
            slider2Active = true;
        });

        let percentageSlider1 = localStorage.getItem('disco_hue_leftSlider') || 0;
        let percentageSlider2 = localStorage.getItem('disco_hue_rightSlider') || 1;

        this.slider1.style.left =  (percentageSlider1 * $('.color-picker-container').width() - 8) + 'px';
        this.slider2.style.left =  (percentageSlider2 * $('.color-picker-container').width() - 8) + 'px';

        let left = $(this.slider1).offset().left;
        let slider1Left = $('.color-picker-container').offset().left;;
        let slider2Left = $('.color-picker-container').width();
        let secondSliderLeft =  $('.color-picker-container').offset().left;
        document.addEventListener('mousemove', (e) => {
            if (slider1Active) {
                left = e.clientX - slider1Left;
                document.getElementById('app').style.cursor = 'pointer';
                if (left > 0 && left < $('.color-picker-container').width() - 6) {
                    this.slider1.style.left =  (left - 8) + 'px';
                    percentageSlider1 = left/$('.color-picker-container').width();
                    localStorage.setItem('disco_hue_leftSlider', percentageSlider1);
                    left = (left < 0) ? 0 : left;
                    this.props.setHueValues(Math.floor(65280 * (left/$('.color-picker-container').width())),
                                           Math.floor(65280 * (slider2Left/$('.color-picker-container').width()))
                    );
                }
            } else if (slider2Active) {
                document.getElementById('app').style.cursor = 'pointer';
                slider2Left = e.clientX - secondSliderLeft;
                if (slider2Left > 0 && slider2Left < $('.color-picker-container').width() - 6) {
                    percentageSlider2 = slider2Left/$('.color-picker-container').width();
                    localStorage.setItem('disco_hue_rightSlider', percentageSlider2);
                    this.slider2.style.left =  (slider2Left - 7) + 'px';
                    left = (left < 0) ? 0 : left;
                    this.props.setHueValues(Math.floor(65280 * (left/$('.color-picker-container').width())),
                                            Math.floor(65280 * (slider2Left/$('.color-picker-container').width()))
                    );
                }
            } else {
                document.getElementById('app').style.cursor = 'default';
            }
        });
        $(window).resize(function(e) {
            this.slider1.style.left =  (percentageSlider1 * $('.color-picker-container').width() - 8) + 'px';
            this.slider2.style.left =  (percentageSlider2 * $('.color-picker-container').width() - 8) + 'px';
        }.bind(this))
        
    }
    mouseMove(e) {
        this.slider1.style.left = (e.clientX - 120) + 'px';
    }
    
    render() {
        const res = (
        <div className="color-picker-container no-select">
            <div ref={(slider) => {this.slider1 = slider;}} class="slider slider-1"></div>
            <canvas className="no-select" ref={(canvas) => {this.canvas = canvas;}} style={{width: '100%', height: '100%'}}></canvas>
            <div ref={(slider2) => {this.slider2 = slider2;}} class="slider slider-2"></div>
        </div>
        );
        return res;
    }
}

export default ColorPicker;