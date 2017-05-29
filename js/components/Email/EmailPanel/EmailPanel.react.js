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
import isEmpty from 'lodash/isEmpty';
import isJSON from 'validator/lib/isJSON';

import {grey50, grey800, blue400, lightBlue500, blue50} from 'material-ui/styles/colors';
import {_getter} from 'components/ListTable/helpers';
import replaceAll from './utils/replaceAll';

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
    width: 700,
  },
  sendButtonPosition: {
    position: 'absolute',
    bottom: 10,
    right: 10
  },
  smallIcon: {
    margin: '0 3px', fontSize: '14px', float: 'right'
  },
  attachTooltip: {
    zIndex: 500,
    float: 'right',
    margin: '0 8px',
  },
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

alertify.promisifyConfirm = (title, description) => new Promise((resolve, reject) => {
  alertify.confirm(title, description, resolve, reject);
});

alertify.promisifyPrompt = (title, description, defaultValue) => new Promise((resolve, reject) => {
    alertify.prompt(title, description, defaultValue, (e, value) => resolve(value), reject);
  });

const PauseOverlay = ({message}: {message: string}) => (
  <div style={Object.assign({}, emailPanelWrapper, emailPanelPauseOverlay)}>
    <div style={{margin: 0}}>
    <span style={{color: '#ffffff', fontSize: '1.3em'}}>Image is loading</span><FontIcon style={{margin: '0 5px'}} color='#ffffff' className='fa fa-spin fa-spinner'/></div>
  </div>);

class EmailPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subject: '',
      fieldsmap: [],
      currentTemplateId: 0,
      bodyEditorState: null,
      bodyHtml: '',
      body: '',
      subjectHtml: null,
      minimized: false,
      isPreveiwOpen: false,
      dirty: false,
    };
    this.toggleMinimize = _ => this.setState({minimized: !this.state.minimized});
    this.updateBodyHtml = (html, rawContentState) => {
      this.setState({body: html, bodyEditorState: rawContentState, dirty: true});
      this.props.saveEditorState(rawContentState);
    };
    this.handleTemplateValueChange = this._handleTemplateValueChange.bind(this);
    this.onPreviewEmailsClick = this._onPreviewEmailsClick.bind(this);
    this.onSubjectChange = (editorState) => {
      const subject = editorState.getCurrentContent().getBlocksAsArray()[0].getText();
      this.setState({subject});
    };
    this.getGeneratedHtmlEmails = this._getGeneratedHtmlEmails.bind(this);
    this.sendGeneratedEmails = this._sendGeneratedEmails.bind(this);
    this.onSaveNewTemplateClick = this._onSaveNewTemplateClick.bind(this);
    this.onSaveCurrentTemplateClick = this._onSaveCurrentTemplateClick.bind(this);
    this.onDeleteTemplate = this._onArchiveTemplate.bind(this);
    this.onClose = this._onClose.bind(this);
    this.checkEmailDupes = this._checkEmailDupes.bind(this);
    this.changeEmailSignature = this._changeEmailSignature.bind(this);

    // cleanups
    this.onEmailSendClick = _ => this.checkEmailDupes().then(this.onPreviewEmailsClick);
  }

  componentWillMount() {
    this.props.fetchTemplates();
    this.props.initializeEmailDraft();
  }

  componentDidMount() {
    // treats it like a template
    this.changeEmailSignature(this.props.emailsignature);
  }

  componentWillReceiveProps(nextProps) {
    // add immutable here
    const fieldsmap = nextProps.fieldsmap;
    this.setState({fieldsmap});

    if (this.props.from !== nextProps.from) {
      // from email changed
      let emailsignature = nextProps.emailsignature;
      this.changeEmailSignature(nextProps.emailsignature)
    }
  }

  componentWillUnmount() {
    this.props.clearUTCTime();
    this.props.initializeEmailDraft();
  }

  _changeEmailSignature(emailsignature) {
    // check if want to replace
    if (emailsignature && emailsignature !== null) {
      if (isJSON(emailsignature)) {
        const sign = JSON.parse(emailsignature);
        this.setState({bodyEditorState: sign.data});
        this.props.saveEditorState(sign.data);
      } else {
        this.props.setBodyHtml(emailsignature);
        this.setState({bodyHtml: emailsignature});
      }
      this.props.turnOnTemplateChange('append', 'EMAIL_SIGNATURE');
      setTimeout(_ => this.setState({dirty: false}), 1000);
    }
  }

  _onArchiveTemplate() {
    this.props.toggleArchiveTemplate(this.state.currentTemplateId)
    .then(_ => this._handleTemplateValueChange(null, null, 0));
    setTimeout(_ => this.setState({dirty: false}), 10);
  }

  _onSaveNewTemplateClick() {
    alertify.promisifyPrompt(
      '',
      'Name of new Email Template',
      '',
      ).then(
      name => {
        this.props.createTemplate(
          name,
          this.state.subject,
          JSON.stringify({type: 'DraftEditorState' , data: this.state.bodyEditorState})
          )
        .then(currentTemplateId => {
          this.setState({currentTemplateId}, _ => {
            setTimeout(_ => {
              this.setState({dirty: false});
            }, 10);
          });
        });
      },
      _ => console.log('template saving cancelled')
      );
  }

  _onSaveCurrentTemplateClick() {
    this.props.onSaveCurrentTemplateClick(
      this.state.currentTemplateId,
      this.state.subject,
      JSON.stringify({type: 'DraftEditorState' , data: this.state.bodyEditorState})
      );
    setTimeout(_ => this.setState({dirty: false}), 10);
  }

  _handleTemplateValueChange(event, index, value) {
    if (value !== 0) {
      const template = find(this.props.templates, tmp => value === tmp.id);
      const subjectHtml = template.subject;
      const bodyHtml = template.body;
      if (isJSON(template.body)) {
        const templateJSON = JSON.parse(template.body);
        this.setState({bodyEditorState: templateJSON.data});
        this.props.saveEditorState(templateJSON.data);
        this.setState({subjectHtml});
      } else {
        this.props.setBodyHtml(bodyHtml);
        this.setState({bodyHtml, subjectHtml});
      }
    } else {
      this.setState({bodyHtml: '', subjectHtml: ''});
    }
    this.setState({currentTemplateId: value});
    this.props.turnOnTemplateChange();
    setTimeout(_ => {
      this.changeEmailSignature(this.props.emailsignature)
      this.setState({dirty: false});
    }, 1000);
  }

  _getGeneratedHtmlEmails(selectedContacts, subject, body) {
    let emptyFields = [];
    const contactEmails = selectedContacts.reduce((acc, contact, i) => {
      if (contact && contact !== null) {
        const bodyObj = replaceAll(body, selectedContacts[i], this.state.fieldsmap);
        const subjectObj = replaceAll(subject, selectedContacts[i], this.state.fieldsmap);

        let emailObj = {
          listid: this.props.listId,
          to: contact.email,
          subject: subjectObj.html,
          body: bodyObj.html,
          contactid: contact.id,
          templateid: this.state.currentTemplateId,
          cc: this.props.cc.map(item => item.text),
          bcc: this.props.bcc.map(item => item.text),
          fromemail: this.props.from,
        };
        if (this.props.scheduledtime !== null) {
          emailObj.sendat = this.props.scheduledtime;
        }
        if (subjectObj.numMatches > 0) {
          emailObj.baseSubject = subject;
        }
        const fields = [...bodyObj.emptyFields, ...subjectObj.emptyFields];
        if (fields.length > 0) {
          emptyFields = [
          ...emptyFields,
          {
            email: contact.email,
            fields: fields
          }
          ];
        }
        acc.push(emailObj);
      }
      return acc;
    }, []);
    return {contactEmails, emptyFields};
  }


  _sendGeneratedEmails(contactEmails) {
    this.props.postEmails(contactEmails)
    .then(
      _ => this.refs.preview.show(),
      err => {
        alertify.alert(err.toString());
      });
  }

  _checkEmailDupes() {
    return new Promise((resolve, reject) => {
      const {selectedContacts} = this.props;
      // check dupes
      let seen = {};
      let dupMap = {};
      let dupes = [];
      selectedContacts.map(contact => {
        if (isEmpty(contact.email)) return;
        if (seen[contact.email]) {
          dupes.push(contact.id);
          dupMap[contact.email] = true;
        }
        else seen[contact.email] = true;
      });

      if (Object.keys(dupMap).length > 0) {
        let cancelDelivery = false;
        alertify.confirm(
          'Duplicate Email Warning',
          `We found email duplicates selected: ${Object.keys(dupMap).join(', ')}. Are you sure you want to continue?`,
          () => resolve(true),
          () => reject(dupMap)
          );
      } else {
        resolve(true);
      }
    })
  }

  _onPreviewEmailsClick() {
    const {selectedContacts} = this.props;
    const {subject, body} = this.state;

    if (selectedContacts.length === 0) {
      alertify.alert(`Contact Selection Error`, `You didn't select any contact to send this email to.`, function() {});
      return;
    }
    
    let validEmailContacts = [];
    let invalidEmailContacts = [];
    selectedContacts.map(contact => {
      if (contact.email !== null && contact.email.length > 0 && isEmail(contact.email)) validEmailContacts.push(contact);
      else invalidEmailContacts.push(contact);
    });
    const {contactEmails, emptyFields} = this.getGeneratedHtmlEmails(validEmailContacts, subject, body);

    const validators = [
    {
      validate: _ => emptyFields.length > 0,
      title: `Empty properties found. Are you sure you want to continue?`,
      message: `Found ${emptyFields.length} contacts with empty selected property: ${emptyFields.map(({email, fields}) => `${email}:[${fields.join(', ')}]`).join(', ')}`
    },
    {
      validate: _ => invalidEmailContacts.length > 0,
      title: `Invalid Email Addresses Found. Would you like to ignore these and continue with valid emails?`,
      message: `Found ${invalidEmailContacts.length} email(s) with invalid format: ${invalidEmailContacts.map(contact => contact.email).join(',')}.`,
    },
    {
      validate: _ => subject.length === 0,
      title: `Empty Field Warning`,
      message: `Your subject is empty. Are you sure you want to send this email?`,
    },
    {
      validate: _ => body.length === 0,
      title: `Empty Field Warning`,
      message: `Your subject is empty. Are you sure you want to send this email?`,
    },
    // {
    //   validate: _ => selectedContacts.length > 400,
    //   title: 'Processing',
    //   message: `Sending >400 emails might take a minute to process. Please be patient while we generate Preview of those emails.`,
    // }
    ];

    Promise.resolve()
    .then(_ =>
      new Promise((resolve, reject) => {
        if (emptyFields.length > 0) {
          console.log(emptyFields);
          alertify.confirm(
            `Empty properties found. Are you sure you want to continue?`,
            `Found ${emptyFields.length} contacts with empty selected property: ${emptyFields.map(({email, fields}) => `${email}:[${fields.join(', ')}]`).join(', ')}`,
            resolve,
            reject
            );
          } else {
            resolve();
          }
        })
      )
    .then(_ =>
      new Promise((resolve, reject) => {
        if (invalidEmailContacts.length > 0) {
          alertify.confirm(
            `Invalid Email Addresses Found`,
            `Would you like to ignore these and continue with valid emails? Found ${invalidEmailContacts.length} email(s) with invalid format: ${invalidEmailContacts.map(contact => contact.email).join(',')}.`,
            resolve,
            reject
            );
        } else {
          resolve();
        }
      })
    )
    .then(_ =>
      new Promise((resolve, reject) => {
        if (subject.length > 0 || body.length > 0) {
          alertify.confirm(
            `Empty Field Warning`,
            `Your subject or body is empty. Are you sure you want to send this email?`,
            resolve,
            reject
            );
        } else {
          resolve();
        }
      })
    )
    .then(_ => {
      console.log('SENDING EMAILS');
      if (contactEmails.length > 0) this.sendGeneratedEmails(contactEmails);
    })
    .catch(_ => {
      console.log('CANCELLED');
    });

  }

  _onClose() {
    if (this.state.dirty) {
      alertify.promisifyConfirm(
        'Are you sure?',
        'Closing the editor will cause your subject/body to be discarded.',
        )
      .then(this.props.onClose)
      .catch(err => {});
    } else {
      this.props.onClose();
    }
  }

  render() {
    const state = this.state;
    const props = this.props;
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
        {!state.isPreveiwOpen && props.isImageReceiving &&
          <PauseOverlay message='Image is loading.'/>}
        {state.minimized &&
          <MinimizedView toggleMinimize={this.toggleMinimize}/>}
          <FileWrapper open={props.isAttachmentPanelOpen} onRequestClose={props.onAttachmentPanelClose}/>
          <Paper style={Object.assign({}, emailPanelWrapper, {display: state.minimized ? 'none' : 'block'})} zDepth={2}>
            <div className='RichEditor-root' style={styles.emailPanel}>
              <div>
                <FontIcon style={styles.smallIcon} color='lightgray' hoverColor='gray' onClick={this.onClose} className='fa fa-times pointer'/>
                <FontIcon style={styles.smallIcon} color='lightgray' hoverColor='gray' onClick={this.toggleMinimize} className='fa fa-minus pointer'/>
                <div
                onClick={props.onAttachmentPanelOpen}
                className='pointer'
                style={Object.assign({}, styles.attachTooltip, {display: (props.files && props.files.length > 0) ? 'block' : 'none'})}
                >
                  <a data-tip data-for='attachmentsTip' style={{fontSize: '0.8em', color: 'darkgray'}}>File{props.files.length > 1 && 's'} Attached</a>
                </div>
              </div>
              <div className='vertical-center'>
                <span className='text'>Emails are sent from: </span>
                <span className='text' style={{backgroundColor: props.from !== props.person.email && blue50, margin: '0 3px', padding: '0 3px'}}>{props.from}</span>
              {props.isImageReceiving &&
                <FontIcon style={{margin: '0 3px', fontSize: '14px'}} color={grey800} className='fa fa-spin fa-spinner'/>}
              </div>
              <BasicHtmlEditor
              listId={props.listId}
              fieldsmap={state.fieldsmap}
              width={styles.emailPanel.width}
              bodyHtml={state.bodyHtml}
              subjectHtml={state.subjectHtml}
              onBodyChange={this.updateBodyHtml}
              onSubjectChange={this.onSubjectChange}
              debounce={500}
              person={props.person}
              >
                <div style={{backgroundColor: '#ffffff'}} className='vertical-center'>
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
                    onClick={this.onSaveCurrentTemplateClick}
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
                  onClick={this.onEmailSendClick}
                  tooltip='Preview then Send'
                  tooltipPosition='top-left'
                  iconStyle={{color: '#ffffff'}}
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
          afterOpen={_ => this.setState({isPreveiwOpen: true})}
          afterClose={_ => this.setState({isPreveiwOpen: false})}
          ref='preview'
          title='Preview'>
            <PreviewEmails
            contacts={props.selectedContacts}
            fieldsmap={state.fieldsmap}
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
  const person = state.personReducer.person;
  let fromEmail = get(state, `emailDraftReducer[${props.listId}].from`) || state.personReducer.person.email;
  if (person.outlook) fromEmail = person.outlookusername;
  let emailsignature;
  if (fromEmail === person.email) emailsignature = person.emailsignature || null;
  else emailsignature = person.emailsignatures !== null ? find(person.emailsignatures, sign => JSON.parse(sign).email === fromEmail) : null;
  return {
    person,
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
    emailsignature: person.emailsignature || null,
    cc: get(state, `emailDraftReducer[${props.listId}].cc`) || [],
    bcc: get(state, `emailDraftReducer[${props.listId}].bcc`) || [],
    from: fromEmail,
    isImageReceiving: state.emailImageReducer.isReceiving,
    files: state.emailAttachmentReducer.attached,
    isAttachmentPanelOpen: state.emailDraftReducer.isAttachmentPanelOpen,
    emailsignature,
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
    postBatchEmails: emails => dispatch(stagingActions.bulkSendStagingEmails(emails)),
    postBatchEmailsWithAttachments: emails => dispatch(stagingActions.postBatchEmailsWithAttachments(emails)),
    initializeEmailDraft: _ => dispatch({type: 'INITIALIZE_EMAIL_DRAFT', listId: props.listId, email: props.person.email}),
    onAttachmentPanelClose: _ => dispatch({type: 'TURN_OFF_ATTACHMENT_PANEL'}),
    onAttachmentPanelOpen: _ => dispatch({type: 'TURN_ON_ATTACHMENT_PANEL'}),
    saveEditorState: editorState => dispatch({type: 'SET_EDITORSTATE', editorState}),
    turnOnTemplateChange: (changeType, entityType) => dispatch({type: 'TEMPLATE_CHANGE_ON', changeType, entityType}),
    setBodyHtml: bodyHtml => dispatch({type: 'SET_BODYHTML', bodyHtml})
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
