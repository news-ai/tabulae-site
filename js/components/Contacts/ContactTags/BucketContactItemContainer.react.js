import React, {Component} from 'react';
import {connect} from 'react-redux';
import Link from 'react-router/lib/Link';
import FontIcon from 'material-ui/FontIcon';
import ContactItemContainer from '../ContactFeed/ContactItemContainer.react';
import {blue500, grey100, grey300, grey400, grey500, grey600} from 'material-ui/styles/colors';
import Paper from 'material-ui/Paper';

const defaultPaperStyle = {
  padding: '0 5px',
};

class BucketContactItemContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hover: false
    };
  }

  render() {
    const props = this.props;
    const state = this.state;
    const paperStyle = state.hover ? Object.assign({}, defaultPaperStyle, {backgroundColor: grey100}) : defaultPaperStyle;
    const checked = props.selected.some(id => id === props.id);

    return props.currentSelected === props.id ?
    <div style={{margin: '2px 0'}} >
      <ContactItemContainer checked={checked} {...props} />
    </div>
     : (
      <Paper
      zDepth={1}
      className='pointer row'
      onMouseOver={e => this.setState({hover: true})}
      onMouseOut={e => this.setState({hover: false})}
      onClick={e => {
        this.setState({hover: false});
        props.onSwitch(props.id);
      }}
      style={paperStyle}
      >
        <div className='large-1 medium-1 small-1 columns'>
          <FontIcon style={{fontSize: '0.9em'}} color={checked ? blue500 : grey300} className='fa fa-check'/>
        </div>
        <div className='large-9 medium-9 small-8 columns'>
        {props.list &&
          <span style={{color: grey600}} className='smalltext'>List: {props.list.name}</span>}
        </div>
        <div className='large-2 medium-2 small-3 columns'>
        {state.hover &&
          <span style={{color: grey600}} className='smalltext'>Expand +</span>}
        </div>
      </Paper>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    list: state.listReducer[props.listid],
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(BucketContactItemContainer);
