import React, {PropTypes, Component} from 'react';
import CountViewItem from './CountViewItem.react';
import Link from 'react-router/lib/Link';
import Dialog from 'material-ui/Dialog';
import StaticEmailContent from '../PreviewEmails/StaticEmailContent.react';
import {
  deepOrange100,
  deepOrange700,
  deepOrange900,
  grey50,
  grey800
} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';
import {connect} from 'react-redux';
import * as actions from '../EmailAttachment/actions';

const styles = {
  analytics: {
    display: 'flex',
    alignItems: 'center'
  },
  wrapper: {
    width: '100%',
    padding: 15,
    // border: '1px gray solid',
    borderRadius: '1.2em',
    margin: 5,
    marginBottom: 10,
    backgroundColor: grey50
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
  },
  sentFrom: {
    color: 'gray',
    fontSize: '0.8em',
  }
};


class AnalyticsItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPreviewOpen: false
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
      attachments
    } = this.props;
    const wrapperStyle = (bounced || !delivered) ? Object.assign({}, styles.wrapper, {backgroundColor: deepOrange100}) : styles.wrapper;
    const SUBTRING_LIMIT = 18;
    const date = new Date(updated);
    return (
      <div style={wrapperStyle}>
        {
          listid !== 0 && <div className='row'>
            <div className='small-12 large-6 columns left'>
              <span style={styles.sentFrom}>Sent from List</span>
              <span style={{margin: '0 5px'}}><Link to={`/tables/${listid}`}>{listname || listid}</Link></span>
              {attachments !== null && <FontIcon style={{fontSize: '0.8em', margin: '0 3px'}} className='fa fa-paperclip'/>}
            </div>
            <div className='small-12 large-6 columns right'>
              <span style={{marginRight: 10, fontSize: '0.9em', float: 'right', color: 'gray'}}>{date.toDateString()} {date.toTimeString()}</span>
            </div>
          </div>
        }
        <Dialog
        open={this.state.isPreviewOpen}
        onRequestClose={_ => this.setState({isPreviewOpen: false})}
        >
          <StaticEmailContent {...this.props} />
        </Dialog>
        <div className='email-analytics row' style={styles.analytics}>
          <div className='small-12 medium-3 large-3 columns'>
            <span style={styles.to}>To</span>
            <span style={{color: (bounced || !delivered) ? deepOrange900 : grey800}}>{to.substring(0, SUBTRING_LIMIT)} {to.length > SUBTRING_LIMIT && `...`}</span>
          </div>
          <div className='small-12 medium-3 large-5 columns'>
            <span className='pointer' onClick={this.onPreviewOpen} style={styles.subjectText}>{subject.substring(0, 30)} {subject.length > 20 && `...`}</span>
            {!delivered && <div style={styles.errorText}>
              <span>Something went wrong on our end. Let us know!</span>
              <p>Email ID: {id}</p>
              </div>}
            {bounced && <span style={styles.errorText}>email bounced</span>}
            {bouncedreason && <p style={{color: deepOrange900}}>{bouncedreason}</p>}
          </div>
          <div className='small-12 medium-3 large-2 columns' style={{marginTop: 10}}>
            {(!bounced && delivered) && <CountViewItem label='Opened' count={opened} iconName='fa fa-paper-plane-o fa-lg' />}
          </div>
          <div className='small-12 medium-3 large-2 columns' style={{marginTop: 10}}>
            {(!bounced && delivered) && <CountViewItem label='Clicked' count={clicked} iconName='fa fa-hand-pointer-o fa-lg'/>}
          </div>
        </div>
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {};
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchAttachments: _ => props.attachments !== null && props.attachments.map(id => dispatch(actions.fetchAttachment(id)))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AnalyticsItem);
