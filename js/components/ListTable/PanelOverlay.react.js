import React from 'react';
import {connect} from 'react-redux';
import withRouter from 'react-router/lib/withRouter';
import MixedFeed from '../ContactProfile/MixedFeed/MixedFeed.react';
import IconButton from 'material-ui/IconButton';
import {grey500, grey300, lightBlue300} from 'material-ui/styles/colors';

const titleStyleHeight = 30;

const styles = {
  smallIcon: {
    width: 15,
    height: 15,
    fontSize: '15px',
    color: grey300
  },
  small: {
    width: 30,
    height: 30,
    padding: 7,
    margin: '0 10px'
  },
};

const PanelOverlay = ({
  router,
  contact,
  profileY,
  profileX,
  onMouseEnter,
  onMouseLeave,
  contactId,
  listId,
}) => {
  return (
      <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        top: profileY,
        left: profileX + 8,
        zIndex: 200,
        width: 510,
        height: 305 + titleStyleHeight,
        border: `1px solid ${grey300}`,
        borderRadius: '0.2em',
        position: 'fixed',
        backgroundColor: 'white',
        boxShadow: `0 0 30px -10px ${grey500}`
      }}>
        <div className='vertical-center' style={{margin: '0 15px', height: titleStyleHeight, borderBottom: `1px dotted ${lightBlue300}`, padding: '0 10px'}}>
          <span>{`${contact.firstname} ${contact.lastname}`}</span>
          <IconButton
          onClick={_ => router.push(`/tables/${listId}/${contactId}`)}
          tooltip='goto Profile'
          tooltipPosition='top-right'
          iconClassName='fa fa-arrow-right'
          iconStyle={styles.smallIcon}
          style={styles.small} />
        </div>
        <MixedFeed
        containerWidth={500}
        containerHeight={300}
        contactId={contactId}
        listId={listId}
        hideLoadMore
        />
      </div>);
};

const mapStateToProps = (state, props) => {
  return {
    contact: state.contactReducer[props.contactId],
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(PanelOverlay));
