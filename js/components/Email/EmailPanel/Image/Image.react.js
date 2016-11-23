import React, {Component} from 'react';
import {connect} from 'react-redux';
import FontIcon from 'material-ui/FontIcon';
import {grey50} from 'material-ui/styles/colors';
import './Image.css';

const SpanButton = props => {
  return (
    <span
    onClick={props.onClick}
    style={{backgroundColor: props.size === props.scale ? grey50 : 'white'}}
    className='span-button pointer'>
    {props.text}
    </span>);
};

const Image = ({size, src}) => {
  const pSize = ~~(size * 100);
  return <img src={src} style={{maxWidth: `${pSize}%`, maxHeight: `${pSize}%`}}/>;
};

class ImageContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      hover: false
    };
    this.onFocus = this.onFocus.bind(this);
  }

  onFocus() {
    this.setState({open: true});
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div
      onMouseEnter={this.onFocus}
      onMouseLeave={_ => this.setState({open: false})}
      style={{position: 'relative'}}>
        <Image src={props.src} size={props.size}/>
        {state.open &&
          <div
          className='vertical-center'
          style={{
            backgroundColor: 'white',
            position: 'absolute',
            bottom: 3,
            lef: 3,
            padding: 2
          }}
          >
            <SpanButton onClick={_ => props.setImageSize(0.25)} size={props.size} scale={0.25} text='25%'/>
            <SpanButton onClick={_ => props.setImageSize(0.5)} size={props.size} scale={0.5} text='50%'/>
            <SpanButton onClick={_ => props.setImageSize(0.75)} size={props.size} scale={0.75} text='75%'/>
            <SpanButton onClick={_ => props.setImageSize(1)} size={props.size} scale={1} text='100%'/>
            <FontIcon style={{fontSize: '14px'}} className='fa fa-link span-button pointer'/>
          </div>
        }
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  return {
    image: state.emailImageReducer[props.src],
    size: state.emailImageReducer[props.src].size
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    setImageSize: size => dispatch({type: 'SET_IMAGE_SIZE', size, src: props.src})
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ImageContainer);
