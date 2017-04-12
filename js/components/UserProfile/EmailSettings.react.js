import React, {Component} from 'react';
import {connect} from 'react-redux';
import {fromJS, is} from 'immutable';
import {grey500} from 'material-ui/styles/colors';
import EmailSignatureEditor from './EmailSignatureEditor.react';
import ConnectToThirdPartyEmailService from './ConnectToThirdPartyEmailService.react';
import Toggle from 'material-ui/Toggle';
import FlatButton from 'material-ui/FlatButton';
import SMTPSettings from './SMTPSettings.react';
import AddMultipleEmails from './AddMultipleEmails.react';
import EmailItem from './EmailItem.react';
import Paper from 'material-ui/Paper';

import {actions as loginActions} from 'components/Login';

const inputHeight = {
  height: 45,
  margin: '5px 0'
};

const spanStyle = {
  color: grey500,
  marginRight: 15,
  float: 'right'
};

const Divider = props => <div style={{width: '100%', borderBottom: `1px solid ${grey500}`}}></div>;

const Panel = props => {
  return (
    <Paper className={props.className} zDepth={1} style={{margin: '5px 0'}}>
      <div style={{padding: 10}}>
        <div className='vertical-center'>
          <span style={{fontSize: '1.2em', color: grey500}}>{props.title}</span>
        </div>
        <div style={{margin: '15px 10px'}}>
          {props.children}
        </div>
      </div>
    </Paper>);
};

const styles = {
  item: {
    margin: '15px 5px'
  }
};

class EmailSettings extends Component {
  constructor(props) {
    super(props);
    this.setNewPerson = (key, value) => this.setState({newPerson: this.state.newPerson.set(key, value)}, this.updatePerson);
    this.state = {
      immuperson: fromJS(this.props.person),
      newPerson: fromJS(this.props.person),
    };
    this.props.getEmailMaxAllowance();
    this.updatePerson = this._updatePerson.bind(this);
  }

  componentWillUnmount() {
    this.updatePerson();
  }

  _updatePerson() {
    if (!is(this.state.immuperson, this.state.newPerson)) {
      const newPerson = this.state.newPerson;
      const person = {
        getdailyemails: newPerson.get('getdailyemails'),
        emailsignature: newPerson.get('emailsignature'),
        firstname: newPerson.get('firstname'),
        lastname: newPerson.get('lastname'),
        externalemail: newPerson.get('externalemail')
      };
      this.props.patchPerson(person);
    }
  }

  render() {
    const {person} = this.props;
    const state = this.state;
    const props = this.props;
    return (
      <div style={{margin: 50}}>
        <Panel className='row' title='Daily Email Subscription'>
          <div className='vertical-center'>
            <div>
              <span style={spanStyle}>Receive a daily email of feed activity at 8AM</span>
            </div>
            <div>
              <Toggle
              toggled={state.newPerson.get('getdailyemails')}
              onToggle={_ => this.setNewPerson('getdailyemails', !state.newPerson.get('getdailyemails'))}
              />
            </div>
          </div>
        </Panel>
        <Panel className='row' title='Integrations'>
          <span className='smalltext'>By default, we use a 3rd-party email service provider Sendgrid to deliver your emails. If you would like for us to deliver your emails through a different service, then you can enable those integrations here.</span>
        {person.googleid &&
          <div className='vertical-center' style={styles.item}>
            <span style={spanStyle}>Gmail</span>
            <div>
              {!person.externalemail && (person.gmail ?
                <FlatButton
                secondary
                label='Remove'
                onClick={_ => (window.location.href = 'https://tabulae.newsai.org/api/auth/remove-gmail')}
                /> :
                <ConnectToThirdPartyEmailService
                serviceName='Gmail'
                title='Connect to Gmail'
                href='https://tabulae.newsai.org/api/auth/gmail'
                />)
            }
              {person.smtpvalid && person.externalemail && <span>Connected via SMTP</span>}
            </div>
          </div>}
        {person.googleid &&
          <div className='vertical-center' style={styles.item}>
            <span style={spanStyle}>Outlook</span>
            <div>
              {!person.externalemail && (person.outlook ?
                <FlatButton
                secondary
                label='Remove'
                onClick={_ => (window.location.href = 'https://tabulae.newsai.org/api/auth/remove-outlook')}
                /> :
                <ConnectToThirdPartyEmailService
                serviceName='Outlook'
                title='Connect to Outlook'
                href='https://tabulae.newsai.org/api/auth/outlook'
                />)
            }
              {person.smtpvalid && person.externalemail && <span>Connected via SMTP</span>}
            </div>
          </div>}
          <div className='vertical-center' style={styles.item}>
            <span style={spanStyle}>SMTP Server</span>
            <div>
          {(person.gmail || props.outlook) ? <span>Connected to Gmail/Outlook</span> : person.smtpvalid ?
              <Toggle
              toggled={state.newPerson.get('externalemail')}
              onToggle={_ => this.setNewPerson('externalemail', !state.newPerson.get('externalemail'))}
              /> :
              <SMTPSettings/>}
            </div>
          </div>
        </Panel>
        <Panel className='row' title='Add Multiple Emails'>
          <div className='vertical-center' style={styles.item}>
            <span style={spanStyle}>Add Emails</span>
            <AddMultipleEmails/>
          </div>
        {props.person.sendgridemails !== null &&
          <div className='vertical-center' style={styles.item}>
            <span style={spanStyle}>Currently Connected</span>
          {props.person.sendgridemails.map(email =>
            <EmailItem key={email} email={email}/>
            )}
          </div>}
        </Panel>
        <Panel className='row' title='Custom Email Signatures'>
          <span className='smalltext'>Select the email that you'd like to attach the signature to</span>
          <div style={{height: 210}}>
            <span style={spanStyle}>Email Signature</span>
            <EmailSignatureEditor/>
          </div>
        </Panel>
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    person: state.personReducer.person,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    patchPerson: body => dispatch(loginActions.patchPerson(body)),
    getEmailMaxAllowance: () => dispatch(loginActions.getEmailMaxAllowance())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailSettings);
