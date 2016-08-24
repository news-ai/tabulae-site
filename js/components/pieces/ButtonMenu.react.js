import React, { Component } from 'react';

class ButtonMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  render() {
    const offset = 15;
    return (
      <div style={{
        position: 'fixed',
        zIndex: 150,
      }}>
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
