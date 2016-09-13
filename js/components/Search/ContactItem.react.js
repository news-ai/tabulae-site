import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {contactPropTypes} from '../../constants/CommonPropTypes';
import * as actions from './actions';
import {grey50} from 'material-ui/styles/colors';

const smallSpan = {
  fontSize: '0.8em',
  fontColor: 'gray'
};

const ContactItem = ({email, firstname, lastname, listname, listid, rowNum, query}) => {
  return (
    <div style={{
      paddingLeft: '15px',
      paddingRight: '15px',
      paddingTop: '5px',
      paddingBottom: '5px',
      borderRadius: '1.2em',
      backgroundColor: grey50
    }}>
      <div>{firstname} {lastname}</div>
      <div>{email}</div>
      {rowNum ? <Link to={`/lists/${listid}?search=${query}`} style={{float: 'right'}}><span>at Row {rowNum}</span></Link> : null}
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
