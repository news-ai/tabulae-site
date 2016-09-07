import React, {Component} from 'react';
import {connect} from 'react-redux';
import Radium from 'radium';
import {stateToHTML} from 'draft-js-export-html';
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

// import PopoverMenu from '../../pieces/PopoverMenu.react';
const iconStyle = {
  color: 'lightgray',
  float: 'right',
  margin: '2px',
  ':hover': {
    color: 'gray',
    cursor: 'pointer'
  }
};


const styles = {
  emailPanelPosition: {
    display: 'flex',
    justifyContent: 'center',
  },
  emailPanelWrapper: {
    position: 'fixed',
    zIndex: 200
  },
  emailPanel: {
    height: '600px',
    width: '600px',
    overflow: 'scroll',
  },
  sendButtonPosition: {
    position: 'absolute',
    bottom: 10,
    right: 10
  }
};

const injectCssToTags = {
  'p': 'margin: 0;font-family: arial;'
};


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
    this.updateBodyHtml = (html) => {
      // console.log(html);
      this.setState({body: html});
    };
    this.handleTemplateValueChange = this._handleTemplateValueChange.bind(this);
    this._convertToHtml = this._convertToHtml.bind(this);
    this._replaceAll = this._replaceAll.bind(this);
    this._onPreviewEmailsClick = this._onPreviewEmailsClick.bind(this);
    this.onSubjectChange = (editorState) => {
      const subject = editorState.getCurrentContent().getBlocksAsArray()[0].getText();
      this.setState({subject});
    };
    this._getGeneratedHtmlEmails = this._getGeneratedHtmlEmails.bind(this);
    this._sendGeneratedEmails = this._sendGeneratedEmails.bind(this);
    this.onSaveNewTemplateClick = this._onSaveNewTemplateClick.bind(this);
  }

  componentWillMount() {
    const {dispatch} = this.props;
    dispatch(actionCreators.getTemplates());
  }

  componentWillReceiveProps(nextProps) {
    // add immutable here
    const fieldsmap = nextProps.fieldsmap;
    this.setState({fieldsmap});
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

  _convertToHtml(editorState) {
    const content = editorState.getCurrentContent();
    return stateToHTML(content, null, injectCssToTags);
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
          body: replacedBody
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
    const {dispatch} = this.props;
    const state = this.state;
    alertify.prompt('', 'Name of new Email Template', '',
      (e, name) => dispatch(actionCreators.createTemplate(name, state.subject, state.body))
        .then(currentTemplateId => this.setState({currentTemplateId})),
      _ => alertify.error('Something went wrong.')
      );
  }

  render() {
    const props = this.props;
    const state = this.state;
    // add this button to fetch all staged emails for debugging purposes
    const templateMenuItems = props.templates.length > 0 ?
    [<MenuItem value={0} key={-1} primaryText='[Select from Templates]'/>]
    .concat(props.templates.map(
      (template, i) =>
      <MenuItem value={template.id} key={i} primaryText={template.name.length > 0 ? template.name : template.subject} />)) :
    null;

    return (
      <div style={styles.emailPanelPosition}>
        <Paper style={styles.emailPanelWrapper} zDepth={2}>
          <div className='RichEditor-root' style={styles.emailPanel}>
            <div>
              <i
              style={[iconStyle]}
              key='email-fa-times'
              className='fa fa-times'
              aria-hidden='true'
              onClick={_ => props.onClose()}
              />
              {/* TODO: open multiple instances of email and minimizable like GMail
              <i
              style={[iconStyle]}
              key='email-fa-minus'
              className='fa fa-minus'
              aria-hidden='true' />
              */}
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
                iconButtonElement={<IconButton iconClassName='fa fa-cogs'/>}
                anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
                >
                  <MenuItem
                  disabled={state.currentTemplateId ? false : true}
                  onClick={_ => this.onSaveCurrentTemplateClick(state.currentTemplateId, state.subject, state.body)}
                  primaryText='Save Text to Existing Template' />
                  <MenuItem onClick={this.onSaveNewTemplateClick} primaryText='Save Text as New Template' />
                </IconMenu>
              </div>
              <div>
                <RaisedButton labelStyle={{textTransform: 'none'}} label='Preview' onClick={this._onPreviewEmailsClick} />
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
    );
  }
}

const mapStateToProps = state => {
  const templates = state.templateReducer.received.map(id => state.templateReducer[id]);
  return {
    isReceiving: state.stagingReducer.isReceiving,
    previewEmails: state.stagingReducer.isReceiving ? [] : state.stagingReducer.previewEmails
    .map(pEmail => state.stagingReducer[pEmail.id])
    .filter(email => !email.issent),
    stagingReducer: state.stagingReducer,
    templates: state.templateReducer.received.map(id => state.templateReducer[id])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: action => dispatch(action),
    onSendEmailClick: id => dispatch(actionCreators.sendEmail(id)),
    onSaveCurrentTemplateClick: (id, subject, body) => dispatch(actionCreators.patchTemplate(id, subject, body))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Radium(EmailPanel));
