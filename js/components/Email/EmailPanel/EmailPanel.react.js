// @flow
import React, {Component} from 'react';
import {connect} from 'react-redux';
import SkyLight from 'react-skylight';
import {actions as feedActions} from 'components/ContactProfile/RSSFeed';
import {actions as contactActions} from 'components/Contacts';
import {actions as listActions} from 'components/Lists';
import {actions as publicationActions} from 'components/Publications';
import {actions as fileActions} from 'components/ImportFile';
import {actions as loginActions} from 'components/Login';
import {actions as stagingActions} from 'components/Email';
import {actions as templateActions} from 'components/Email/Template';
import {skylightStyles} from 'constants/StyleConstants';
import alertify from 'alertifyjs';
import 'node_modules/alertifyjs/build/css/alertify.min.css';
import './ReactTagsStyle.css';

import ReactTooltip from 'react-tooltip'
import PreviewEmails from '../PreviewEmails';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import FileWrapper from './FileWrapper.react';
import IconMenu from 'material-ui/IconMenu';
import SelectField from 'material-ui/SelectField';
import Paper from 'material-ui/Paper';
import BasicHtmlEditor from './BasicHtmlEditor.react';
import DatePickerHOC from './DatePickerHOC.react';
import AddCCPanelHOC from './AddCCPanelHOC.react';
import SwitchEmailHOC from './SwitchEmailHOC.react';
import MinimizedView from './MinimizedView.react';
import FontIcon from 'material-ui/FontIcon';
import get from 'lodash/get';
import find from 'lodash/find';
import isEmail from 'validator/lib/isEmail';

import {grey50, grey800, blue400, lightBlue500, blue50} from 'material-ui/styles/colors';

const styles = {
  emailPanelOuterPosition: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emailPanelPosition: {
    zIndex: 300,
    position: 'fixed',
    bottom: 0,
  },
  emailPanel: {
    height: 600,
    width: 620,
  },
  sendButtonPosition: {
    position: 'absolute',
    bottom: 10,
    right: 10
  }
};

const emailPanelWrapper = {
  height: styles.emailPanel.height,
  width: styles.emailPanel.width,
  zIndex: 200,
};

const emailPanelPauseOverlay = {
  backgroundColor: grey800,
  zIndex: 300,
  position: 'absolute',
  opacity: 0.7,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};


export function _getter(contact: Object, fieldObj: Object): ?string {
  try {
    if (fieldObj.customfield) {
      if (fieldObj.readonly) return contact[fieldObj.value];
      if (contact.customfields === null) return undefined;
      else if (!contact.customfields.some(obj => obj.name === fieldObj.value)) return undefined;
      else return find(contact.customfields, obj => obj.name === fieldObj.value).value;
    } else {
      if (fieldObj.strategy) return fieldObj.strategy(contact);
      else return contact[fieldObj.value];
    }
  } catch (e) {
    return undefined;
  }
}

const PauseOverlay = ({message}: {message: string}) => (
  <div style={Object.assign({}, emailPanelWrapper, emailPanelPauseOverlay)}>
    <div style={{margin: 0}}>
    <span style={{color: 'white', fontSize: '1.3em'}}>Image is loading</span><FontIcon style={{margin: '0 5px'}} color='white' className='fa fa-spin fa-spinner'/></div>
  </div>);


class EmailPanel extends Component {
  toggleMinimize: (event: Event) => void;
  updateBodyHtml: (html: string) => void;
  handleTemplateValueChange: (event: Event) => void;
  replaceAll: (html: string, contact: Object) => ?string;
  onPreviewEmailsClick: (event: Event) => void;
  getGeneratedHtmlEmails: (selectedContacts: Array<Object>, subject: string, body: string) => Array<Object>;
  sendGeneratedEmails: (contactEmails: Array<Object>) => void;
  onSubjectChange: (editorState: Object) => void;
  onSaveNewTemplateClick: (event: Event) => void;
  onDeleteTemplate: () => void;
  onClose: (event: Event) => void;
  state: {
    subject: string,
    bodyEditorState: ?Object,
    fieldsmap: Array<Object>,
    currentTemplateId: number,
    bodyHtml: string,
    body: string,
    subjectHtml: ?string,
    minimized: bool
  };

