import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {ToggleableEditInputHOC, ToggleableEditInput} from '../ToggleableEditInput';
import {fromJS, is} from 'immutable';
import {getInviteCount} from './actions';

import {grey500, cyan500, blueGrey900} from 'material-ui/styles/colors';
import Avatar from 'material-ui/Avatar';
import Toggle from 'material-ui/Toggle';
import RaisedButton from 'material-ui/RaisedButton';
import Invite from './Invite.react';
import Textarea from 'react-textarea-autosize';

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
        />}
    </ToggleableEditInputHOC>);
}

const inputHeight = {
  height: 60
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
     /* <div className='row vertical-center' style={inputHeight}>
          <div className='large-4 medium-4 columns'>
            <span style={spanStyle}>Instagram</span>
          </div>
          <div className='large-4 medium-8 columns'>
            {person.instagramid.length === 0 ?
              <IconButton
              iconClassName='fa fa-instagram'
              iconStyle={{color: grey600}}
              tooltip='Add'
              onClick={_ => {window.location.href = 'https://tabulae.newsai.org/api/internal_auth/instagram';}}
              /> :
              <span style={{color: grey600}}>---  Filled  ---</span>}
          </div>
          <div className='large-4 small-12 columns'>
            {person.instagramid.length === 0 && <span style={{color: grey600, fontSize: '0.8em'}}>To track Instagram feeds, you must authenticate with your Instagram account!</span>}
          </div>
        </div>*/
    const toggled = state.newPerson.get('getdailyemails');
    return (
      <div>
        <div className='row horizontal-center' style={{marginTop: 60, marginBottom: 10}}>
          <h4>Settings</h4>
        </div>
        <div className='row horizontal-center'>
          <div className='large-6 medium-8 small-12 columns'>
            <div className='row vertical-center' style={inputHeight}>
              <div className='large-4 medium-4 columns'>
                <span style={spanStyle}>First Name</span>
              </div>
              <div className='large-6 medium-8 columns'>
                <ControlledInput name={person.firstname} onBlur={value => this.setNewPerson('firstname', value)} />
              </div>
            </div>
            <div className='row vertical-center' style={inputHeight}>
              <div className='large-4 medium-4 columns'>
                <span style={spanStyle}>Last Name</span>
              </div>
              <div className='large-6 medium-8 columns'>
                <ControlledInput name={person.lastname} onBlur={value => this.setNewPerson('lastname', value)} />
              </div>
            </div>
            <div className='row vertical-center' style={inputHeight}>
              <div className='large-4 medium-4 columns'>
                <span style={spanStyle}>Email</span>
              </div>
              <div className='large-6 medium-8 columns'>
                <span className='print' style={{marginLeft: 5, marginRight: 5, width: 500, fontSize: '1.2em'}}>{person.email}</span>
              </div>
            </div>
            <div className='row vertical-center' style={inputHeight}>
              <div className='large-4 medium-4 columns'>
                <span style={spanStyle}>Password</span>
              </div>
              <div className='large-6 medium-8 columns'>
                {person.googleid > 0 ?
                  <span className='print' style={{marginLeft: 5, marginRight: 5, width: 500, fontSize: '1.2em'}}>Logged in with Google</span> :
                  <RaisedButton
                  label='Change Password'
                  labelStyle={{textTransform: 'none'}}
                  onClick={_ => (window.location.href = 'https://tabulae.newsai.org/api/auth/changepassword')}
                  />}
              </div>
            </div>
            <div className='row vertical-center' style={inputHeight}>
              <div className='large-4 medium-4 columns'>
                <span style={spanStyle}>Subscribe to Emails</span>
              </div>
              <div className='large-8 medium-8 columns'>
                <Toggle toggled={state.newPerson.get('getdailyemails')} onToggle={_ => this.setNewPerson('getdailyemails', !toggled)}/>
              </div>
            </div>
            {/*<div className='row vertical-center' style={inputHeight}>
              <div className='large-4 medium-4 columns'>
                <span style={spanStyle}>Email Signature</span>
              </div>
              <div className='large-8 medium-8 columns'>
                <Textarea
                value={state.newPerson.get('emailsignature')}
                onChange={e => this.setNewPerson('emailsignature', e.target.value)}
                maxRows={7}
                />
              </div>
            </div>*/
          }
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
