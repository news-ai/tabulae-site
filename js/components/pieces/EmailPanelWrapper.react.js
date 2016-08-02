import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import EmailPanel from './EmailPanel.react';
import {stateToHTML} from 'draft-js-export-html';
import {
  Modifier
} from 'draft-js';

const styles = {
  emailPanel: {
    position: 'fixed',
    bottom: 0,
    right: 0,
    zIndex: 100,
    height: '500px',
    width: '600px'
  },
  sendButton: {
    position: 'fixed',
    zIndex: 110,
    bottom: 20,
    right: 30
  }
};

const CURLY_REGEX = /{([^}]+)}/g;

class EmailPanelWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subject: '',
      body: '',
      matchfields: ['firstname', 'lastname', 'email'].concat(this.props.customfields)
    };
    this._convertToHtml = this._convertToHtml.bind(this);
    this._replaceAll = this._replaceAll.bind(this);
    this._sendEmail = this._sendEmail.bind(this);
    this._setSubjectLine = (editorState) => {
      this.setState({ subject: this._convertToHtml(editorState) });
    };
    this._setBody = (editorState) => {
      this.setState({ body: this._convertToHtml(editorState) });
    };
  }

  _convertToHtml(editorState) {
    const content = editorState.getCurrentContent();
    return stateToHTML(content);
  }

  _replaceAll(html, contact) {
    const { matchfields } = this.state;
    let matchArr, fullmatch, match, newHtml;
    newHtml = html;
    while ((matchArr = CURLY_REGEX.exec(newHtml)) !== null) {
      fullmatch = matchArr[0];
      match = matchArr[1];

      if (matchfields.some( field => field === match)) {
        const key = matchfields.find( field => field === match);
        if (contact[key] && contact[key] !== null) {
          newHtml = newHtml.slice(0, matchArr.index) +
                    contact[key] +
                    newHtml.slice(matchArr.index + fullmatch.length, newHtml.length + 1);
        }
      }
    }
    return newHtml;
  }

  _sendEmail() {
    const { customfields, selectedContacts } = this.props;
    console.log(selectedContacts);
    this._replaceAll(this.state.subject, selectedContacts[0]);
    this._replaceAll(this.state.body, selectedContacts[0]);
  }

  render() {
    const { customfields, selectedContacts } = this.props;
    console.log(selectedContacts);
    return (
      <div>
        <EmailPanel
        style={styles.emailPanel}
        _setSubjectLine={this._setSubjectLine}
        _setBody={this._setBody}
        />
        <button
        style={styles.sendButton}
        onClick={this._sendEmail}
        >Send</button>
      </div>
    );
  }
}

export default EmailPanelWrapper;