import React, {Component} from 'react';
import {connect} from 'react-redux';

class PanelOverlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      x: 0,
      y: 0,
      onPanel: false
    };
  }

  render() {
    const state = this.state;
    console.log(state.show);
    console.log(state.y);
    return (
      <div>
      {state.show &&
        <div
        style={{
          top: state.y,
          left: state.x + 8,
          backgroundColor: 'red',
          width: 300,
          height: 300,
          position: 'fixed !important',
          zIndex: 1200,
        }}
        onMouseEnter={_ => this.setState({show: true})}
        onMouseLeave={_ => this.setState({show: false})}
        />}
      {this.props.children({
        onTargetMouseEnter: (x, y) => this.setState({show: true, x, y}),
        onTargetMouseLeave: () => setTimeout(_ => !state.onPanel ? this.setState({show: false}) : null, 500)
      })}
      </div>);
  }
}

export default PanelOverlay;
