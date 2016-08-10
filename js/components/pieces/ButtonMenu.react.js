import React, { Component } from 'react';

class ButtonMenu extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const offset = 15;
    return (
      <div style={{
        position: 'fixed',
        zIndex: 150,
        right: 30,
      }}>
      { this.props.children.map( (child, i) =>
        <div key={i} style={{
          top: i * offset,
          margin: '5px'
        }}>{child}</div>
      )}
      </div>
    );
  }
}

export default ButtonMenu;
