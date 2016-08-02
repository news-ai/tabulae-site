import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import EmailPanel from './EmailPanel.react';
import {stateToHTML} from 'draft-js-export-html';
import SkyLight from 'react-skylight';
import * as actionCreators from '../../actions/AppActions';
import PreviewEmailContent from './PreviewEmailContent.react';

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


class EmailPanelWrapper extends Component {
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
    this._processEmails = this._processEmails.bind(this);
    this._sendAllEmails = this._sendAllEmails.bind(this);
    this._setSubjectLine = (editorState) => {
      const subject = editorState.getCurrentContent().getBlocksAsArray()[0].getText();
      this.setState({ subject });
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
    let newHtml = html;
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
        const subject = this.state.subject;
        const body = this._replaceAll(this.state.body, selectedContacts[i]);
        contactEmails.push({
          to: contact.email,
          subject: subject,
          body: body
        });
      }
    });
    // return contactEmails;
    dispatch(actionCreators.postBatchEmails(contactEmails))
    .then( _ => this.refs.preview.show());
    // console.log(contactEmails);
  }

  _showStagingEmails() {
    const { dispatch } = this.props;
    dispatch(actionCreators.getStagedEmails())
    .then( _ => this.refs.preview.show());
  }

  _sendAllEmails() {
    const { previewEmails, dispatch } = this.props;
    previewEmails.map( email => {
      if (email.body.length > 0 && !email.issent) {
        dispatch(actionCreators.sendEmail(email.id));
      }
    });
  }

  render() {
    const { previewEmails, isReceiving, dispatch, stagingReducer } = this.props;
    console.log(previewEmails);
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
        >Preview</button>
        <button onClick={this._showStagingEmails}>Show Staging Emails</button>
        <SkyLight hideOnOverlayClicked ref='preview' title='Preview'>
          {
            (isReceiving || previewEmails.length === 0) ? <span>LOADING..</span> :
            <div>
              <button onClick={this._sendAllEmails}>Send All</button>
            {
              previewEmails.map( pEmail => {
                const email = stagingReducer[pEmail.id];

                if (email.body.length === 0 || email.issent) return null;
                return (
                  <div>
                    <PreviewEmailContent
                    {...email}
                    sendEmail={ _ => dispatch(actionCreators.sendEmail(email.id))}
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
)(EmailPanelWrapper);
