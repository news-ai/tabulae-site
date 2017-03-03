import React, {PropTypes, Component} from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import PreviewEmail from './PreviewEmail.react';
import Waiting from 'components/Waiting';
import Fuse from 'fuse.js';
import TextField from 'material-ui/TextField';
import {grey700} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';
import {connect} from 'react-redux';

const fuseOptions = {
  threshold: 0.6,
  shouldSort: true,
  keys: [{
    name: 'firstname',
    weight: 0.7
  }, {
    name: 'lastname',
    weight: 0.7
  }, {
    name: 'to',
    weight: 0.5
  }, {
    name: 'subject',
    weight: 0.2
  }, {
    name: 'body',
    weight: 0.2
  }]
};

class PreviewEmails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numberDraftEmails: 0,
      searchValue: '',
      searchOn: false,
    };
    this.onChange = this._onChange.bind(this);
    this.fuse = new Fuse(this.props.previewEmails, fuseOptions);
  }

  _onChange(e) {
    const value = e.target.value;
    this.setState({searchValue: value});
    if (value.length > 0) {
      const results = this.fuse.search(value);
      this.setState({searchOn: true, results});
    } else {
      this.setState({searchOn: false});
    }
  }

  render() {
    const state = this.state;
    const props = this.props;
    const {sendLater, isReceiving, onSendEmailClick} = this.props;

    const previewEmails = state.searchOn ? state.results : this.props.previewEmails;

    let sendAllButtonLabel = sendLater ? 'Schedule All Emails' : 'Send All';
    if (state.numberDraftEmails > 0) sendAllButtonLabel = 'Draft in Progess';


    let renderNode;
    if (previewEmails.length === 0) renderNode = <span>All done.</span>;
    else {
      renderNode = (
      <div>
        <div className='vertical-center' style={{margin: '10px 0'}}>
          <div>
            <RaisedButton
            disabled={state.numberDraftEmails > 0 || props.isReceiving}
            label={sendAllButtonLabel}
            primary
            icon={<FontIcon className={props.isReceiving ? 'fa fa-spinner fa-spin' : 'fa fa-envelope'}/>}
            labelStyle={{textTransform: 'none'}}
            onClick={_ => props.onSendAllEmailsClick(previewEmails.map(email => email.id))}
            />
          </div>
          <div className='right'>
            <TextField
            id='preview_searchValue'
            disabled={state.numberDraftEmails > 0}
            hintText='Search Filter'
            floatingLabelText={state.numberDraftEmails > 0 ? 'Draft in Progress' : 'Search Filter'}
            value={state.searchValue}
            onChange={this.onChange}
            />
          </div>
        </div>
        <div className='vertical-center'>
          <span style={{color: grey700, fontSize: '0.8em'}}>Showing {state.searchOn ? `${previewEmails.length} out of ${this.props.previewEmails.length}` : previewEmails.length} emails</span>
        </div>
        <div style={{margin: '8px 0'}}>
          <span style={{fontSize: '0.9em'}}>Attachments:</span>
      {props.attachments.length > 0 ? props.attachments.map(file =>
          <span key={file.name} style={{color: grey700, fontSize: '0.8em', margin: '0 3px'}}>{file.name}</span>) : <span style={{color: grey700, fontSize: '0.8em', margin: '0 3px'}}>None</span>}
          <div className='vertical-center'>
            {props.attachmentIsReceiving && <span style={{color: grey700, fontSize: '0.8em'}}>Attaching files...</span>}
            {props.finishedAttaching && <span style={{color: grey700, fontSize: '0.8em'}}>Succesfully attached.</span>}
          </div>
        </div>
        {previewEmails.map((email, i) =>
          <PreviewEmail
          turnOnDraft={_ => {
            window.Intercom('trackEvent', 'use_preview_draft');
            this.setState({numberDraftEmails: state.numberDraftEmails + 1});
          }}
          turnOffDraft={_ => this.setState({numberDraftEmails: state.numberDraftEmails - 1})}
          sendLater={sendLater}
          key={`preview-email-${i}`}
          {...email}
          onSendEmailClick={_ => {
            window.Intercom('trackEvent', 'sent_email', {numSentEmails: previewEmails.length, scheduled: sendLater});
            onSendEmailClick(email.id);
          }}
          />)}
      </div>
      );
    }
    return (
      <div style={{padding: 10}}>
        <Waiting style={{position: 'absolute', right: 15, top: 15}} isReceiving={isReceiving} text='Generating emails' textStyle={{marginTop: '20px'}}/>
        {renderNode}
      </div>);
  }
}

PreviewEmails.PropTypes = {
  isReceiving: PropTypes.bool.isRequired,
  previewEmails: PropTypes.array.isRequired,
  onSendEmailClick: PropTypes.func.isRequired,
};

const mapStateToProps = (state, props) => {
  return {
    attachmentIsReceiving: state.emailAttachmentReducer.isReceiving,
    attachments: state.emailAttachmentReducer.attached,
    finishedAttaching: state.emailAttachmentReducer.finished
  };
};

export default connect(mapStateToProps)(PreviewEmails);
