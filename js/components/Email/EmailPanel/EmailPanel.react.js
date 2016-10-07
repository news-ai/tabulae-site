import React, {Component} from 'react';
import {connect} from 'react-redux';
import Radium from 'radium';
import SkyLight from 'react-skylight';
import * as actionCreators from 'actions/AppActions';
import {skylightStyles} from 'constants/StyleConstants';
import alertify from 'alertifyjs';

import 'node_modules/alertifyjs/build/css/alertify.min.css';

import PreviewEmails from '../PreviewEmails';

import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import IconMenu from 'material-ui/IconMenu';
import SelectField from 'material-ui/SelectField';
import Paper from 'material-ui/Paper';
import BasicHtmlEditor from './BasicHtmlEditor.react';

import {grey50} from 'material-ui/styles/colors';
// import PopoverMenu from '../../pieces/PopoverMenu.react';
const iconStyle = {
  color: 'lightgray',
  ':hover': {
    color: 'gray',
    cursor: 'pointer'
  }
};

const emailIconStyle = Object.assign({}, iconStyle, {
  float: 'right',
  margin: '2px'
});


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

function PlainMinimizedView(props) {
  return (
      <Paper zDepth={2} style={{
        width: 300,
        height: 50,
        backgroundColor: grey50,
        zIndex: 200,
        display: 'inline-block',
        textAlign: 'center'
      }}>
        <i
        style={[iconStyle]}
        key={props.name}
        className='fa fa-chevron-up fa-3x'
        aria-hidden='true'
        onClick={props.toggleMinimize}
        />
      </Paper>);
}

const MinimizedView = Radium(PlainMinimizedView);

class EmailPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subject: '',
      bodyEditorState: null,
      fieldsmap: [],
      currentTemplateId: 0,
      bodyHtml: null,
      subjectHtml: null,
      minimized: false
    };
    this.toggleMinimize = _ => this.setState({minimized: !this.state.minimized});
    this.updateBodyHtml = (html) => this.setState({body: html});
    this.handleTemplateValueChange = this._handleTemplateValueChange.bind(this);
    this._replaceAll = this._replaceAll.bind(this);
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
  }

  componentWillReceiveProps(nextProps) {
    // add immutable here
    const fieldsmap = nextProps.fieldsmap;
    this.setState({fieldsmap});
  }

  _onArchiveTemplate() {
    this.props.toggleArchiveTemplate(this.state.currentTemplateId)
    .then(_ => this._handleTemplateValueChange(null, null, 0));
  }

  _handleTemplateValueChange(event, index, value) {
    if (value !== 0) {
      const template = this.props.templates.find(tmp => value === tmp.id);
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
    fieldsmap.map(field => {
      if (contact[field.value] && contact[field.value] !== null) {
        newHtml = newHtml.replace(new RegExp('\{' + field.name + '\}', 'g'), contact[field.value]);
      }
    });
    return newHtml;
  }

  _getGeneratedHtmlEmails(selectedContacts, subject, body) {
    let contactEmails = [];
    selectedContacts.map( (contact, i) => {
      if (contact && contact !== null) {
        const replacedBody = this._replaceAll(body, selectedContacts[i]);
        const replacedSubject = this._replaceAll(subject, selectedContacts[i]);
        contactEmails.push({
          listid: this.props.listId,
          to: contact.email,
          subject: replacedSubject,
          body: replacedBody,
          contactid: contact.id,
          templateid: this.state.currentTemplateId
        });
      }
    });
    return contactEmails;
  }

  _sendGeneratedEmails(contactEmails) {
    this.props.dispatch(actionCreators.postBatchEmails(contactEmails))
    .then(_ => this.refs.preview.show());
  }

  _onPreviewEmailsClick() {
    const {selectedContacts} = this.props;
    const {subject, body} = this.state;
    const contactEmails = this._getGeneratedHtmlEmails(selectedContacts, subject, body);
    if (selectedContacts.length === 0) {
      alertify.alert(`You didn't select any contact to send this email to.`);
      return;
    }
    if (selectedContacts.some(contact => contact.email.length === 0 || contact.email === null)) {
      alertify.alert(`You selected contacts without email field filled. We can't send emails to contacts with empty email field.`);
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
          {state.minimized && <MinimizedView color='red' toggleMinimize={this.toggleMinimize} name={1} />}
          </div>
          <Paper style={emailPanelWrapper} zDepth={2}>
            <div className='RichEditor-root' style={styles.emailPanel}>
              <div>
                <i
                style={[emailIconStyle]}
                key='email-fa-times'
                className='fa fa-times'
                aria-hidden='true'
                onClick={_ => props.onClose()}
                />
                <i
                style={[emailIconStyle]}
                key='email-fa-minus'
                className='fa fa-minus'
                aria-hidden='true'
                onClick={this.toggleMinimize}
                />
              </div>
              <span>Emails are sent from: {props.person.email}</span>
              <BasicHtmlEditor
              fieldsmap={state.fieldsmap}
              width={styles.emailPanel.width}
              bodyHtml={state.bodyHtml}
              subjectHtml={state.subjectHtml}
              onBodyChange={html => this.updateBodyHtml(html) }
              onSubjectChange={this.onSubjectChange}
              debounce={500}
              person={props.person}
              >
                <div>
                  <SelectField value={state.currentTemplateId} onChange={this.handleTemplateValueChange}>
                  {templateMenuItems}
                  </SelectField>
                  <IconMenu
                  iconButtonElement={<IconButton tooltipPosition='top-right' tooltip='Templates' iconClassName='fa fa-cogs'/>}
                  anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                  targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
                  >
                    <MenuItem
                    disabled={state.currentTemplateId ? false : true}
                    onClick={_ => props.onSaveCurrentTemplateClick(state.currentTemplateId, state.subject, state.body)}
                    primaryText='Save Text to Existing Template' />
                    <MenuItem onClick={this.onSaveNewTemplateClick} primaryText='Save Text as New Template' />
                    <MenuItem
                    onClick={this.onDeleteTemplate}
                    disabled={state.currentTemplateId ? false : true}
                    primaryText='Delete Template' />
                  </IconMenu>
                </div>
                <div style={{marginLeft: 100}}>
                  <RaisedButton primary label='Preview' onClick={this._onPreviewEmailsClick} />
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
            isReceiving={props.isReceiving}
            previewEmails={props.previewEmails}
            onSendAllEmailsClick={this._onSendAllEmailsClick}
            onSendEmailClick={id => props.onSendEmailClick(id).then(_ => alertify.success(`Email sent.`))}
            />
          </SkyLight>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const templates = state.templateReducer.received.map(id => state.templateReducer[id]).filter(template => !template.archived);
  return {
    isReceiving: state.stagingReducer.isReceiving,
    previewEmails: state.stagingReducer.isReceiving ? [] : state.stagingReducer.previewEmails
    .map(pEmail => state.stagingReducer[pEmail.id])
    .filter(email => !email.issent),
    stagingReducer: state.stagingReducer,
    templates: templates
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: action => dispatch(action),
    onSendEmailClick: id => dispatch(actionCreators.sendEmail(id)),
    onSaveCurrentTemplateClick: (id, subject, body) => dispatch(actionCreators.patchTemplate(id, subject, body)),
    fetchTemplates: _ => dispatch(actionCreators.getTemplates()),
    createTemplate: (name, subject, body) => dispatch(actionCreators.createTemplate(name, subject, body)),
    toggleArchiveTemplate: templateId => dispatch(actionCreators.toggleArchiveTemplate(templateId))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Radium(EmailPanel));
