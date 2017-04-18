import React, {Component} from 'react';
import FontIcon from 'material-ui/FontIcon';
import {grey400, grey800, blue200, blue400} from 'material-ui/styles/colors';
import Slider from 'rc-slider';

import alertify from 'alertifyjs';
import 'rc-slider/assets/index.css';

class ToolBar extends Component {
  constructor(props) {
    super(props);
    this.state = {sliderValue: parseInt(props.size.slice(0, -1), 10) || 1};
  }

  render() {
    const props = this.props;
    const state = this.state;
    const setLink = _ => {
      alertify.prompt(
      '',
      'Enter a URL',
      'http://',
      (e, url) => props.onImageLinkChange(url),
      _ => {}
      );
    };
    const unsetLink = _ => props.onImageLinkChange('#');
    return (
      <div
      className='vertical-center'
      style={{
        backgroundColor: 'white',
        position: 'fixed',
        marginLeft: 0,
        marginTop: 0,
        // top: props.top || 3,
        // left: props.left || 3,
        // position: 'absolute',
        // top: 0,
        // left: 0,
        padding: '2px 3px',
        border: `solid 1px ${grey400}`,
        borderRadius: 5,
        zIndex: 500
      }}
      >
        {props.diableToolbar ?
          <span style={{fontSize: '0.8em', color: grey800}}>Image Toolbar disabled at Preview.</span> :
          <div className='vertical-center'>
            <span style={{fontSize: '0.8em', width: 30}}>{`${state.sliderValue}%`}</span>
            <Slider
            min={0} max={100} step={1}
            style={{width: 70, margin: '0 5px'}}
            onChange={sliderValue => this.setState({sliderValue})}
            onAfterChange={_ => props.onSizeChange(state.sliderValue)}
            value={state.sliderValue}
            />
            <FontIcon
            color={props.imageLink.length > 1 ? blue400 : grey800}
            hoverColor={props.imageLink.length > 1 ? blue200 : grey400}
            onClick={props.imageLink.length > 1 ? unsetLink : setLink}
            style={{fontSize: '14px', margin: '0 4px'}}
            className='fa fa-link span-button pointer'
            />
            <FontIcon
            color={props.align === 'left' ? blue400 : grey800}
            hoverColor={props.align === 'left' ? blue200 : grey400}
            onClick={_ => props.onImageAlignChange('left')}
            style={{fontSize: '14px', margin: '0 4px'}}
            className='fa fa-align-left span-button pointer'
            />
            <FontIcon
            color={props.align === 'center' ? blue400 : grey800}
            hoverColor={props.align === 'center' ? blue200 : grey400}
            onClick={_ => props.onImageAlignChange('center')}
            style={{fontSize: '14px', margin: '0 4px'}}
            className='fa fa-align-center span-button pointer'
            />
            <FontIcon
            color={props.align === 'right' ? blue400 : grey800}
            hoverColor={props.align === 'right' ? blue200 : grey400}
            onClick={_ => props.onImageAlignChange('right')}
            style={{fontSize: '14px', margin: '0 4px'}}
            className='fa fa-align-right span-button pointer'
            />
        </div>}
      </div>
      );
  }
}

export default ToolBar;
