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

const styles = {
  analytics: {
    display: 'flex',
    alignItems: 'center'
  },
  wrapper: {
    width: '100%',
    padding: '15px',
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
    fontWeight: 500,
    cursor: 'pointer'
  },
  sentFrom: {
    color: 'gray',
    fontSize: '0.8em',
  }
};


class ScheduledEmailItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPreviewOpen: false
    };
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
      updated
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
              <span style={{marginLeft: 10}}><Link to={`/tables/${listid}`}>{listname || listid}</Link></span>
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
            <span style={{color: grey800}}>{to.substring(0, SUBTRING_LIMIT)} {to.length > SUBTRING_LIMIT && `...`}</span>
          </div>
          <div className='small-12 medium-3 large-5 columns'>
            <span onClick={_ => this.setState({isPreviewOpen: true})} style={styles.subjectText}>{subject.substring(0, 30)} {subject.length > 20 && `...`}</span>
          </div>
        </div>
      </div>
      );
  }
}

ScheduledEmailItem.PropTypes = {
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

export default ScheduledEmailItem;