  constructor(props) {
    super(props);
    this.state = {
      subject: '',
      bodyEditorState: null,
      fieldsmap: [],
      currentTemplateId: 0,
      bodyHtml: this.props.emailsignature !== null ? this.props.emailsignature : '',
      body: this.props.emailsignature !== null ? this.props.emailsignature : '',
      subjectHtml: null,
      minimized: false,
    };
    this.toggleMinimize = _ => this.setState({minimized: !this.state.minimized});
    this.updateBodyHtml = html => this.setState({body: html});
    this.handleTemplateValueChange = this._handleTemplateValueChange.bind(this);
    this.replaceAll = this._replaceAll.bind(this);
    this.onPreviewEmailsClick = this._onPreviewEmailsClick.bind(this);
    this.onSubjectChange = (editorState) => {
      const subject = editorState.getCurrentContent().getBlocksAsArray()[0].getText();
      this.setState({subject});
    };
    this.getGeneratedHtmlEmails = this._getGeneratedHtmlEmails.bind(this);
    this.sendGeneratedEmails = this._sendGeneratedEmails.bind(this);
    this.onSaveNewTemplateClick = this._onSaveNewTemplateClick.bind(this);
    this.onDeleteTemplate = this._onArchiveTemplate.bind(this);
    this.onClose = this._onClose.bind(this);
  }

  componentWillMount() {
    this.props.fetchTemplates();
    this.props.initializeEmailDraft();
  }

  componentWillReceiveProps(nextProps) {
    // add immutable here
    const fieldsmap = nextProps.fieldsmap;
    this.setState({fieldsmap});
  }

  componentWillUnmount() {
    this.props.clearUTCTime();
    this.props.initializeEmailDraft();
  }

  _onArchiveTemplate() {
    this.props.toggleArchiveTemplate(this.state.currentTemplateId)
    .then(_ => this._handleTemplateValueChange(null, null, 0));
  }

  _handleTemplateValueChange(event, index, value) {
    if (value !== 0) {
      const template = find(this.props.templates, tmp => value === tmp.id);
      const bodyHtml = template.body;
      const subjectHtml = template.subject;
      this.setState({bodyHtml, subjectHtml});
    } else {
      this.setState({bodyHtml: '', subjectHtml: ''});
    }
    this.setState({currentTemplateId: value});
  }

  _replaceAll(html, contact) {
    const {fieldsmap} = this.state;
    if (html === null || html.length === 0) return;
    let newHtml = html;
    let matchCount = {};
    fieldsmap.map(fieldObj => {
      let value = '';
      const replaceValue = _getter(contact, fieldObj);
      if (replaceValue) value = replaceValue;
      const regexValue = new RegExp('\{' + fieldObj.name + '\}', 'g');
      // count num custom vars used
      const matches = newHtml.match(regexValue);
      if (matches !== null) matchCount[fieldObj.name] = matches.length;

      newHtml = newHtml.replace(regexValue, value);
    });
    window.Intercom('trackEvent', 'num_custom_variables', {num_custom_variables: Object.keys(matchCount).length})
    return newHtml;
  }

  _getGeneratedHtmlEmails(selectedContacts, subject, body) {
    let contactEmails = [];
    selectedContacts.map((contact, i) => {
      if (contact && contact !== null) {
        const replacedBody = this.replaceAll(body, selectedContacts[i]);
        const replacedSubject = this.replaceAll(subject, selectedContacts[i]);
        let emailObj = {
          listid: this.props.listId,
          to: contact.email,
          subject: replacedSubject,
          body: replacedBody,
          contactid: contact.id,
          templateid: this.state.currentTemplateId,
          cc: this.props.cc.map(item => item.text),
          bcc: this.props.bcc.map(item => item.text),
          fromemail: this.props.from
        };
        if (this.props.scheduledtime !== null) {
          emailObj.sendat = this.props.scheduledtime;
        }
        contactEmails.push(emailObj);
      }
    });
    return contactEmails;
  }

