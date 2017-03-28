import React, {Component} from 'react';
import ToolBar from './ToolBar.react';


// import './Image.css';

class ImageContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      hover: false,
      isDragging: false
    };
    this.startDrag = _ => {
      this.setState({isDragging: true});
    };
    this.endDrag = _ => {
      this.setState({isDragging: false});
    };
  }

  render() {
    const props = this.props;
    const state = this.state;
    let style = {
      position: 'relative',
      textAlign: props.align,
    };
    if (state.isDragging) {
      style.border = '1px solid red';
      style.padding = 5;
      style.cursor = 'move';
    }
    const imgNode = this.refs[props.src];
    const img = (
      <img
      ref={props.src}
      src={props.src}
      style={{
        // transform: `scale(${parseFloat(props.size) / 100.0})`,
        maxWidth: props.size,
        maxHeight: props.size
      }}
      />);
    return (
      <div
      contentEditable={false}
      onMouseEnter={_ => this.setState({open: true})}
      onMouseLeave={_ => !state.isDragging && this.setState({open: false})}
      onDragStart={props.onDragStart}
      onDragOver={e => e.preventDefault()}
      onDrop={props.onDragDrop}
      onDragEnd={props.onDragDrop}
      draggable={state.isDragging}
      style={style}
      >
      {state.open &&
        <ToolBar
        left={imgNode && imgNode.getBoundingClientRect().left}
        top={imgNode && imgNode.getBoundingClientRect().top}
        isDragging={state.isDragging}
        startDrag={this.startDrag}
        endDrag={this.endDrag}
        {...props}
        />}
      {/*props.imageLink !== '#' ? <a href={props.imageLink} target='_blank'>{img}</a> : img*/}
      {img}
      </div>);
  }
}

export default ImageContainer;
