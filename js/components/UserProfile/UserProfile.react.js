import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {ToggleableEditInputHOC, ToggleableEditInput} from '../ToggleableEditInput';
import {fromJS, is} from 'immutable';
import {grey500, grey600} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';

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
      newPerson: fromJS(this.props.person)
    };
  }

  componentWillUnmount() {
    if (is(this.state.immuperson, this.state.newPerson)) {

    }
  }

  render() {
    const {person} = this.props;
    console.log(is(this.state.immuperson, this.state.newPerson));
    return (
    <div style={{margin: 40}}>
      <div className='row'>
        <h4>Settings</h4>
      </div>
      <div className='row vertical-center' style={inputHeight}>
        <div className='large-2 columns'>
          <span style={spanStyle}>First Name</span>
        </div>
        <div className='large-3 columns'>
          <ControlledInput name={person.firstname} onBlur={value => this.setNewPerson('firstname', value)} />
        </div>
      </div>
      <div className='row vertical-center' style={inputHeight}>
        <div className='large-2 columns'>
          <span style={spanStyle}>Last Name</span>
        </div>
        <div className='large-3 columns'>
          <ControlledInput name={person.lastname} onBlur={value => this.setNewPerson('lastname', value)} />
        </div>
      </div>
      <div className='row vertical-center' style={inputHeight}>
        <div className='large-2 columns'>
          <span style={spanStyle}>Email</span>
        </div>
        <div className='large-3 columns'>
          <ControlledInput name={person.email} onBlur={value => this.setNewPerson('email', value)} />
        </div>
      </div>
      <div className='row vertical-center' style={inputHeight}>
        <div className='large-2 columns'>
          <span style={spanStyle}>Instagram</span>
        </div>
        <div className='large-3 columns'>
          {person.instagramid.length === 0 ?
            <IconButton
            iconClassName='fa fa-instagram'
            iconStyle={{color: grey600}}
            tooltip='Add'
            onClick={_ => {window.location.href = 'https://tabulae.newsai.org/api/internal_auth/instagram';}}
            /> :
            <span>--- Filled ---</span>}
        </div>
      </div>
    </div>);
  }
}

const mapStateToProps = (state, props) => {
  return {
    person: state.personReducer.person,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
