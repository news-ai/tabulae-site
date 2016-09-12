import React, { PropTypes } from 'react';
import CountViewItem from './CountViewItem.react';
import {Link} from 'react-router';
import {deepOrange100, deepOrange700, deepOrange900, grey50} from 'material-ui/styles/colors';

const styles = {
  analytics: {
    display: 'flex',
    alignItems: 'center'
  },
  wrapper: {
    width: '100%',
    padding: '5px',
    // border: '1px gray solid',
    borderRadius: '1.2em',
    margin: '5px',
    marginBottom: '10px',
    backgroundColor: grey50
  },
  to: {
    color: 'gray',
    fontSize: '0.8em',
    alignSelf: 'flex-start',
    marginRight: '5px'
  },
  errorText: {
    color: deepOrange700,
    float: 'right'
  },
  subjectText: {
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  sentFrom: {
    color: 'gray',
    fontSize: '0.8em',
  }
};


function AnalyticsItem({
  opened,
  clicked,
  to,
  subject,
  bounced,
  bouncedreason,
  delivered,
  onPreviewOpen,
  listid,
  listname,
  updated
}) {
  const wrapperStyle = (bounced || !delivered) ? Object.assign({}, styles.wrapper, {backgroundColor: deepOrange100}) : styles.wrapper;
  const SUBTRING_LIMIT = 18;
  const date = new Date(updated);
  return (
    <div style={wrapperStyle}>
      {
        listid !== 0 ? <div className='row'>
          <div className='large-4 columns'>
            <span style={styles.sentFrom}>Sent from List</span>
            <span style={{marginLeft: '10px'}}><Link to={`/lists/${listid}`}>{listname || listid}</Link></span>
          </div>
          <div className='large-5 columns'>
            <span style={{marginRight: '10px', fontSize: '0.9em', float: 'right', color: 'gray'}}>{date.toDateString()} {date.toTimeString()}</span>
          </div>
        </div> : null
      }
      <div className='email-analytics row' style={styles.analytics}>
        <div className='small-12 large-3 columns'>
          <span style={styles.to}>To</span>
          <span>{to.substring(0, SUBTRING_LIMIT)} {to.length > SUBTRING_LIMIT ? `...` : null}</span>
        </div>
        <div className='small-12 large-5 columns'>
          <span onClick={onPreviewOpen} style={styles.subjectText}>{subject.substring(0, 30)} {subject.length > 20 ? `...` : null}</span>
          {!delivered ? <span style={styles.errorText}>Something went wrong on our end. Let us know!</span> : null}
          {bounced ? <span style={styles.errorText}>email bounced</span> : null}
          {bouncedreason ? <p style={{color: deepOrange900}}>{bouncedreason}</p> : null}
        </div>
        <div className='small-12 large-2 columns'>
          {!bounced ? <CountViewItem label='Opened' count={opened} iconName='fa fa-paper-plane-o fa-lg' /> : null}
        </div>
        <div className='small-12 large-2 columns'>
          {!bounced ? <CountViewItem label='Clicked' count={clicked} iconName='fa fa-hand-pointer-o fa-lg'/> : null}
        </div>
      </div>
    </div>
    );
}

AnalyticsItem.PropTypes = {
  id: PropTypes.number.isRequired,
  listid: PropTypes.number.isRequired,
  to: PropTypes.string.isRequired,
  subject: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  onSendEmailClick: PropTypes.func,
  issent: PropTypes.bool.isRequired,
  bounced: PropTypes.bool.isRequired,
  bouncedreason: PropTypes.string,
  clicked: PropTypes.number,
  opened: PropTypes.number,
  delivered: PropTypes.bool,
  templateid: PropTypes.number,
  onPreviewOpen: PropTypes.func,
  listname: PropTypes.string
};

export default AnalyticsItem;
