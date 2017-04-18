import React, {Component} from 'react';
import ToolBar from './ToolBar.react';

class ImageContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      hover: false,
    };
    this.onDivClick = this._onDivClick.bind(this);
    this.setRef = div => this.div = div;
    this.onMouseEnter = _ => this.setState({open: true});
    this.onMouseLeave = _ => this.setState({open: false});
  }

  _onDivClick() {
    this.setState({open: !this.state.open});
  }

  render() {
    const props = this.props;
    const state = this.state;
    let style = {
      position: 'relative',
      textAlign: props.align,
    };
    const img = (
      <img
      ref={props.src}
      src={props.src}
      style={{
        maxWidth: props.size,
        maxHeight: props.size,
        cursor: 'move',
      }}
      />);

    return (
      <div
      ref={this.setRef}
      contentEditable={false}
      onMouseEnter={this.onMouseEnter}
      onMouseLeave={this.onMouseLeave}
      onDragStart={props.onDragStart}
      style={style}
      draggable
      >
      {state.open &&
        <ToolBar {...props}/>}
        {img}
      </div>);
  }
}

export default ImageContainer;
