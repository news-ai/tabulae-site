import React, {Component} from 'react';
import {connect} from 'react-redux';
import ToolBar from './ToolBar.react';

import './Image.css';

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
    if (props.align) {
      style = Object.assign({}, style, {textAlign: props.align});
    }
    const imgNode = this.refs[props.src];
    const img = <img ref={props.src} src={props.src} style={{maxWidth: props.size, maxHeight: props.size}}/>;
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

// const mapStateToProps = (state, props) => {
//   return {
//     // image: state.emailImageReducer[props.src],
//     // size: state.emailImageReducer[props.src].size,
//     // entityKey: state.emailImageReducer[props.src].entityKey,
//     // imageLink: state.emailImageReducer[props.src].imageLink,
//     // align: state.emailImageReducer[props.src].align
//   };
// };

// export default connect(mapStateToProps)(ImageContainer);
export default ImageContainer;
