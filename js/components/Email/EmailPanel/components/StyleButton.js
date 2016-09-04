import React from 'react';
import {blueA400} from 'material-ui/styles/colors';

export default class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    const props = this.props;
    
    const buttonStyle = {
      color: props.active ? blueA400 : 'black',
      cursor: 'pointer',
      marginRight: '10px'
    };
    let renderNode;
    if (props.icon) {
      renderNode = (
        <i
        style={buttonStyle}
        className={props.icon}
        onClick={this.onToggle}
        aria-hidden='true' />);
    } else {
      renderNode = (
        <span style={buttonStyle} onMouseDown={this.onToggle}>
          {props.label}
        </span>);
    }

    return <div>{renderNode}</div>;
  }
}
