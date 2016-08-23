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
        right: 30,
        textAlign: 'center'
      }}>
      <button
      className='button menubutton'
      style={ this.state.isOpen ? {
        backgroundColor: 'lightgray',
      } : {
        backgroundColor: 'white',
      }}
      onClick={ _ => this.setState({ isOpen: !this.state.isOpen })}>Utilities</button>
      {
        this.state.isOpen ? this.props.children.map( (child, i) =>
        <div key={i} style={{
          top: i * offset,
          margin: '5px'
        }}>{child}</div>) : null
      }
      </div>
    );
  }
}

export default ButtonMenu;
