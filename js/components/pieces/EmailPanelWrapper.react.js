import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import EmailPanel from './EmailPanel.react';
import {stateToHTML} from 'draft-js-export-html';
import * as actionCreators from '../../actions/AppActions';

String.prototype.replaceAll = function(str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
};
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
    this._processEmails = this._processEmails.bind(this);
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
    let newHtml = '';
    matchfields.map( field => {
      if (contact[field] && contact[field] !== null) {
        newHtml = newHtml.replace('{' + field + '}', contact[field]);
      }
    });
    return newHtml;
  }

  _processEmails() {
    const { selectedContacts, dispatch } = this.props;
    let contactEmails = [];
    selectedContacts.map( (contact, i) => {
      if (contact && contact !== null) {
        const subject = this._replaceAll(this.state.subject, selectedContacts[i]);
        const body = this._replaceAll(this.state.body, selectedContacts[i]);
        contactEmails.push({
          to: contact.email,
          subject: subject,
          body: body
        });
      }
    });
    // return contactEmails;
    // dispatch(actionCreators.postBatchEmails(contactEmails));
    console.log(contactEmails);
  }

  render() {
    // const { customfields, selectedContacts } = this.props;
    return (
      <div>
        <EmailPanel
        style={styles.emailPanel}
        _setSubjectLine={this._setSubjectLine}
        _setBody={this._setBody}
        />
        <button
        style={styles.sendButton}
        onClick={this._processEmails}
        >Send</button>
      </div>
    );
  }
}

const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: action => dispatch(action)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EmailPanelWrapper);
