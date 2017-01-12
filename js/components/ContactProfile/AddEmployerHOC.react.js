import React, {Component} from 'react';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
import AutoComplete from 'material-ui/AutoComplete';
import FlatButton from 'material-ui/FlatButton';
import PublicationPreview from './PublicationPreview.react';
import PublicationForm from './PublicationForm.react';
import * as AppActions from 'actions/AppActions';
import alertify from 'alertifyjs';
import isURL from 'validator/lib/isURL';

class AddEmployerHOC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      input: '',
      employerAutocompleteList: [],
      publicationFormOpen: false,
      publicationObj: {
        name: '',
        url: ''
      }
    };
    this.updateAutoInput = this._updateAutoInput.bind(this);
    this.onRequestClose = this._onRequestClose.bind(this);
    this.onSubmit = this._onSubmit.bind(this);
  }

  _updateAutoInput(val) {
    this.setState({
      input: val,
      publicationObj: Object.assign({}, this.state.publicationObj, {name: val})
    });
    setTimeout(_ => {
      this.props.searchPublications(this.state.input)
      .then(response => this.setState({
        employerAutocompleteList: response,
        autocompleteOpen: response.length > 0
      }));
    }, 500);
  }

  _onRequestClose() {
    this.setState({
      open: false,
      input: '',
      employerAutocompleteList: [],
    });
  }

  _onSubmit() {
    const props = this.props;
    const state = this.state;
    const publicationObj = state.publicationObj;
    if (state.publicationFormOpen) {
      if (publicationObj.name && isURL(publicationObj.url)) {
        props.createPublicationThenPatchContact(props.contact.id, state.publicationObj, props.type);
        this.onRequestClose();
      } else {
        alertify.alert('All fields must be filled to continue.');
      }
    } else {
      props.createPublicationThenPatchContact(props.contact.id, state.publicationObj, props.type);
      this.onRequestClose();
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    const pubId = props.publicationReducer[state.input];
    const actions = [
      <FlatButton
      label='Cancel'
      onTouchTap={this.onRequestClose}
      />,
      <FlatButton
      label='Submit'
      primary
      keyboardFocused
      disabled={!pubId || state.publicationFormOpen}
      onTouchTap={this.onSubmit}
    />,
    ];
    return (
      <div>
        <Dialog actions={actions} title={props.title} open={state.open} onRequestClose={this.onRequestClose}>
          <AutoComplete
          floatingLabelText='Autocomplete Dropdown'
          filter={AutoComplete.noFilter}
          onUpdateInput={this.updateAutoInput}
          onNewRequest={input => this.setState({input})}
          openOnFocus
          dataSource={state.employerAutocompleteList}
          />
          {!state.publicationFormOpen && <PublicationPreview text={state.input} onOpenForm={_ => this.setState({publicationFormOpen: true})}/>}
          {state.publicationFormOpen &&
            <PublicationForm
            publicationObj={state.publicationObj}
            onValueChange={(value, property) => this.setState({publicationObj: Object.assign({}, state.publicationObj, {[property]: value})})}
            onHide={_ => this.setState({publicationFormOpen: false})}
            />}
        </Dialog>
        {props.children({
          onRequestOpen: _ => this.setState({open: true})
        })}
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    publicationReducer: state.publicationReducer
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    searchPublications: query => dispatch(AppActions.searchPublications(query)),
    createPublicationThenPatchContact: (contactId, publicationObj, which) => dispatch(AppActions.createPublicationThenPatchContact(contactId, publicationObj, which)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddEmployerHOC);
