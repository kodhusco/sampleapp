import React from 'react';

import $ from 'jquery';
window.$ = $;
import './Hue';

class StrobeButton extends React.Component {
    constructor(props) {
        super();
        this.state =  {
            on: false
        };
        this.strobe = this.strobe.bind(this);
    }

    strobe() {
        if (this.state.on) {

            Hue.stopStrobe();
            this.icon.classList.remove('ion-stop');
            this.icon.classList.add('ion-flash');
        } else {
            console.log(Hue.numberOfLamps);
            Hue.startStrobe();
            this.icon.classList.add('ion-stop');
            this.icon.classList.remove('ion-flash');
        }
        this.setState((prev) => {
            return {
                on: !prev.on
            }
        });
    }

    render() {
       return (<div>
            <button className="action-btn strobe-btn" onClick={this.strobe}>
                <i ref={(icon) => {this.icon = icon;}} className="ion-flash"></i>
            </button>
        </div>);
    }
}

export default StrobeButton;