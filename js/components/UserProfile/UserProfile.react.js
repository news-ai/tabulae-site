import React, {Component} from 'react';
import {connect} from 'react-redux';
import {ToggleableEditInputHOC, ToggleableEditInput} from '../ToggleableEditInput';
import {fromJS, is} from 'immutable';
import {getInviteCount} from './actions';

import {grey500, cyan500, blueGrey900} from 'material-ui/styles/colors';
import Avatar from 'material-ui/Avatar';
import Toggle from 'material-ui/Toggle';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Invite from './Invite.react';
import EmailSignatureEditor from './EmailSignatureEditor.react';
import ConnectToGmail from './ConnectToGmail.react';

import * as actionCreators from '../../actions/AppActions';

function ControlledInput(props) {
  return (
    <ToggleableEditInputHOC {...props}>
      {({onToggleTitleEdit, isTitleEditing, name, onUpdateName}) =>
      <ToggleableEditInput
        onToggleTitleEdit={onToggleTitleEdit}
        isTitleEditing={isTitleEditing}
        name={name}
        onUpdateName={onUpdateName}
        nameStyle={{fontSize: '0.9em'}}
        />}
    </ToggleableEditInputHOC>);
}

const inputHeight = {
  height: 40,
  margin: '5px 0'
};

const spanStyle = {
  color: grey500,
  marginRight: 15,
  float: 'right'
};


const InviteSteps = props => <div style={{
  display: 'flex',
  justifyContent: 'space-around',
  margin: '20px 0',
  padding: 30
}}>
  <div>
    <Avatar backgroundColor={cyan500} size={30}><strong>1</strong></Avatar>
    <span style={{color: blueGrey900, margin: '0 5px'}}>Invite friends</span>
  </div>
  <div>
    <Avatar backgroundColor={cyan500} size={30}><strong>2</strong></Avatar>
    <span style={{color: blueGrey900, margin: '0 5px'}}>5 friends set up accounts</span>
  </div>
  <div>
    <Avatar backgroundColor={cyan500} size={30}><strong>3</strong></Avatar>
    <span style={{color: blueGrey900, margin: '0 5px'}}>You get 1 month FREE. Yay!</span>
  </div>
</div>;

const staticSpanStyle = {
  marginLeft: 5, marginRight: 5, width: 500, fontSize: '0.9em'
};

class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.setNewPerson = (key, value) => this.setState({newPerson: this.state.newPerson.set(key, value)});
    this.state = {
      immuperson: fromJS(this.props.person),
      newPerson: fromJS(this.props.person),
      count: 0
    };
  }

  componentWillMount() {
    this.props.getInviteCount().then(count => {
      this.setState({count});
    });
  }

  componentWillUnmount() {
    if (!is(this.state.immuperson, this.state.newPerson)) {
      const newPerson = this.state.newPerson;
      const person = {
        firstname: newPerson.get('firstname'),
        lastname: newPerson.get('lastname'),
        getdailyemails: newPerson.get('getdailyemails'),
        emailsignature: newPerson.get('emailsignature')
      };
      this.props.patchPerson(person);
    }
  }

  render() {
    const {person} = this.props;
    const state = this.state;
    const props = this.props;

    const toggled = state.newPerson.get('getdailyemails');
    return (
      <div>
        <div className='row horizontal-center' style={{marginTop: 60, marginBottom: 10}}>
          <h4>Settings</h4>
        </div>
        <div className='row horizontal-center'>
          <div className='large-6 medium-9 small-12 columns'>
            <div className='row vertical-center' style={inputHeight}>
              <div className='large-4 medium-5 columns'>
                <span style={spanStyle}>First Name</span>
              </div>
              <div className='large-6 medium-7 columns'>
                <ControlledInput name={person.firstname} onBlur={value => this.setNewPerson('firstname', value)} />
              </div>
            </div>
            <div className='row vertical-center' style={inputHeight}>
              <div className='large-4 medium-5 columns'>
                <span style={spanStyle}>Last Name</span>
              </div>
              <div className='large-6 medium-7 columns'>
                <ControlledInput name={person.lastname} onBlur={value => this.setNewPerson('lastname', value)} />
              </div>
            </div>
            <div className='row vertical-center' style={inputHeight}>
              <div className='large-4 medium-5 columns'>
                <span style={spanStyle}>Email</span>
              </div>
              <div className='large-6 medium-7 columns'>
                <span className='print' style={staticSpanStyle}>{person.email}</span>
              </div>
            </div>
            <div className='row vertical-center' style={inputHeight}>
              <div className='large-4 medium-5 columns'>
                <span style={spanStyle}>Password</span>
              </div>
              <div className='large-6 medium-7 columns'>
                {person.googleid ?
                  <span className='print' style={staticSpanStyle}>Logged in with Google</span> :
                  <RaisedButton
                  label='Change Password'
                  labelStyle={{textTransform: 'none'}}
                  onClick={_ => (window.location.href = 'https://tabulae.newsai.org/api/auth/changepassword')}
                  />}
              </div>
            </div>
            <div className='row vertical-center' style={inputHeight}>
              <div className='large-4 medium-5 columns'>
                <span style={spanStyle}>Subscribe to Emails</span>
              </div>
              <div className='large-8 medium-7 columns'>
                <Toggle toggled={state.newPerson.get('getdailyemails')} onToggle={_ => this.setNewPerson('getdailyemails', !toggled)}/>
              </div>
            </div>
            {person.googleid && <div className='row vertical-center' style={inputHeight}>
              <div className='large-4 medium-5 columns'>
                <span style={spanStyle}>Connect to Gmail</span>
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
            <div className='row vertical-center' style={{height: 70, margin: '5px 0'}}>
              <div className='large-4 medium-5 columns'>
                <span style={spanStyle}>Email Signature</span>
              </div>
              <div className='large-8 medium-7 columns'>
                <EmailSignatureEditor/>
              </div>
            </div>
          </div>
        </div>
        <div className='row horizontal-center'>
          <div className='large-8 medium-8 small-12 columns'>
            <InviteSteps/>
            <div className='horizontal-center'>
              <span style={{fontSize: '0.8em'}}>{5 - state.count} friends away from a free month</span>
            </div>
            <div className='horizontal-center' style={{margin: '20px 0'}}>
              <Invite className='vertical-center'/>
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
    getInviteCount: _ => dispatch(getInviteCount())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
