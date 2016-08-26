import React, { Component } from 'react';

const defaultStyle = {
  position: 'fixed'
};

class ButtonMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  render() {
    const offset = 15;
    const styles = this.props.style ? {...defaultStyle, ...this.props.style} : defaultStyle;
    return (
      <div style={styles}>
      <div>
        <button
        className='button menubutton'
        style={{
          backgroundColor: this.state.isOpen ? 'lightgray' : 'white'
        }}
        onClick={ _ => this.setState({ isOpen: !this.state.isOpen })}>Utilities</button>
      </div>
      {
        this.state.isOpen ?
        this.props.children.map( (child, i) =>
        <div key={i} style={{
          top: i * offset,
        }}>{child}</div>) : null
      }
      </div>
    );
  }
}

export default ButtonMenu;
