import React, {Component} from 'react';
import {connect} from 'react-redux';
import Link from 'react-router/lib/Link';
import ContactItemContainer from '../ContactFeed/ContactItemContainer.react';

class BucketContactItemContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const props = this.props;
    const state = this.state;
    return props.currentSelected === props.id ?
    <ContactItemContainer {...props} />
     : (
      <div
      className='pointer'
      onClick={e => props.onSwitch(props.id)}
      style={{width: '100%', border: '1px solid black'}}
      >
      {props.list &&
        <Link to={`/tables/${props.list.id}`}>List: {props.list.name}</Link>}
      </div>
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
