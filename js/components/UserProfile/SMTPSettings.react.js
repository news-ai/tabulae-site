import React, {Component} from 'react';
import {connect} from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import * as actions from './actions';
import * as actionCreators from 'actions/AppActions';
import {blue600, yellow50, blue50} from 'material-ui/styles/colors';
import {
  Step,
  Stepper,
  StepLabel,
} from 'material-ui/Stepper';
import isNumeric from 'validator/lib/isNumeric';
import isURL from 'validator/lib/isURL';

const Warning = props => {
  return (
    <div style={{backgroundColor: yellow50, padding: 10, fontSize: '0.9em'}}>
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
          Please make sure the SMTP email username you connect with MATCHES with the one you are logged in with.
        </strong>
      </p>
      <p>
        Just as a reminder, you logged in with: <span style={{color: blue600}}>{props.person.email}</span>
      </p>
    </div>);
};

class SMTPSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      SMTPServer: '',
      SMTPServerErrorText: '',
      SMTPPortTLS: '',
      SMTPPortTLSErrorText: '',
      SMTPPortSSL: '',
      SMTPPortSSLErrorText: '',
      SMTPSSLTLS: false,
      IMAPServer: '',
      IMAPServerErrorText: '',
      IMAPPortTLS: '',
      IMAPPortTLSErrorText: '',
      IMAPPortSSL: '',
      IMAPPortSSLErrorText: '',
      IMAPSSLTLS: false,
      smtpusername: '',
      smtppassword: '',
      currentStep: 0 // change to 0 after
    };
    this.onSubmit = this._onSubmit.bind(this);
    this.handleAccountSubmit = this._handleAccountSubmit.bind(this);
    this.handleNext = _ => this.setState(prev => ({currentStep: prev.currentStep + 1}));
    this.handlePrev = _ => this.setState(prev => ({currentStep: prev.currentStep - 1}));
    this.onTextValueChange = this._onTextValueChange.bind(this);
  }

  _onSubmit() {
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
      SMTPServer: SMTPServer,
      SMTPPortTLS: parseInt(SMTPPortTLS, 10),
      SMTPPortSSL: parseInt(SMTPPortSSL, 10),
      SMTPSSLTLS: SMTPSSLTLS,
      IMAPServer: IMAPServer,
      IMAPPortTLS: parseInt(IMAPPortTLS, 10),
      IMAPPortSSL: parseInt(IMAPPortSSL, 10),
      IMAPSSLTLS: IMAPSSLTLS
    };
    console.log(smtpObj);
    this.props.setupSMTP(smtpObj)
    .then(_ => {
      this.props.fetchPerson();
      this.handleNext();
    })
  }

  _onTextValueChange(e, validator, field, errorMessage) {
    const value = e.target.value;
    let err = '';
    if (value.length > 0 && !validator(value)) err = errorMessage;
    this.setState({
      [field]: value,
      [`${field}ErrorText`]: err
    });
  }

  _handleAccountSubmit() {
    if (this.state.smtpusername.length === 0 || this.state.smtppassword.length === 0) {
      alert('Empty email account credentials.');
      return;
    }

    this.props.addSMTPEmail(this.state.smtpusername, this.state.smtppassword)
    .then(_ => {
      this.handleNext();
    });
  }

  render() {
    const state = this.state;
    const props = this.props;
    let actions = [
      <FlatButton label='Cancel' onClick={_ => this.setState({open: false})}/>,
    ];

    let content = <span>PLACEHOLDER</span>;
    switch (state.currentStep) {
      case 0:
        actions.push(
          <FlatButton label='Next' onClick={this.handleNext}/>
          );
        content = (
          <div>
            <Warning {...props}/>
          </div>
          );
        break;
      case 1:
        actions.push(
          <FlatButton label='Next' onClick={this.onSubmit}/>
          );
        content = (
          <div>
            <div style={{padding: 5, backgroundColor: blue50, fontSize: '0.9em'}}>
              <a href='https://www.arclab.com/en/kb/email/list-of-smtp-and-imap-servers-mailserver-list.html'>Here is a handy list</a> of common email server settings. If you don't find yours, try googling "EMAIL_PROVIDER SMTP settings".
            </div>
            <div style={{marginTop: 10}}>
              <h5>SMTP (Outgoing Mail) Settings</h5>
              <TextField value={state.SMTPServer} errorText={state.SMTPServerErrorText} onChange={e => this.onTextValueChange(e, isURL, 'SMTPServer', 'Value is not a valid URL')}
              fullWidth floatingLabelFixed hintText='e.g. smtp.gmail.com' floatingLabelText='SMTP Server'/>
              <TextField value={state.SMTPPortTLS} errorText={state.SMTPPortTLSErrorText} onChange={e => this.onTextValueChange(e, isNumeric, 'SMTPPortTLS', 'Value is not a valid URL')}
              fullWidth floatingLabelFixed hintText='e.g. 587' floatingLabelText='SMTP Port TLS'/>
              <TextField value={state.SMTPPortSSL} errorText={state.SMTPPortSSLErrorText} onChange={e => this.onTextValueChange(e, isNumeric, 'SMTPPortSSL', 'Value is not a valid URL')}
              fullWidth floatingLabelFixed hintText='e.g. 465' floatingLabelText='SMTP Port SSL'/>
              <Toggle onToggle={(e, SMTPSSLTLS) => this.setState({SMTPSSLTLS})} toggled={state.SMTPSSLTLS} label='Requires MTP SSL/TLS?' labelPosition='right'/>
            </div>
            <div style={{marginTop: 10}}>
              <h5>IMAP (Incoming Mail) Settings</h5>
              <TextField value={state.IMAPServer} errorText={state.IMAPServerErrorText} onChange={e => this.onTextValueChange(e, isURL, 'IMAPServer', 'Value is not a valid URL')}
              fullWidth floatingLabelFixed hintText='e.g. imap.gmail.com' floatingLabelText='IMAP Server'/>
              <TextField value={state.IMAPPortTLS} errorText={state.IMAPPortTLSErrorText} onChange={e => this.onTextValueChange(e, isNumeric, 'IMAPPortTLS', 'Value should be all numbers')}
              fullWidth floatingLabelFixed hintText='e.g. 143' floatingLabelText='IMAP Port TLS'/>
              <TextField value={state.IMAPPortSSL} errorText={state.IMAPPortSSLErrorText} onChange={e => this.onTextValueChange(e, isNumeric, 'IMAPPortSSL', 'Value should be all numbers')}
              fullWidth floatingLabelFixed hintText='e.g. 993' floatingLabelText='IMAP Port SSL'/>
              <Toggle onToggle={(e, IMAPSSLTLS) => this.setState({IMAPSSLTLS})} toggled={state.IMAPSSLTLS} label='Requires IMAP SSL/TLS?' labelPosition='right'/>
            </div>
          </div>);
        break;
      case 2:
        actions.push(
          <FlatButton label='Back' onClick={this.handlePrev}/>,
          );
        actions.push(
          <FlatButton label='Next' onClick={this.handleAccountSubmit}/>
          );
        content = (
          <div>
            <h5>Part 2 - Email Account Settings</h5>
            <TextField value={state.smtpusername} onChange={e => this.setState({smtpusername: e.target.value})} fullWidth floatingLabelFixed hintText='e.g. username123@yahoo.com' floatingLabelText='Username'/>
            <TextField value={state.smtppassword} onChange={e => this.setState({smtppassword: e.target.value})} fullWidth floatingLabelFixed type='password' floatingLabelText='Password'/>
          </div>
          );
        break;
      case 3:
        actions.push(
          <FlatButton label='Back' onClick={this.handlePrev}/>,
          );
        content = (
          <div>
            <FlatButton label='Verify' onClick={props.verifySMTPEmail}/>
          </div>
          );
        break;
      default:
        break;
    }
    return (
      <div>
        <Dialog autoScrollBodyContent title='SMTP Setup' modal actions={actions} open={state.open}>
          <div style={{margin: '10px 0'}}>
            <Stepper activeStep={state.currentStep}>
              <Step>
                <StepLabel>Welcome to Setup</StepLabel>
              </Step>
              <Step>
                <StepLabel>SMTP Settings</StepLabel>
              </Step>
              <Step>
                <StepLabel>Email Account Setting</StepLabel>
              </Step>
              <Step>
                <StepLabel>Verify</StepLabel>
              </Step>
            </Stepper>
            {content}
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
    setupSMTP: smtpObj => dispatch(actions.setupSMTP(smtpObj)),
    fetchPerson: _ => dispatch(actionCreators.fetchPerson()),
    addSMTPEmail: (username, password) => dispatch(actions.addSMTPEmail(username, password)),
    verifySMTPEmail: _ => dispatch(actions.verifySMTPEmail()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SMTPSettings);