  _sendGeneratedEmails(contactEmails) {
    this.props.postEmails(contactEmails)
    .then(_ => this.refs.preview.show());
  }

  _onPreviewEmailsClick() {
    const {selectedContacts} = this.props;
    const {subject, body} = this.state;
    const contactEmails = this.getGeneratedHtmlEmails(selectedContacts.filter(contact => contact.email !== null && contact.email.length > 0 && isEmail(contact.email)), subject, body);
    if (selectedContacts.length === 0) {
      alertify.alert(`Contact Selection Error`, `You didn't select any contact to send this email to.`, function() {});
      return;
    }
    if (selectedContacts.some(contact => contact.email.length === 0 || contact.email === null)) {
      alertify.alert(
        `Contact Selection Warning`,
        `You selected contacts without email field filled. We will skip emailing the following contacts:\n${
          selectedContacts
          .filter(contact => contact.email.length === 0 || contact.email === null)
          .map(contact => `${contact.firstname} ${contact.lastname}`)
          .join(', ')
        }`, function() {});
      if (contactEmails.length === 0) {
        alertify.alert(
          `Contact Selection Warning`,
          `All contacts selected had no email fields.`
          , function() {});
        return;
      }
    }
    if (subject.length === 0 || body.length === 0) {
      const warningType = subject.length === 0 ? `subject` : `body`;
      alertify
      .confirm(
        `Your ${warningType} is empty. Are you sure you want to send this email?`,
        _ => this.sendGeneratedEmails(contactEmails), // on OK
        _ => { } // on Cancel
      );
    } else {
      if (selectedContacts.length > 400) {
        alertify.alert('Processing', `Sending >400 emails might take a minute to process. Please be patient while we generate Preview of those emails.`, function() {});
      }
      this.sendGeneratedEmails(contactEmails);
    }
  }

  _onSaveNewTemplateClick() {
    const state:any = this.state;
    alertify.prompt('', 'Name of new Email Template', '',
      (e, name) => this.props.createTemplate(name, state.subject, state.body)
        .then(currentTemplateId => this.setState({currentTemplateId})),
      _ => console.log('template saving cancelled'));
  }

  _onClose() {
    const state:any = this.state;
    if (state.body || state.subject) {
      alertify.confirm(
        'Are you sure?',
        'Closing the editor will cause your subject/body to be discarded.',
        this.props.onClose,
        () => {}
        );
    } else {
      this.props.onClose();
    }
  }

