import React, {Component} from 'react';
import {connect} from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';

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
          <div>
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
  return {};
};

const mapDispatchToProps = (dispatch, props) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(SMTPSettings);
