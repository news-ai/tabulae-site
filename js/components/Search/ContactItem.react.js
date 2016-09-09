import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {contactPropTypes} from '../../constants/CommonPropTypes';
import * as actions from './actions';

const smallSpan = {
  fontSize: '0.8em',
  fontColor: 'gray'
};
const ContactItem = ({firstname, lastname, listname, listid}) => {
  console.log(listname);
  return (
    <div>
      <div>{firstname} {lastname}</div>
      <div>
        <span style={smallSpan}>belongs in</span>
          <Link to={`/lists/${listid}`}><span style={{marginLeft: '5px'}}>{listname}</span></Link>
      </div>
    </div>);
};

ContactItem.PropTypes = contactPropTypes;

const mapStateToProps = (state, props) => {
  const listReducer = state.listReducer;
  return {
    listname: listReducer[props.listid] ? listReducer[props.listid].name : props.listid
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(ContactItem);
