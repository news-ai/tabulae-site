import React, {PropTypes, Component} from 'react';
import Link from 'react-router/lib/Link';
import Dialog from 'material-ui/Dialog';
import StaticEmailContent from '../PreviewEmails/StaticEmailContent.react';
import FlatButton from 'material-ui/FlatButton';
import {connect} from 'react-redux';
import * as actions from '../actions';
import {
  grey50,
  grey800,
  deepOrange600
} from 'material-ui/styles/colors';
import moment from 'moment-timezone';

const FORMAT = 'dddd, MMMM HH:mm';

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
      updated,
      sendat,
      onCancelClick,
      cancel
    } = this.props;
    const wrapperStyle = styles.wrapper;
    const SUBTRING_LIMIT = 18;
    let date = moment(sendat);
    return (
      <div style={wrapperStyle}>
        {cancel && <div className='row'>
          <div className='small-12 large-6 columns left'>
          <span style={{color: deepOrange600}}>Canceled Delivery</span>
          </div>
        </div>}
        {
          listid !== 0 && <div className='row'>
            <div className='small-12 large-6 columns left'>
              <span style={styles.sentFrom}>Sending from List</span>
              <span style={{marginLeft: 10}}><Link to={`/tables/${listid}`}>{listname || listid}</Link></span>
            </div>
            <div className='small-12 large-6 columns right'>
              <span style={{marginRight: 10, fontSize: '0.9em', float: 'right', color: 'gray'}}>Schdeuled: {date.tz(moment.tz.guess()).format(FORMAT)}</span>
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
          <div className='small-12 medium-3 large-4 columns horizontal-center'>
            {!cancel && <FlatButton onClick={onCancelClick} label='Cancel' secondary/>}
          </div>
        </div>
      </div>
      );
  }
}

const mapDispatchToProps = (dispatch, props) => {
  return {
    onCancelClick: _ => dispatch(actions.cancelScheduledEmail(props.id)),
  };
};

export default connect(null, mapDispatchToProps)(ScheduledEmailItem);
