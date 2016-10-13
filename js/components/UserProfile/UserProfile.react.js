import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {ToggleableEditInputHOC, ToggleableEditInput} from '../ToggleableEditInput';
import {fromJS, is} from 'immutable';

import {grey500, grey600} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import Invite from './Invite.react';

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
  height: 50
};

const spanStyle = {
  color: grey500,
  marginRight: 15
};

class UserProfile extends Component {
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
        firstname: newPerson.get('firstname'),
        lastname: newPerson.get('lastname'),
      };
      this.props.patchPerson(person);
    }
  }

  render() {
    const {person} = this.props;
    const state = this.state;
    return (
    <div className='row horizontal-center' style={{marginTop: 60}}>
      <div className='large-6 columns'>
        <div className='row' style={{marginBottom: 20}}>
          <h4>Settings</h4>
        </div>
        <div className='row vertical-center' style={inputHeight}>
          <div className='large-4 medium-4 columns'>
            <span style={spanStyle}>First Name</span>
          </div>
          <div className='large-6 columns'>
            <ControlledInput name={person.firstname} onBlur={value => this.setNewPerson('firstname', value)} />
          </div>
        </div>
        <div className='row vertical-center' style={inputHeight}>
          <div className='large-4 medium-4 columns'>
            <span style={spanStyle}>Last Name</span>
          </div>
          <div className='large-6 columns'>
            <ControlledInput name={person.lastname} onBlur={value => this.setNewPerson('lastname', value)} />
          </div>
        </div>
        <div className='row vertical-center' style={inputHeight}>
          <div className='large-4 medium-4 columns'>
            <span style={spanStyle}>Email</span>
          </div>
          <div className='large-6 columns'>
            <span className='print' style={{marginLeft: 5, marginRight: 5, width: 500, fontSize: '1.2em'}}>{person.email}</span>
          </div>
        </div>
        <div className='row vertical-center' style={inputHeight}>
          <div className='large-4 medium-4 columns'>
            <span style={spanStyle}>Instagram</span>
          </div>
          <div className='large-4 columns'>
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
        </div>
        <div className='vertical-center horizontal-center' style={{height: 400}}>
          <Invite /> 
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

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
