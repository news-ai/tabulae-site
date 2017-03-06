import React from 'react';
import {connect} from 'react-redux';
import FontIcon from 'material-ui/FontIcon';
import {grey100, grey400, grey800, blue200, blue400} from 'material-ui/styles/colors';

import alertify from 'alertifyjs';

const SpanButton = props => {
  return (
    <span
    onClick={props.onClick}
    style={{backgroundColor: props.size === props.scale ? grey100 : 'white'}}
    className='span-button pointer'>
    {props.text}
    </span>);
};

const ToolBar = props => {
  const setLink = _ => alertify.prompt(
    '',
    'Enter a URL',
    'http://',
    (e, url) => props.setLink(url),
    _ => {}
    );
  return (
    <div
    className='vertical-center'
    style={{
      backgroundColor: 'white',
      position: 'absolute',
      bottom: 3,
      lef: 3,
      padding: '2px 3px',
      border: `solid 1px ${grey400}`,
      borderRadius: '5px',
    }}
    >
      <SpanButton onClick={_ => props.setImageSize(0.25)} size={props.size} scale={0.25} text='25%'/>
      <SpanButton onClick={_ => props.setImageSize(0.5)} size={props.size} scale={0.5} text='50%'/>
      <SpanButton onClick={_ => props.setImageSize(0.75)} size={props.size} scale={0.75} text='75%'/>
      <SpanButton onClick={_ => props.setImageSize(1)} size={props.size} scale={1} text='100%'/>
      <FontIcon
      color={props.imageLink ? blue400 : grey800}
      hoverColor={props.imageLink ? blue200 : grey400}
      onClick={props.imageLink ? props.unsetLink : setLink}
      style={{fontSize: '14px'}}
      className='fa fa-link span-button pointer'
      />
    </div>
    );
};
const mapStateToProps = (state, props) => {
  return {
    image: state.emailImageReducer[props.src],
    size: state.emailImageReducer[props.src].size,
    entityKey: state.emailImageReducer[props.src].entityKey,
    imageLink: state.emailImageReducer[props.src].imageLink
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    setImageSize: (size) => dispatch({type: 'SET_IMAGE_SIZE', size, src: props.src}),
    setLink: imageLink => dispatch({type: 'SET_IMAGE_LINK', imageLink, src: props.src}),
    unsetLink: _ => dispatch({type: 'UNSET_IMAGE_LINK', src: props.src})
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ToolBar);
