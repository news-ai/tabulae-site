import React, {Component} from 'react';
import {connect} from 'react-redux';
import ToolBar from './ToolBar.react';

import './Image.css';

const Image = ({size, src, imageLink}) => {
  const pSize = ~~(size * 100);
  const img = <img src={src} style={{maxWidth: `${pSize}%`, maxHeight: `${pSize}%`}}/>;
  return imageLink ? <a href={imageLink} target='_blank'>{img}</a> : img;
};

class ImageContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      hover: false
    };
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div
      onMouseEnter={_ => this.setState({open: true})}
      onMouseLeave={_ => this.setState({open: false})}
      style={{position: 'relative'}}
      >
        <Image src={props.src} size={props.size} imageLink={props.imageLink}/>
        {state.open && <ToolBar {...props}/>}
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  return {
    image: state.emailImageReducer[props.src],
    size: state.emailImageReducer[props.src].size,
    entityKey: state.emailImageReducer[props.src].entityKey,
    imageLink: state.emailImageReducer[props.src].imageLink,
  };
};

export default connect(mapStateToProps)(ImageContainer);
