import React, {Component} from 'react';
import {connect} from 'react-redux';
import {fromJS, is} from 'immutable';
import {grey500} from 'material-ui/styles/colors';
import EmailSignatureEditor from './EmailSignatureEditor.react';
import ConnectToGmail from './ConnectToGmail.react';
import Toggle from 'material-ui/Toggle';
import FlatButton from 'material-ui/FlatButton';
import SMTPSettings from './SMTPSettings.react';

import * as actionCreators from '../../actions/AppActions';

const inputHeight = {
  height: 40,
  margin: '5px 0'
};

const spanStyle = {
  color: grey500,
  marginRight: 15,
  float: 'right'
};

class EmailSettings extends Component {
  constructor(props) {
    super(props);
    this.setNewPerson = (key, value) => this.setState({newPerson: this.state.newPerson.set(key, value)});
    this.state = {
      immuperson: fromJS(this.props.person),
      newPerson: fromJS(this.props.person),
    };
  }

  componentWillUnmount() {
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
       <div className='row horizontal-center' style={{margin: '50px 0'}}>
          <div className='large-7 medium-9 small-12 columns'>
            <div className='row vertical-center' style={inputHeight}>
              <div className='large-4 medium-5 columns'>
                <span style={spanStyle}>Subscribe to Emails</span>
              </div>
              <div className='large-8 medium-7 columns'>
                <Toggle toggled={state.newPerson.get('getdailyemails')} onToggle={_ => this.setNewPerson('getdailyemails', !state.newPerson.get('getdailyemails'))}/>
              </div>
            </div>
            {person.googleid && <div className='row vertical-center' style={inputHeight}>
              <div className='large-4 medium-5 columns'>
                <span style={spanStyle}>Connect via Gmail</span>
              </div>
              <div className='large-8 medium-7 columns'>
                {person.gmail ?
                  <FlatButton
                  secondary
                  label='Remove'
                  onClick={_ => (window.location.href = 'https://tabulae.newsai.org/api/auth/remove-gmail')}
                  /> : <ConnectToGmail/>}
              </div>
            </div>}
            <div className='row vertical-center' style={inputHeight}>
              <div className='large-4 medium-5 columns'>
                <span style={spanStyle}>Connect via SMTP</span>
              </div>
              <div className='large-8 medium-7 columns'>
                {person.gmail ? <span>Connected to Gmail</span> :
                  <div className='vertical-center' style={{width: 200}}>
                    <Toggle disabled={!person.smtpvalid} toggled={state.newPerson.get('externalemail')} onToggle={_ => this.setNewPerson('externalemail', !state.newPerson.get('externalemail'))}/>
                    <SMTPSettings/>
                  </div>}
              </div>
            </div>
            <div className='row' style={{height: 210, margin: '15px 0'}}>
              <div className='large-4 medium-5 columns'>
                <span style={spanStyle}>Email Signature</span>
              </div>
              <div className='large-8 medium-7 columns'>
                <EmailSignatureEditor/>
              </div>
            </div>
          </div>
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
    patchPerson: body => dispatch(actionCreators.patchPerson(body)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailSettings);
