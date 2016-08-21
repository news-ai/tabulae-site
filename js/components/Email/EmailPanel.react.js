import React, {Component} from 'react';
import { connect } from 'react-redux';
import {stateToHTML} from 'draft-js-export-html';
import SkyLight from 'react-skylight';
import * as actionCreators from 'actions/AppActions';
import { skylightStyles } from 'constants/StyleConstants';
import alertify from 'alertifyjs';

import 'node_modules/alertifyjs/build/css/alertify.min.css';

import PreviewEmailContent from './PreviewEmailContent.react';
import EmailEditor from './EmailEditor.react';

const styles = {
  emailPanel: {
    position: 'fixed',
    bottom: 0,
    right: 0,
    zIndex: 1000,
    height: '500px',
    width: '600px'
  },
  sendButton: {
    position: 'fixed',
    zIndex: 1100,
    bottom: 20,
    right: 30
  }
};

alertify.defaults.glossary.title = 'Oops';

class EmailPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subject: '',
      body: '',
      matchfields: ['firstname', 'lastname', 'email'].concat(this.props.customfields)
    };
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
    this._setBody = (editorState) => {
      this.setState({ body: this._convertToHtml(editorState) });
    };
    this._getGeneratedHtmlEmails = this._getGeneratedHtmlEmails.bind(this);
    this._sendGeneratedEmails = this._sendGeneratedEmails.bind(this);
  }

  _convertToHtml(editorState) {
    const content = editorState.getCurrentContent();
    return stateToHTML(content);
  }


  _replaceAll(html, contact) {
    const { matchfields } = this.state;
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
        contactEmails.push({
          to: contact.email,
          subject: subject,
          body: replacedBody
        });
      }
    });
    return contactEmails;
  }

  _sendGeneratedEmails(contactEmails) {
    this.props.dispatch(actionCreators.postBatchEmails(contactEmails))
    .then( _ => this.refs.preview.show());
  }

  _onPreviewEmailsClick() {
    const { selectedContacts } = this.props;
    const { subject, body } = this.state;
    const contactEmails = this._getGeneratedHtmlEmails(selectedContacts, subject, body);
    if (selectedContacts.length === 0) {
      alertify.alert(`You didn't select any contact to send this email to.`);
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
    const { dispatch } = this.props;
    dispatch(actionCreators.getStagedEmails())
    .then( _ => this.refs.preview.show());
  }

  _onSendAllEmailsClick() {
    const { previewEmails } = this.props;
    previewEmails.map( email => {
      if (email.body.length > 0 && !email.issent) {
        this._onSendEmailClick(email.id);
      }
    });
  }

  _onSendEmailClick(id) {
    const { dispatch } = this.props;
    dispatch(actionCreators.sendEmail(id))
    .then( _ => alertify.success(`Email sent.`));
  }

  render() {
    const { previewEmails, isReceiving, stagingReducer } = this.props;
    // add this button to fetch all staged emails for debugging purposes
    // <button onClick={this._showStagingEmails}>Show Staging Emails</button>
    return (
      <div>
        <EmailEditor
        style={styles.emailPanel}
        _setSubjectLine={this._setSubjectLine}
        _setBody={this._setBody}
        />
        <button
        style={styles.sendButton}
        onClick={this._onPreviewEmailsClick}
        >Preview</button>
        <SkyLight
        overlayStyles={skylightStyles.overlay}
        dialogStyles={skylightStyles.dialog}
        hideOnOverlayClicked
        ref='preview'
        title='Preview'>
          {
            (isReceiving || previewEmails.length === 0) ? <span>LOADING..</span> :
            <div>
              <button onClick={this._onSendAllEmailsClick}>Send All</button>
            {
              previewEmails.map( (pEmail, i) => {
                const email = stagingReducer[pEmail.id];

                if (email.body.length === 0 || email.issent) return null;
                return (
                  <div>
                    <PreviewEmailContent
                    key={i}
                    {...email}
                    sendEmail={ _ => this._onSendEmailClick(email.id)}
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
    return {
      isReceiving: state.stagingReducer.isReceiving,
      previewEmails: state.stagingReducer.isReceiving ? [] : state.stagingReducer.previewEmails,
      stagingReducer: state.stagingReducer
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
