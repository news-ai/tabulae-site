import React, {Component} from 'react';
import ToolBar from './ToolBar.react';

class ImageContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      hover: false,
    };
  }

  render() {
    const props = this.props;
    const state = this.state;
    let style = {
      position: 'relative',
      textAlign: props.align,
    };
    const imgNode = this.refs[props.src];
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
      contentEditable={false}
      onMouseEnter={_ => this.setState({open: true})}
      onMouseLeave={_ => this.setState({open: false})}
      onDragStart={props.onDragStart}
      draggable
      style={style}
      >
      {state.open &&
        <ToolBar
        left={imgNode && imgNode.getBoundingClientRect().left}
        top={imgNode && imgNode.getBoundingClientRect().top}
        {...props}
        />}
      {img}
      </div>);
  }
}

export default ImageContainer;
