import React, {Component} from 'react';

class Image extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
    this.onFocus = this.onFocus.bind(this);
  }

  onFocus() {
    this.setState({open: true});
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div style={{position: 'relative'}}>
        <img
        ref='img'
        onMouseOver={this.onFocus}
        onMouseLeave={_ => this.setState({open: false})}
        src={props.src}
        />
        {state.open && <div
          style={{
            width: 100,
            height: 30,
            backgroundColor: 'red',
            position: 'absolute',
            bottom: 0,
            right: 0
          }}
          />}
      </div>);
  }
}

export default Image;
