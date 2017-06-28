import React, {Component} from 'react';
import {connect} from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import {grey700, blueGrey50} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';
import Fuse from 'fuse.js';
import find from 'lodash/find';
import isJSON from 'validator/lib/isJSON';

import {actions as templateActions} from 'components/Email/Template';
import PreviewEmail from './PreviewEmail.jsx';

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
    this.onChange = this.onChange.bind(this);
    this.onSendAllEmails = this.onSendAllEmails.bind(this);
    this.handleRecentTemplates = this.handleRecentTemplates.bind(this);
    this.fuse = new Fuse(this.props.previewEmails, fuseOptions);
  }

  onChange(e) {
    const value = e.target.value;
    this.setState({searchValue: value});
    if (value.length > 0) {
      const results = this.fuse.search(value);
      this.setState({searchOn: true, results});
    } else {
      this.setState({searchOn: false});
    }
  }

  onSendAllEmails() {
    const previewEmails = this.state.searchOn ? this.state.results : this.props.previewEmails;
    window.Intercom('trackEvent', 'sent_emails', {numSentEmails: previewEmails.length, scheduled: this.props.sendLater});
    mixpanel.track('sent_emails', {numSentEmails: previewEmails.length, scheduled: this.props.sendLater});
    this.props.onSendAllEmailsClick(previewEmails.map(email => email.id));
    this.handleRecentTemplates();
  }

  handleRecentTemplates() {
    // save current email contentState and remove oldest one
    const previewEmails = this.props.previewEmails;
    const rightNow = new Date();
    const year = rightNow.getFullYear();
    const month = rightNow.getMonth() + 1;
    const date1 = rightNow.getDate();
    const hour = rightNow.getHours();
    const minutes = rightNow.getMinutes();
    const seconds = rightNow.getSeconds();
    const templateName = `Sent on ${month}-${date1}-${year} ${hour}:${minutes}`;

    const templates = this.props.templates
    .reduce((acc, template) => {
      if (isJSON(template.body)) {
        if (JSON.parse(template.body).date) {
          acc.push(template);
        }
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(JSON.parse(b.body).date) - new Date(JSON.parse(a.body).date));

    if (templates.length > 5) {
      // remove oldest recent template
      const extraTemplates = templates.filter((tmp, i) => i > 4);
      extraTemplates.map(template => this.props.toggleArchiveTemplate(template.id));
    }

    // save current email contentState
    this.props.createTemplate(
      templateName,
      previewEmails[0].subject,
      JSON.stringify({type: 'DraftEditorState', date: rightNow, data: this.props.savedContentState})
      );
  }

  render() {
    const state = this.state;
    const props = this.props;
    const {sendLater, isReceiving, onSendEmailClick} = this.props;

    const previewEmails = state.searchOn ? state.results : props.previewEmails;
    const searchOn = state.searchValue.length > 0;

    let sendAllButtonLabel = sendLater ? 'Schedule All Emails' : 'Send All';
    if (state.numberDraftEmails > 0) sendAllButtonLabel = 'Draft in Progess';
    else if (searchOn) sendAllButtonLabel = 'Search in Progress';
    else if (previewEmails.length === 0) sendAllButtonLabel = 'Done';

    let renderNode;
    if (props.emailDidInvalidate) {
      renderNode = (
        <div className='horizontal-center vertical-center' style={styles.fillScreen} >
          An error occurred with generating previews of the emails.
        </div>);
    } else if (previewEmails.length === 0) {
      renderNode = (
        <div className='horizontal-center vertical-center' style={styles.fillScreen}>
          <span>All done.</span>
        </div>);
    } else {
      renderNode = (
      <div>
        <div className='vertical-center' style={{marginBottom: 10}}>
          <div>
            <TextField
            id='preview_searchValue'
            disabled={state.numberDraftEmails > 0}
            hintText='Search Filter'
            floatingLabelText={state.numberDraftEmails > 0 ? 'Draft in Progress' : 'Search Filter'}
            value={state.searchValue}
            onChange={this.onChange}
            />
          </div>
          <span className='smalltext right' style={{color: grey700}}>
            Showing {state.searchOn ? `${previewEmails.length} out of ${this.props.previewEmails.length}` : previewEmails.length} emails
          </span>
        </div>
        <div style={styles.attachmentContainer}>
          <span className='text' style={{marginLeft: 10}} >Attachments:</span>
      {props.attachments.length > 0 ?
        props.attachments.map(file =>
          <span key={file.name} className='smalltext' style={styles.attachmentText}>{file.name}</span>) : <span className='smalltext' style={styles.attachmentText}>None</span>}
          <div className='vertical-center'>
          {props.attachmentIsReceiving &&
            <span className='smalltext' style={styles.loadingText}>Attaching files...</span>}
          {props.finishedAttaching &&
            <span className='smalltext' style={styles.loadingText}>Succesfully attached.</span>}
          </div>
        </div>
        {previewEmails.map((email, i) =>
          <PreviewEmail
          contact={find(props.contacts, contact => contact.id === email.contactId)}
          fieldsmap={props.fieldsmap}
          turnOnDraft={_ => {
            window.Intercom('trackEvent', 'use_preview_draft');
            mixpanel.track('use_preview_draft');
            this.setState({numberDraftEmails: state.numberDraftEmails + 1});
          }}
          turnOffDraft={_ => this.setState({numberDraftEmails: state.numberDraftEmails - 1})}
          sendLater={sendLater}
          key={`preview-email-${i}`}
          {...email}
          onSendEmailClick={_ => {
            window.Intercom('trackEvent', 'sent_email', {numSentEmails: 1, scheduled: sendLater});
            mixpanel.track('sent_email', {numSentEmails: 1, scheduled: sendLater});
            onSendEmailClick(email.id);
          }}
          />)}
      </div>
      );
    }

    return (
      <div>
        <div className='vertical-center' style={styles.topbarContainer} >
          <div>
            <IconButton
            onClick={props.onBack}
            iconClassName='fa fa-arrow-left'
            tooltip='Back to Editor'
            tooltipPosition='bottom-right'
            />
          </div>
          <div className='right'>
            <RaisedButton
            disabled={state.numberDraftEmails > 0 || props.isReceiving || previewEmails.length === 0 || searchOn}
            label={sendAllButtonLabel}
            primary
            icon={<FontIcon className={props.isReceiving ? 'fa fa-spinner fa-spin' : 'fa fa-envelope'}/>}
            labelStyle={styles.textTransformNone}
            onClick={this.onSendAllEmails}
            />
          </div>
        </div>
        <div style={styles.bodyContainer} >
          {renderNode}
        </div>
      </div>);
  }
}

const styles = {
  loadingText: {color: grey700, marginLeft: 15},
  attachmentText: {color: grey700, margin: '0 3px'},
  textTransformNone: {textTransform: 'none'},
  topbarContainer: {padding: '5px 20px', backgroundColor: blueGrey50},
  bodyContainer: {padding: 10, marginBottom: 40},
  fillScreen: {height: '100%', width: '100%'},
  attachmentContainer: {margin: '8px 0 15px 0'},
};

const mapStateToProps = (state, props) => {
  const templates = state.templateReducer.received
  .map(id => state.templateReducer[id])
  .filter(template => !template.archived);
  return {
    emailDidInvalidate: state.stagingReducer.didInvalidate,
    attachmentDidInvalidate: state.emailAttachmentReducer.didInvalidate,
    attachmentIsReceiving: state.emailAttachmentReducer.isReceiving,
    attachments: state.emailAttachmentReducer.attached,
    finishedAttaching: state.emailAttachmentReducer.finished,
    savedContentState: state.emailDraftReducer.editorState,
    templates: templates,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    createTemplate: (name, subject, body) => dispatch(templateActions.createTemplate(name, subject, body)),
    toggleArchiveTemplate: templateId => dispatch(templateActions.toggleArchiveTemplate(templateId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PreviewEmails);
