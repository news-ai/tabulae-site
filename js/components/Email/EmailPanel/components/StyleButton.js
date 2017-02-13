import React from 'react';
import {blueA400, blue200, grey400, grey800} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';

const buttonStyle = {marginRight: 10};

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
    let renderNode;
    let color = props.active ? blueA400 : grey800;
    let hoverColor = props.active ? blue200 : grey400;
    let onClick = this.onToggle;
    let pointerClassName = 'pointer';
    if (props.disabled) {
      color = grey400;
      onClick = undefined;
      pointerClassName = 'not-allowed';
    }

    if (props.icon) {
      renderNode = (
        <FontIcon
        style={{marginRight: 10, fontSize: '14px'}}
        className={`${props.icon} ${pointerClassName}`}
        color={color}
        hoverColor={hoverColor}
        onClick={onClick}
        />);
    } else {
      renderNode = (
        <span className={pointerClassName} style={buttonStyle} onMouseDown={onClick}>
          {props.label}
        </span>);
    }

    return <div>{renderNode}</div>;
  }
}
