import React, {Component} from 'react';
import {connect} from 'react-redux';
import Radium from 'radium';
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

import PreviewEmails from '../PreviewEmails';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
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

import {grey800, blue400, lightBlue500, blue50} from 'material-ui/styles/colors';

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
    width: 600,
  },
  sendButtonPosition: {
    position: 'absolute',
    bottom: 10,
    right: 10
  }
};

export function _getter(contact, fieldObj) {
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


class EmailPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subject: '',
      bodyEditorState: null,
      fieldsmap: [],
      currentTemplateId: 0,
      bodyHtml: this.props.emailsignature !== null ? this.props.emailsignature : null,
      body: this.props.emailsignature !== null ? this.props.emailsignature : null,
      subjectHtml: null,
      minimized: false,
    };
    this.toggleMinimize = _ => this.setState({minimized: !this.state.minimized});
    this.updateBodyHtml = html => this.setState({body: html});
    this.handleTemplateValueChange = this._handleTemplateValueChange.bind(this);
    this.replaceAll = this._replaceAll.bind(this);
    this._onPreviewEmailsClick = this._onPreviewEmailsClick.bind(this);
    this.onSubjectChange = (editorState) => {
      const subject = editorState.getCurrentContent().getBlocksAsArray()[0].getText();
      this.setState({subject});
    };
    this._getGeneratedHtmlEmails = this._getGeneratedHtmlEmails.bind(this);
    this._sendGeneratedEmails = this._sendGeneratedEmails.bind(this);
    this.onSaveNewTemplateClick = this._onSaveNewTemplateClick.bind(this);
    this.onDeleteTemplate = this._onArchiveTemplate.bind(this);
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
    let newHtml = html;
    fieldsmap.map(fieldObj => {
      let value = '';
      const replaceValue = _getter(contact, fieldObj);
      if (replaceValue) value = replaceValue;
      newHtml = newHtml.replace(new RegExp('\{' + fieldObj.name + '\}', 'g'), value);
    });
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
        if (this.props.scheduledtime !== null) emailObj.sendat = this.props.scheduledtime;
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
    const contactEmails = this._getGeneratedHtmlEmails(selectedContacts, subject, body);
    if (selectedContacts.length === 0) {
      alertify.alert(`Contact Selection Error`, `You didn't select any contact to send this email to.`, function() {});
      return;
    }
    if (selectedContacts.some(contact => contact.email.length === 0 || contact.email === null)) {
      alertify.alert(`Contact Selection Error`, `You selected contacts without email field filled. We can't send emails to contacts with empty email field.`, function() {});
      return;
    }
    if (subject.length === 0 || body.length === 0) {
      const warningType = subject.length === 0 ? `subject` : `body`;
      alertify
      .confirm(
        `Your ${warningType} is empty. Are you sure you want to send this email?`,
        _ => this._sendGeneratedEmails(contactEmails), // on OK
        _ => { } // on Cancel
      );
    } else {
      this._sendGeneratedEmails(contactEmails);
    }
  }

  _onSaveNewTemplateClick() {
    const state = this.state;
    alertify.prompt('', 'Name of new Email Template', '',
      (e, name) => this.props.createTemplate(name, state.subject, state.body)
        .then(currentTemplateId => this.setState({currentTemplateId})),
      _ => console.log('template saving cancelled'));
  }

  render() {
    const props = this.props;
    const state = this.state;
    // add this button to fetch all staged emails for debugging purposes
    const templateMenuItems = props.templates.length > 0 ?
    [<MenuItem value={0} key={-1} primaryText='[Select from Templates]'/>]
    .concat(props.templates.map((template, i) =>
      <MenuItem
      value={template.id}
      key={i}
      primaryText={template.name.length > 0 ? template.name : template.subject}
      />)) : null;

    const emailPanelWrapper = {
      height: styles.emailPanel.height,
      width: styles.emailPanel.width,
      zIndex: 200,
      display: state.minimized ? 'none' : 'block'
    };

    return (
      <div style={styles.emailPanelOuterPosition}>
        <div style={styles.emailPanelPosition}>
          <div>
          {state.minimized &&
            <MinimizedView color='red' toggleMinimize={this.toggleMinimize} name={1}/>}
          </div>
          <Paper style={emailPanelWrapper} zDepth={2}>
            <div className='RichEditor-root' style={styles.emailPanel}>
              <div>
                <FontIcon style={{margin: '0 3px', fontSize: '14px', float: 'right'}} color='lightgray' hoverColor='gray' onClick={props.onClose} className='fa fa-times pointer'/>
                <FontIcon style={{margin: '0 3px', fontSize: '14px', float: 'right'}} color='lightgray' hoverColor='gray' onClick={this.toggleMinimize} className='fa fa-minus pointer'/>
              </div>
              <div className='vertical-center'>
                Emails are sent from: <span style={{backgroundColor: props.from !== props.person.email && blue50, margin: '0 3px', padding: '0 3px'}}>{props.from}</span>
                {props.isImageReceiving && <FontIcon style={{margin: '0 3px', fontSize: '14px'}} color={grey800} className='fa fa-spin fa-spinner'/>}
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
                <div className='vertical-center'>
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
                <div style={{position: 'absolute', right: 20, bottom: 3}}>
                  <IconButton
                  iconClassName={props.isReceiving ? 'fa fa-spinner fa-spin' : 'fa fa-envelope'}
                  onClick={this._onPreviewEmailsClick}
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
            onSendAllEmailsClick={this._onSendAllEmailsClick}
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
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    onSendEmailClick: id => dispatch(stagingActions.sendEmail(id)),
    onSaveCurrentTemplateClick: (id, subject, body) => dispatch(templateActions.patchTemplate(id, subject, body)),
    fetchTemplates: _ => dispatch(templateActions.getTemplates()),
    createTemplate: (name, subject, body) => dispatch(templateActions.createTemplate(name, subject, body)),
    toggleArchiveTemplate: templateId => dispatch(templateActions.toggleArchiveTemplate(templateId)),
    clearUTCTime: _ => dispatch({type: 'CLEAR_SCHEDULE_TIME'}),
    postBatchEmails: emails => dispatch(stagingActions.postBatchEmails(emails)),
    postBatchEmailsWithAttachments: emails => dispatch(stagingActions.postBatchEmailsWithAttachments(emails)),
    initializeEmailDraft: _ => dispatch({type: 'INITIALIZE_EMAIL_DRAFT', listId: props.listId, email: props.person.email}),
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
)(Radium(EmailPanel));
