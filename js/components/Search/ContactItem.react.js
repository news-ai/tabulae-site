import React from 'react';
import {connect} from 'react-redux';
import Link from 'react-router/lib/Link';
import IconButton from 'material-ui/IconButton';
import {contactPropTypes} from '../../constants/CommonPropTypes';
import {grey50} from 'material-ui/styles/colors';
import withRouter from 'react-router/lib/withRouter';

const smallSpan = {
  fontSize: '0.8em',
  fontColor: 'gray'
};

const ContactItem = ({email, firstname, lastname, listname, listid, rowNum, query, id, router}) => {
  return (
    <div className='row horizontal-center'>
      <div className='large-10 columns' style={{
        paddingLeft: '15px',
        paddingRight: '15px',
        paddingTop: '5px',
        paddingBottom: '5px',
        borderRadius: '1.2em',
        backgroundColor: grey50
      }}>
        <div className='row'>
        <div className='large-10 columns'>
          <div><span>{firstname} {lastname}</span></div>
          <div><span>{email}</span></div>
          <span style={smallSpan}>belongs in</span>
          <Link to={`/lists/${listid}`}><span style={{marginLeft: '5px'}}>{listname}</span></Link>
        </div>
        <div className='large-2 columns vertical-center'>
          {listid ? <IconButton
            tooltip='Go to Profile'
            tooltipPosition='top-right'
            iconClassName='fa fa-user'
            onClick={_ => router.push(`/lists/${listid}/${id}`)}
            /> : null}
          {rowNum ? <IconButton
            tooltip='Go to Search Results in List'
            tooltipPosition='top-right'
            iconClassName='fa fa-list-alt'
            onClick={_ => router.push(`/lists/${listid}?search=${query}`)}
            /> : null}
        </div>
        </div>
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
  )(withRouter(ContactItem));