  render() {
    const state:any = this.state;
    const props:any = this.props;
    // add this button to fetch all staged emails for debugging purposes
    const templateMenuItems = props.templates.length > 0 ?
    [<MenuItem value={0} key={-1} primaryText='[Select from Templates]'/>]
    .concat(props.templates.map((template, i) =>
      <MenuItem
      value={template.id}
      key={i}
      primaryText={template.name.length > 0 ? template.name : template.subject}
      />)) : null;

    return (
      <div style={styles.emailPanelOuterPosition}>
        <ReactTooltip id='attachmentsTip' place='top' effect='solid'>
          <div>{props.files.map(file => <div key={file.name} className='vertical-center'>{file.name}</div>)}</div> 
        </ReactTooltip>
        <div style={styles.emailPanelPosition}>
        {props.isImageReceiving &&
          <PauseOverlay message='Image is loading.'/>}
        {state.minimized &&
          <MinimizedView toggleMinimize={this.toggleMinimize}/>}
          <FileWrapper open={props.isAttachmentPanelOpen} onRequestClose={props.onAttachmentPanelClose}/>
          <Paper style={Object.assign({}, emailPanelWrapper, {display: state.minimized ? 'none' : 'block'})} zDepth={2}>
            <div className='RichEditor-root' style={styles.emailPanel}>
              <div>
                <FontIcon style={{margin: '0 3px', fontSize: '14px', float: 'right'}} color='lightgray' hoverColor='gray' onClick={this.onClose} className='fa fa-times pointer'/>
                <FontIcon style={{margin: '0 3px', fontSize: '14px', float: 'right'}} color='lightgray' hoverColor='gray' onClick={this.toggleMinimize} className='fa fa-minus pointer'/>
                <div onClick={props.onAttachmentPanelOpen} className='pointer' style={{
                  zIndex: 500,
                  float: 'right',
                  margin: '0 8px',
                  display: (props.files && props.files.length > 0) ? 'block' : 'none'
                }}>
                  <a data-tip data-for='attachmentsTip' style={{fontSize: '0.8em', color: 'darkgray'}}>File{props.files.length > 1 && 's'} Attached</a>
                </div>
              </div>
              <div className='vertical-center'>
                Emails are sent from: <span style={{backgroundColor: props.from !== props.person.email && blue50, margin: '0 3px', padding: '0 3px'}}>{props.from}</span>
              {props.isImageReceiving &&
                <FontIcon style={{margin: '0 3px', fontSize: '14px'}} color={grey800} className='fa fa-spin fa-spinner'/>}
              </div>
              <BasicHtmlEditor
              listId={props.listId}
              fieldsmap={state.fieldsmap}
              width={styles.emailPanel.width}
              bodyHtml={state.bodyHtml}
              subjectHtml={state.subjectHtml}
              onBodyChange={html => this.updateBodyHtml(html) }
              onSubjectChange={this.onSubjectChange}
              debounce={500}
              person={props.person}
              >
                <div style={{backgroundColor: 'white'}} className='vertical-center'>
                  <SelectField
                  style={{overflowX: 'hidden'}}
                  value={state.currentTemplateId}
                  onChange={this.handleTemplateValueChange}
                  maxHeight={200}
                  >
                  {templateMenuItems}
                  </SelectField>
                  <IconMenu
                  iconButtonElement={<IconButton iconStyle={{color: grey800}} tooltipPosition='top-right' tooltip='Templates' iconClassName='fa fa-cogs'/>}
                  anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                  targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
                  >
                    <MenuItem
                    disabled={state.currentTemplateId ? false : true}
                    onClick={_ => props.onSaveCurrentTemplateClick(state.currentTemplateId, state.subject, state.body)}
                    primaryText='Save Text to Existing Template'
                    />
                    <MenuItem onClick={this.onSaveNewTemplateClick} primaryText='Save Text as New Template' />
                    <MenuItem
                    onClick={this.onDeleteTemplate}
                    disabled={state.currentTemplateId ? false : true}
                    primaryText='Delete Template' />
                  </IconMenu>
                  <DatePickerHOC>
                    {({onRequestOpen}) =>
                    <IconButton
                    iconStyle={{color: props.scheduledtime === null ? grey800 : blue400}}
                    onClick={onRequestOpen}
                    iconClassName='fa fa-calendar'
                    tooltip='Schedule & Send Later'
                    tooltipPosition='top-right'
                    />}
                  </DatePickerHOC>
                  <AddCCPanelHOC listId={props.listId}>
                  {({onRequestOpen}) =>
                    <IconButton
                    iconStyle={{color: props.cc.length > 0 || props.bcc.length > 0 ? blue400 : grey800}}
                    iconClassName='fa fa-user-plus'
                    onClick={onRequestOpen}
                    tooltip='CC/BCC'
                    tooltipPosition='top-right'
                    />}
                  </AddCCPanelHOC>
                  <SwitchEmailHOC listId={props.listId}>
                  {({onRequestOpen}) =>
                    <IconButton
                    iconStyle={{color: grey800}}
                    iconClassName='fa fa-users'
                    onClick={onRequestOpen}
                    tooltip='Switch Email'
                    tooltipPosition='top-right'
                    />}
                  </SwitchEmailHOC>
                </div>
                <div style={{position: 'absolute', right: 20, bottom: 3, zIndex: 300}}>
                  <IconButton
                  iconClassName={props.isReceiving ? 'fa fa-spinner fa-spin' : 'fa fa-envelope'}
                  onClick={this.onPreviewEmailsClick}
                  tooltip='Preview then Send'
                  tooltipPosition='top-left'
                  iconStyle={{color: 'white'}}
                  style={{backgroundColor: lightBlue500}}
                  />
                </div>
              </BasicHtmlEditor>
            </div>
          </Paper>
          <SkyLight
          overlayStyles={skylightStyles.overlay}
          dialogStyles={skylightStyles.dialog}
          hideOnOverlayClicked
          ref='preview'
          title='Preview'>
            <PreviewEmails
            listId={props.listId}
            sendLater={props.scheduledtime !== null}
            isReceiving={props.isReceiving}
            previewEmails={props.previewEmails}
            onSendAllEmailsClick={ids => props.onBulkSendEmails(ids).then(_ => alertify.success(`${ids.length} emails ${props.scheduledtime !== null ? 'scheduled' : 'sent'}.`))}
            onSendEmailClick={id => props.onSendEmailClick(id).then(_ => alertify.success(`Email ${props.scheduledtime !== null ? 'scheduled' : 'sent'}.`))}
            />
          </SkyLight>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  const templates = state.templateReducer.received.map(id => state.templateReducer[id]).filter(template => !template.archived);
  return {
    person: state.personReducer.person,
    scheduledtime: state.stagingReducer.utctime,
    isReceiving: state.stagingReducer.isReceiving,
    stagedEmailIds: state.stagingReducer.previewEmails,
    previewEmails: state.stagingReducer.previewEmails
    .map(pEmail => state.stagingReducer[pEmail.id])
    .filter(email => !email.issent),
    stagingReducer: state.stagingReducer,
    templates: templates,
    selectedContacts: props.selectedContacts ? props.selectedContacts : props.selected.map(id => state.contactReducer[id]),
    attachedfiles: state.emailAttachmentReducer.attached,
    isAttaching: state.emailAttachmentReducer.isReceiving,
    emailsignature: state.personReducer.person.emailsignature || null,
    cc: get(state, `emailDraftReducer[${props.listId}].cc`) || [],
    bcc: get(state, `emailDraftReducer[${props.listId}].bcc`) || [],
    from: get(state, `emailDraftReducer[${props.listId}].from`) || state.personReducer.person.email,
    isImageReceiving: state.emailImageReducer.isReceiving,
    files: state.emailAttachmentReducer.attached,
    isAttachmentPanelOpen: state.emailDraftReducer.isAttachmentPanelOpen,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    onSendEmailClick: id => dispatch(stagingActions.sendEmail(id)),
    onBulkSendEmails: ids => dispatch(stagingActions.bulkSendEmails(ids)),
    onSaveCurrentTemplateClick: (id, subject, body) => dispatch(templateActions.patchTemplate(id, subject, body)),
    fetchTemplates: _ => dispatch(templateActions.getTemplates()),
    createTemplate: (name, subject, body) => dispatch(templateActions.createTemplate(name, subject, body)),
    toggleArchiveTemplate: templateId => dispatch(templateActions.toggleArchiveTemplate(templateId)),
    clearUTCTime: _ => dispatch({type: 'CLEAR_SCHEDULE_TIME'}),
    postBatchEmails: emails => dispatch(stagingActions.postBatchEmails(emails)),
    postBatchEmailsWithAttachments: emails => dispatch(stagingActions.postBatchEmailsWithAttachments(emails)),
    initializeEmailDraft: _ => dispatch({type: 'INITIALIZE_EMAIL_DRAFT', listId: props.listId, email: props.person.email}),
    onAttachmentPanelClose: _ => dispatch({type: 'TURN_OFF_ATTACHMENT_PANEL'}),
    onAttachmentPanelOpen: _ => dispatch({type: 'TURN_ON_ATTACHMENT_PANEL'}),
  };
};

const mergeProps = (sProps, dProps, oProps) => {
  return {
    postEmails: emails => sProps.attachedfiles.length > 0 ? dProps.postBatchEmailsWithAttachments(emails) : dProps.postBatchEmails(emails),
    ...sProps,
    ...dProps,
    ...oProps,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(EmailPanel);
