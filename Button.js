import React from 'react';
import Toggle from 'material-ui/Toggle';
import $ from 'jquery';
window.$ = $;

import './hue';

const styles = {
    block: {
      maxWidth: 250,
    },
    toggle: {
      marginBottom: 16,
    },
    thumbOff: {
      backgroundColor: '#ffcccc',
    },
    trackOff: {
      backgroundColor: '#ff9d9d',
    },
    thumbSwitched: {
      backgroundColor: 'red',
    },
    trackSwitched: {
      backgroundColor: '#ff9d9d',
    },
    labelStyle: {
      color: 'red',
    },
  };

class Button extends React.Component {
    constructor(props) {
        super();
        this.props = props;
        this.state = {
            lights: [],
            showBridge: true
        };
        this.connect = this.connect.bind(this);
        this.connect();
    }
    init() {
        Hue.getLights().then((lights) => {
            this.setState({showBridge: false});
            let lightsObj = [];
            for (const index in lights) {
                lightsObj.push({name: lights[index].name, index: index, active: true});
            }
            this.props.setLights(lightsObj);
        });
    }

    connect() {
        Hue.getBridgeAddress()
    .then(() => {
        return Hue.authenticate()
    })
    .then(() => {
        this.init();
    })
    .catch(() => {
       if (confirm('Press Bridge button to authenticate')) {
           Hue.authenticate()
               .then(() => {
                    this.init();
               })
               .catch((reason) => {
                   console.log(reason);
               })
       } else {
           console.log('You canceled authenticating, restart the app');
       }
    }); 
    }

    lightToggle(index, isInputChecked) {
        this.props.setLightStatus(index - 1, isInputChecked);
    }

    render() {
        return (
            <div>
                {this.state.showBridge && <div className="bridge-button" onClick={this.connect}>
                    <img src="images/bridge_v2.png" />
                </div>
                }
                <ul className="lights">
                    {this.props.lights.map(light => 
                    <li key={light.index}> 
                        <Toggle
                            label={light.name}
                            defaultToggled={true}
                            onToggle={(e, status) =>this.lightToggle(light.index, status)}
                            style={styles.toggle}
                        />
                    </li>
                    )}
                </ul>
            </div>  
        )
    }
}

export default Button;

    