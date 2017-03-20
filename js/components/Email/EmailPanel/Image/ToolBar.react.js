import React, {Component} from 'react';
import {connect} from 'react-redux';
import FontIcon from 'material-ui/FontIcon';
import {grey100, grey400, grey800, blue200, blue400} from 'material-ui/styles/colors';
import Slider from 'rc-slider';

import alertify from 'alertifyjs';
import 'rc-slider/assets/index.css';

const SpanButton = props => {
  return (
    <span
    onClick={props.onClick}
    style={{backgroundColor: props.size === props.scale ? grey100 : 'white'}}
    className='span-button pointer'>
    {props.text}
    </span>);
};

class ToolBar extends Component {
  constructor(props) {
    super(props);
    this.state = {sliderValue: props.size || 1};
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div
      className='vertical-center'
      style={{
        backgroundColor: 'white',
        position: 'fixed',
        top: props.top || 3,
        left: props.left || 3,
        padding: '2px 3px',
        border: `solid 1px ${grey400}`,
        borderRadius: '5px',
      }}
      >
        {props.diableToolbar ?
          <span style={{fontSize: '0.8em', color: grey800}}>Image Toolbar disabled at Preview.</span> :
          <div className='vertical-center'>
          <span style={{fontSize: '0.8em', width: 30}}>{`${(state.sliderValue * 100).toFixed()}%`}</span>
          <Slider
          min={0} max={1} step={0.01}
          style={{width: 70, margin: '0 5px'}}
          onChange={sliderValue => this.setState({sliderValue})}
          onAfterChange={_ => props.setImageSize(state.sliderValue)}
          value={state.sliderValue}
          />
          <FontIcon
          color={props.imageLink ? blue400 : grey800}
          hoverColor={props.imageLink ? blue200 : grey400}
          onClick={props.imageLink ? props.unsetLink : props.setLink}
          style={{fontSize: '14px', margin: '0 2px'}}
          className='fa fa-link span-button pointer'
          />
        </div>}
        <FontIcon
        color={props.align === 'left' ? blue400 : grey800}
        hoverColor={props.align === 'left' ? blue200 : grey400}
        onClick={_ => props.setImageAlignment('left')}
        style={{fontSize: '14px'}}
        className='fa fa-align-left span-button pointer'
        />
        <FontIcon
        color={props.align === 'center' ? blue400 : grey800}
        hoverColor={props.align === 'center' ? blue200 : grey400}
        onClick={_ => props.setImageAlignment('center')}
        style={{fontSize: '14px'}}
        className='fa fa-align-center span-button pointer'
        />
        <FontIcon
        color={props.align === 'right' ? blue400 : grey800}
        hoverColor={props.align === 'right' ? blue200 : grey400}
        onClick={_ => props.setImageAlignment('right')}
        style={{fontSize: '14px'}}
        className='fa fa-align-right span-button pointer'
        />
      </div>
      );
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

const mapDispatchToProps = (dispatch, props) => {
  return {
    setImageSize: (size) => dispatch({type: 'SET_IMAGE_SIZE', size, src: props.src}),
    setLink: _ => {
      alertify.prompt(
      '',
      'Enter a URL',
      'http://',
      (e, url) => dispatch({type: 'SET_IMAGE_LINK', imageLink: url, src: props.src}),
      _ => {}
      );
    },
    unsetLink: _ => dispatch({type: 'UNSET_IMAGE_LINK', src: props.src}),
    setImageAlignment: align => dispatch({type: 'SET_IMAGE_ALIGN', align, src: props.src}),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ToolBar);
