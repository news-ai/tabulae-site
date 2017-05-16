import React, {Component} from 'react';
import {connect} from 'react-redux';
import Link from 'react-router/lib/Link';
import ContactItemContainer from '../ContactFeed/ContactItemContainer.react';
import {grey100, grey400, grey600} from 'material-ui/styles/colors';
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

    return props.currentSelected === props.id ?
    <div style={{margin: '2px 0'}} >
      <ContactItemContainer checked={props.selected.some(id => id === props.id)} {...props} />
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
        <div className='large-10 medium-10 small-9 columns'>
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
