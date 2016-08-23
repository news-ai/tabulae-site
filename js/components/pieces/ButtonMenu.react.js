import React, { Component } from 'react';

class ButtonMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true
    };
  }

  render() {
    const offset = 15;
    return (
      <div style={{
        position: 'fixed',
        zIndex: 150,
        right: 50,
      }}>
      <div
      style={{
        right: 0,
      }}>
        <button
        className='button menubutton'
        style={ this.state.isOpen ? {
          backgroundColor: 'lightgray',
        } : {
          backgroundColor: 'white',
        }}
        onClick={ _ => this.setState({ isOpen: !this.state.isOpen })}>Utilities</button>
      </div>
      {
        this.state.isOpen ?
        this.props.children.map( (child, i) =>
        <div key={i} style={{
          top: i * offset,
          right: 0
        }}>{child}</div>) : null
      }
      </div>
    );
  }
}

export default ButtonMenu;
