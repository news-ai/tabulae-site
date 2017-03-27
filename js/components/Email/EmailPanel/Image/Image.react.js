import React, {Component} from 'react';
import ToolBar from './ToolBar.react';


// import './Image.css';

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
    // if (state.open) {
    //   style.border = '1px solid red';
    //   style.padding = 5;
    // }
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
    // style.border = '1px solid red';
    return (
      <div
      onMouseEnter={_ => this.setState({open: true})}
      onMouseLeave={_ => this.setState({open: false})}
      style={style}
      >
      {state.open &&
        <ToolBar
        left={imgNode && imgNode.getBoundingClientRect().left}
        top={imgNode && imgNode.getBoundingClientRect().top}
        {...props}
        />}
      {props.imageLink ? <a href={props.imageLink} target='_blank'>{img}</a> : img}
      </div>);
  }
}

export default ImageContainer;
