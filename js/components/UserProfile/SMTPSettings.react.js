import React, {Component} from 'react';
import {connect} from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import * as actions from './actions';
import {blue600, yellow50} from 'material-ui/styles/colors';

class SMTPSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      SMTPServer: '',
      SMTPPortTLS: null,
      SMTPPortSSL: null,
      SMTPSSLTLS: false,
      IMAPServer: '',
      IMAPPortTLS: null,
      IMAPPortSSL: null,
      IMAPSSLTLS: false,
      smtpusername: '',
      smtppassword: ''
    };
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit() {
    const {
      SMTPServer,
      SMTPPortTLS,
      SMTPPortSSL,
      SMTPSSLTLS,
      IMAPServer,
      IMAPPortTLS,
      IMAPPortSSL,
      IMAPSSLTLS
    } = this.state;
    const properties = [
      'SMTPServer',
      'SMTPPortTLS',
      'SMTPPortSSL',
      'IMAPServer',
      'IMAPPortTLS',
      'IMAPPortSSL',
    ];
    if (properties.some(property => this.state[property] === null || this.state[property].length === 0)) {
      alert('Not all fields are filled');
      return;
    }

    const smtpObj = {
      SMTPServer,
      SMTPPortTLS,
      SMTPPortSSL,
      SMTPSSLTLS,
      IMAPServer,
      IMAPPortTLS,
      IMAPPortSSL,
      IMAPSSLTLS
    };
    this.props.setupSMTP(smtpObj);
  }

  render() {
    const state = this.state;
    const actions = [
      <FlatButton label='Cancel' onClick={_ => this.setState({open: false})}/>,
      <FlatButton label='Submit' onClick={_ => this.setState({open: false})}/>
    ];
    return (
      <div>
        <Dialog autoScrollBodyContent title='SMTP Setup' modal actions={actions} open={state.open}>
          <div style={{margin: '10px 0'}}>
            <div style={{backgroundColor: yellow50, padding: 10}}>
              <p>
                <span>
                  By default, Tabulae used <strong>Sendgrid</strong> to send emails.
                  By granting us permission to connect your Tabulae account to your email server,
                  <strong>we'd send emails from your SMTP email server (e.g. Yahoo, GoDaddy, etc) instead of Sendgrid</strong>.
                  You'd be able to see the emails you sent from Tabulae in your <strong>SMTP Inbox</strong>.
                </span>
              </p>
              <p>
                <span>
                  By connecting your Inbox, it means that <strong>Tabulae will have access to email information</strong> like:
                </span>
              </p>
              <ul>
                <li>which email addresses you are sending emails to</li>
                <li>which email addresses you are sending emails from</li>
                <li>the subject lines and body content of your emails</li>
              </ul>
              <p>
                <span>
                  To be sure, you can remove this integration at anytime. <strong>We will only access emails sent through Tabulae and not any other emails in your Inbox.</strong>
                </span>
              </p>
              <p>
                <strong>
                  Please make sure the SMTP Username you connect with MATCHES with the one you are logged in with.
                </strong>
              </p>
              <p>
                Just as a reminder, you logged in with: <span style={{color: blue600}}>{this.props.person.email}</span>
              </p>
            </div>
            <div style={{marginTop: 40}}>
              <h5>Part 1</h5>
              <TextField onChange={e => this.setState({SMTPServer: e.target.value})} fullWidth floatingLabelFixed hintText='e.g. smtp.gmail.com' floatingLabelText='SMTP Server'/>
              <TextField onChange={e => this.setState({SMTPPortTLS: e.target.value})} fullWidth floatingLabelFixed hintText='e.g. 123' floatingLabelText='SMTP Port TLS'/>
              <TextField onChange={e => this.setState({SMTPPortSSL: e.target.value})} fullWidth floatingLabelFixed hintText='e.g. 123' floatingLabelText='SMTP Port SSL'/>
              <Toggle onToggle={(e, SMTPSSLTLS) => this.setState({SMTPSSLTLS})} toggled={state.SMTPSSLTLS} label='SMTP SSL TLS' labelPosition='right'/>
              <TextField onChange={e => this.setState({IMAPServer: e.target.value})} fullWidth floatingLabelFixed hintText='e.g. imap.gmail.com' floatingLabelText='IMAP Server'/>
              <TextField onChange={e => this.setState({IMAPPortTLS: e.target.value})} fullWidth floatingLabelFixed hintText='e.g. 123' floatingLabelText='IMAP Port TLS'/>
              <TextField onChange={e => this.setState({IMAPPortSSL: e.target.value})} fullWidth floatingLabelFixed hintText='e.g. 123' floatingLabelText='IMAP Port SSL'/>
              <Toggle onToggle={(e, IMAPSSLTLS) => this.setState({IMAPSSLTLS})} toggled={state.IMAPSSLTLS} label='IMAP SSL TLS' labelPosition='right'/>
            </div>
            <div style={{marginTop: 40}}>
              <h5>Part 2</h5>
              <TextField onChange={e => this.setState({smtpusername: e.target.value})} fullWidth floatingLabelFixed hintText='e.g. username123' floatingLabelText='Username'/>
              <TextField onChange={e => this.setState({smtppassword: e.target.value})} fullWidth floatingLabelFixed type='password' floatingLabelText='Password'/>
            </div>
          </div>
        </Dialog>
        <FlatButton label='Connect' onClick={_ => this.setState({open: true})} primary/>
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    person: state.personReducer.person
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    setupSMTP: smtpObj => dispatch(actions.setupSMTP(smtpObj))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SMTPSettings);
