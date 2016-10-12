import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {ToggleableEditInputHOC, ToggleableEditInput} from '../ToggleableEditInput';

function UserProfile({person}) {
  return (
    <div>
      <div className='row'>
        <h4>Settings</h4>
      </div>
      <div className='row'>
        <ToggleableEditInputHOC name={person.firstname} onBlur={_ => console.log('blur')}>
          {({onToggleTitleEdit, isTitleEditing, name, onUpdateName}) =>
          <ToggleableEditInput
            onToggleTitleEdit={onToggleTitleEdit}
            isTitleEditing={isTitleEditing}
            name={name}
            onUpdateName={onUpdateName}
            />}
        </ToggleableEditInputHOC>
      </div>
    </div>);
}

const mapStateToProps = (state, props) => {
  return {
    person: state.personReducer.person
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
