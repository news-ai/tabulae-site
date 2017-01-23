import React, {Component} from 'react';
import {connect} from 'react-redux';
import {ToggleableEditInputHOC, ToggleableEditInput} from '../ToggleableEditInput';
import {fromJS, is} from 'immutable';
import {grey500} from 'material-ui/styles/colors';
import RaisedButton from 'material-ui/RaisedButton';

import {actions as loginActions} from 'components/Login';

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

const staticSpanStyle = {
  marginLeft: 5, marginRight: 5, width: 500, fontSize: '0.9em'
};

class BasicSettings extends Component {
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

    return (
      <div className='row horizontal-center' style={{margin: '50px 0'}}>
        <div className='large-7 medium-9 small-12 columns'>
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
    patchPerson: body => dispatch(loginActions.patchPerson(body)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BasicSettings);
