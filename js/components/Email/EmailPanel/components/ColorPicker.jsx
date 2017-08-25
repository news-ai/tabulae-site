import React, { Component } from 'react';
import {SketchPicker} from 'react-color';
import styled from 'styled-components';
import Popover from 'material-ui/Popover';

const Color = styled.div`
  width: 36px;
  height: 14px;
  border-radius: 2px;
  background: ${props.color ? props.color : 'black'};
`;

const Swatch = styled.div`
  padding: 5px;
  background-color: #ffffff;
  border-radius: 1px;
  box-shadow: 0 0 0 1px rgba(0,0,0,.1);
  display: inline-block;
  cursor: pointer;
`;

class ColorPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      anchorEl: null
    };
    this.handleTouchTap = (event) => {
      event.preventDefault();
      this.setState({
        open: true,
        anchorEl: event.currentTarget,
      });
    };
    this.handleRequestClose = e => this.setState({open: false});
    this.onChange = color => this.props.onToggle(color.hex);
  }

  render() {
    const currentStyle = this.props.editorState.getCurrentInlineStyle();
    console.log(currentStyle.values());
    const color = 'black';
    return (
      <div className='RichEditor-controls' style={{display: 'flex'}}>
        <Swatch onClick={this.handleTouchTap} >
          <Color />
        </Swatch>
        <Popover
        open={this.state.open}
        anchorEl={this.state.anchorEl}
        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
        onRequestClose={this.handleRequestClose}
        >
          <SketchPicker color={color} onChange={this.onChange} />
        </Popover>
      </div>
    );
  }
}

export default ColorPicker;
