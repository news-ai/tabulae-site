import React, {Component} from 'react';
import {connect} from 'react-redux';
import ToolBar from './ToolBar.react';

import './Image.css';

const Image = ({size, src, imageLink, align}) => {
  const pSize = ~~(size * 100);
  let style = {maxWidth: `${pSize}%`, maxHeight: `${pSize}%`};
  // if (align === 'right' || align === 'center') {
  //   style = Object.assign({}, style, {float: align});
  // }
  const img = <img src={src} style={style}/>;
  return imageLink ? <a href={imageLink} target='_blank'>{img}</a> : img;
};

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
    let style = {position: 'relative'};
    // if (state.open) {
    //   style.border = '1px solid red';
    //   style.padding = 5;
    // }
    // if (props.align === 'center') {
    //   style = Object.assign({}, style, {textAlign: props.align});
    // }
    return (
      <div
      onMouseEnter={_ => this.setState({open: true})}
      onMouseLeave={_ => this.setState({open: false})}
      style={style}
      >
        {state.open && <ToolBar {...props}/>}
        <Image src={props.src} size={props.size} imageLink={props.imageLink} align={props.align}/>
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  return {
    image: state.emailImageReducer[props.src],
    size: state.emailImageReducer[props.src].size,
    entityKey: state.emailImageReducer[props.src].entityKey,
    imageLink: state.emailImageReducer[props.src].imageLink,
    align: state.emailImageReducer[props.src].align
  };
};

export default connect(mapStateToProps)(ImageContainer);
