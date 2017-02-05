import React, {Component} from 'react';
import CountViewItem from './CountViewItem.react';
import Link from 'react-router/lib/Link';
import Dialog from 'material-ui/Dialog';
import StaticEmailContent from '../PreviewEmails/StaticEmailContent.react';
import LinkAnalyticsHOC from './LinkAnalyticsHOC.react';
import OpenAnalyticsHOC from './OpenAnalyticsHOC.react';
import {
  deepOrange100, deepOrange700, deepOrange900,
  grey400, grey600, grey800
} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';
import {connect} from 'react-redux';
import {actions as stagingActions} from 'components/Email';
import {actions as attachmentActions} from 'components/Email/EmailAttachment';
import Paper from 'material-ui/Paper';

import moment from 'moment-timezone';

const FORMAT = 'ddd, MMM Do Y, hh:mm A';

const styles = {
  analytics: {
    display: 'flex',
    alignItems: 'center'
  },
  wrapper: {
    padding: 12,
    margin: 5,
    marginBottom: 10,
  },
  to: {
    color: 'gray',
    fontSize: '0.8em',
    alignSelf: 'flex-start',
    marginRight: 5
  },
  errorText: {
    color: deepOrange700,
    float: 'right'
  },
  subjectText: {
    fontWeight: 500,
    color: grey800
  },
  sentFrom: {
    color: 'gray',
    fontSize: '0.8em',
  }
};

const DEFAULT_DATESTRING = '0001-01-01T00:00:00Z';


class AnalyticsItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPreviewOpen: false,
    };
    this.onPreviewOpen = this._onPreviewOpen.bind(this);
  }

  _onPreviewOpen() {
    this.props.fetchAttachments();
    this.setState({isPreviewOpen: true});
  }

  render() {
    const {
      id,
      opened,
      clicked,
      to,
      subject,
      bounced,
      bouncedreason,
      delivered,
      listid,
      listname,
      updated,
      attachments,
      sendat,
      created,
      cc,
      bcc,
      archiveEmail,
      archived
    } = this.props;
    const state = this.state;
    const wrapperStyle = (bounced || !delivered) ? Object.assign({}, styles.wrapper, {backgroundColor: deepOrange100}) : styles.wrapper;
    const SUBTRING_LIMIT = 20;
    let sendAtDate = moment(sendat);
    const sendAtDatestring = sendat === DEFAULT_DATESTRING ? 'IMMEDIATE' : sendAtDate.tz(moment.tz.guess()).format(FORMAT);
    let createdDate = moment(created);
    return (
      <Paper zDepth={1} className='clearfix' style={wrapperStyle}>
        <div className='row'>
          <div className='small-12 medium-6 large-6 columns'>
          {listid !== 0 &&
            <div>
              <span style={styles.sentFrom}>Sent from List</span>
              <span style={{margin: '0 5px', fontSize: '0.9em'}}><Link to={`/tables/${listid}`}>{listname || listid}</Link></span>
              {attachments !== null && <FontIcon style={{fontSize: '0.8em', margin: '0 3px'}} className='fa fa-paperclip'/>}
              {!archived && <FontIcon
              className='pointer fa fa-trash'
              style={{fontSize: '16px'}}
              color={grey400}
              hoverColor={grey600}
              onClick={archiveEmail}
              />}
            </div>}
          </div>
          <div className='small-12 medium-6 large-6 columns'>
            <span style={{marginRight: 10, fontSize: '0.9em', float: 'right', color: 'gray'}}><strong>Created at:</strong> {createdDate.tz(moment.tz.guess()).format(FORMAT)}</span>
          </div>
          <div className='small-12 medium-12 large-12 columns'>
            <span style={{marginRight: 10, fontSize: '0.9em', float: 'right', color: 'gray'}}><strong>Send at:</strong> {sendAtDatestring}</span>
          </div>
        </div>
        <Dialog
        open={this.state.isPreviewOpen}
        onRequestClose={_ => this.setState({isPreviewOpen: false})}
        autoScrollBodyContent
        >
          <StaticEmailContent {...this.props} />
        </Dialog>
        <div className='email-analytics row' style={styles.analytics}>
          <div className='small-12 medium-3 large-3 columns'>
            <span style={styles.to}>To</span>
            <span style={{fontSize: '0.9em', color: (bounced || !delivered) ? deepOrange900 : grey800}}>{to.substring(0, SUBTRING_LIMIT)} {to.length > SUBTRING_LIMIT && `...`}</span>
          </div>
          <div className='small-12 medium-5 large-5 columns' style={{margin: '15px 0'}}>
            <span className='pointer' onClick={this.onPreviewOpen} style={styles.subjectText}>{subject.substring(0, 45)} {subject.length > 42 && `...`}</span>
          {subject.length === 0 &&
            <span className='pointer' onClick={this.onPreviewOpen} style={styles.subjectText}>(No Subject)</span>}
          {!delivered &&
            <div style={styles.errorText}>
              <span>Something went wrong on our end. Let us know!</span>
              <p>Email ID: {id}</p>
            </div>}
          {bounced &&
            <span style={styles.errorText}>email bounced</span>}
          {bouncedreason &&
            <p style={{color: deepOrange900}}>{bouncedreason}</p>}
          </div>
          <div className='small-12 medium-2 large-2 columns horizontal-center' style={{padding: 3}}>
          {(!bounced && delivered) &&
            <OpenAnalyticsHOC emailId={id} count={opened}>
            {({onRequestOpen}) => (
              <CountViewItem onTouchTap={onRequestOpen} label='Opened' count={opened} iconName='fa fa-paper-plane-o'/>)}
            </OpenAnalyticsHOC>}
          </div>
          <div className='small-12 medium-2 large-2 columns horizontal-center' style={{padding: 3}}>
          {(!bounced && delivered) &&
            <LinkAnalyticsHOC emailId={id} count={clicked}>
            {({onRequestOpen}) => (
              <CountViewItem onTouchTap={onRequestOpen} label='Clicked' count={clicked} iconName='fa fa-hand-pointer-o'/>)}
            </LinkAnalyticsHOC>}
          </div>
        </div>
      </Paper>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    listname: state.listReducer[props.listid] ? state.listReducer[props.listid].name : undefined
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchAttachments: _ => props.attachments !== null && props.attachments.map(id => dispatch(attachmentActions.fetchAttachment(id))),
    archiveEmail: _ => dispatch(stagingActions.archiveEmail(props.id))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AnalyticsItem);
