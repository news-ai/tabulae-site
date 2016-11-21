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
    if (props.icon) {
      renderNode = (
        <FontIcon
        style={{marginRight: 10, fontSize: '14px'}}
        className={`${props.icon} pointer`}
        color={props.active ? blueA400 : grey800}
        hoverColor={props.active ? blue200 : grey400}
        onClick={this.onToggle}
        />);
    } else {
      renderNode = (
        <span style={buttonStyle} onMouseDown={this.onToggle}>
          {props.label}
        </span>);
    }

    return <div>{renderNode}</div>;
  }
}
