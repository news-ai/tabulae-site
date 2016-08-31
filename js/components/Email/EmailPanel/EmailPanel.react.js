import React, {Component} from 'react';
import {connect} from 'react-redux';
import {stateToHTML} from 'draft-js-export-html';
import SkyLight from 'react-skylight';
import * as actionCreators from 'actions/AppActions';
import {skylightStyles, buttonStyle} from 'constants/StyleConstants';
import alertify from 'alertifyjs';

import 'node_modules/alertifyjs/build/css/alertify.min.css';

import PreviewEmail from '../PreviewEmail';
import EmailEditor from './EmailEditor.react';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import Popover from 'material-ui/Popover';
import MenuItem from 'material-ui/MenuItem';
import IconMenu from 'material-ui/IconMenu';
import SelectField from 'material-ui/SelectField';

// import PopoverMenu from '../../pieces/PopoverMenu.react';

const styles = {
  emailPanelWrapper: {
    display: 'flex',
    justifyContent: 'center',
    position: 'fixed',
    left: 0,
    right: 0,
    zIndex: 200
  },
  emailPanel: {
    height: '500px',
    width: '600px',
    overflow: 'scroll'
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

const options = {
  inlineStyles: {
    LINK: {element: 'a'}
  }
};

class EmailPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subject: '',
      bodyEditorState: null,
      matchfields: ['firstname', 'lastname', 'email'].concat(this.props.customfields),
      currentTemplateId: 0,
      bodyHtml: null
    };
    this.handleTemplateValueChange = this._handleTemplateValueChange.bind(this);
    this._showStagingEmails = this._showStagingEmails.bind(this);
    this._convertToHtml = this._convertToHtml.bind(this);
    this._replaceAll = this._replaceAll.bind(this);
    this._onPreviewEmailsClick = this._onPreviewEmailsClick.bind(this);
    this._onSendAllEmailsClick = this._onSendAllEmailsClick.bind(this);
    this._onSendEmailClick = this._onSendEmailClick.bind(this);
    this._setSubjectLine = (editorState) => {
      const subject = editorState.getCurrentContent().getBlocksAsArray()[0].getText();
      this.setState({ subject });
    };
    this._setBody = (editorStateInRaw) => {
      // const html = this._convertToHtml(editorState);
      // console.log(html);
      console.log(editorStateInRaw);
      this.setState({bodyEditorState: editorStateInRaw});
    };
    this._getGeneratedHtmlEmails = this._getGeneratedHtmlEmails.bind(this);
    this._sendGeneratedEmails = this._sendGeneratedEmails.bind(this);
    this.onSaveNewTemplateClick = this._onSaveNewTemplateClick.bind(this);
  }

  componentWillMount() {
    const {dispatch} = this.props;
    dispatch(actionCreators.getTemplates());
  }

  _handleTemplateValueChange(event, index, value) {
    if (value !== 0) {
      const template = this.props.templates.find(id => value);
      const bodyHtml = template.body;
      this.setState({bodyHtml});
    } else {
      this.setState({bodyHtml: null});
    }
    this.setState({currentTemplateId: value});
  }

  _convertToHtml(editorState) {
    const content = editorState.getCurrentContent();
    return stateToHTML(content, null, injectCssToTags);
  }

  _replaceAll(html, contact) {
    const {matchfields} = this.state;
    let newHtml = html;
    matchfields.map( field => {
      if (contact[field] && contact[field] !== null) {
        newHtml = newHtml.replace('{' + field + '}', contact[field]);
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
    const {subject, bodyEditorState} = this.state;
    const body = this._convertToHtml(bodyEditorState);
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

  _showStagingEmails() {
    const {dispatch} = this.props;
    dispatch(actionCreators.getStagedEmails())
    .then( _ => this.refs.preview.show());
  }

  _onSendAllEmailsClick() {
    const {previewEmails} = this.props;
    previewEmails.map(email => {
      if (email.body.length > 0 && !email.issent) {
        this._onSendEmailClick(email.id);
      }
    });
  }

  _onSendEmailClick(id) {
    const {dispatch} = this.props;
    dispatch(actionCreators.sendEmail(id))
    .then(_ => alertify.success(`Email sent.`));
  }

  _onSaveNewTemplateClick() {
    const {dispatch} = this.props;
    const state = this.state;
    dispatch(actionCreators.createTemplate(state.subject, state.body));
  }

  render() {
    const props = this.props;
    const state = this.state;
    // add this button to fetch all staged emails for debugging purposes
    // <button onClick={this._showStagingEmails}>Show Staging Emails</button>
    const templateMenuItems = props.templates.length > 0 ?
    [<MenuItem value={0} key={-1} primaryText='[Select from Templates]'/>].concat(props.templates.map((template, i) => <MenuItem value={template.id} key={i} primaryText={template.subject} />)) :
    null;

    return (
      <div>
        <div style={styles.emailPanelWrapper}>
          <EmailEditor
          body={state.bodyHtml}
          person={props.person}
          style={styles.emailPanel}
          setSubjectLine={this._setSubjectLine}
          setBody={this._setBody}>
          <SelectField value={state.currentTemplateId} onChange={this.handleTemplateValueChange}>
          {templateMenuItems}
          </SelectField>
          <IconMenu
          iconButtonElement={<IconButton iconClassName='fa fa-cogs'/>}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
          >
            <MenuItem disabled={state.currentTemplateId ? false : true} primaryText='Save Text to Existing Template' />
            <MenuItem onClick={this.onSaveNewTemplateClick} primaryText='Save Text as New Template' />
          </IconMenu>
            <RaisedButton labelStyle={{textTransform: 'none'}} label='Preview' onClick={this._onPreviewEmailsClick} />
          </EmailEditor>
        </div>
        <SkyLight
        overlayStyles={skylightStyles.overlay}
        dialogStyles={skylightStyles.dialog}
        hideOnOverlayClicked
        ref='preview'
        title='Preview'>
          {
            (props.isReceiving || props.previewEmails.length === 0) ? <span>LOADING..</span> :
            <div>
              <button style={buttonStyle} onClick={this._onSendAllEmailsClick}>Send All</button>
            {
              props.previewEmails.map( (pEmail, i) => {
                const email = props.stagingReducer[pEmail.id];
                if (email.body.length === 0 || email.issent) return null;
                return (
                  <div>
                    <PreviewEmail
                    key={i}
                    {...email}
                    sendEmail={_ => this._onSendEmailClick(email.id)}
                    />
                  </div>
                  );
              })
            }
            </div>
          }
        </SkyLight>
      </div>
    );
  }
}

const mapStateToProps = state => {
    const templates = state.templateReducer.received.map(id => state.templateReducer[id]);
    console.log(templates);
    return {
      isReceiving: state.stagingReducer.isReceiving,
      previewEmails: state.stagingReducer.isReceiving ? [] : state.stagingReducer.previewEmails,
      stagingReducer: state.stagingReducer,
      templates: state.templateReducer.received.map(id => state.templateReducer[id])
    };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: action => dispatch(action)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EmailPanel);
