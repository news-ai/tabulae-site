import React, {Component} from 'react';
import {connect} from 'react-redux';
import Dialog from 'material-ui/Dialog';
import AutoComplete from 'material-ui/AutoComplete';
import FlatButton from 'material-ui/FlatButton';
import PublicationPreview from './PublicationPreview.react';
import PublicationForm from './PublicationForm.react';
import * as AppActions from 'actions/AppActions';

class AddEmployerHOC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      input: '',
      employerAutocompleteList: [],
      publicationFormOpen: false
    };
    this.updateAutoInput = this._updateAutoInput.bind(this);
    this.onRequestClose = this._onRequestClose.bind(this);
  }

  _updateAutoInput(val) {
    this.setState({input: val});
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

  render() {
    const props = this.props;
    const state = this.state;
    const actions = [
      <FlatButton
      label='Cancel'
      onTouchTap={this.onRequestClose}
      />,
      <FlatButton
      label='Submit'
      primary
      keyboardFocused
      onTouchTap={_ => {
        props.createPublicationThenPatchContact(props.contact.id, {name: state.input}, props.type);
        this.onRequestClose();
      }}
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
          <PublicationPreview text={state.input} onOpenForm={_ => this.setState({publicationFormOpen: true})}/>
          {state.publicationFormOpen && <PublicationForm text={state.input} onHide={_ => this.setState({publicationFormOpen: false})}/>}
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
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    searchPublications: query => dispatch(AppActions.searchPublications(query)),
    createPublicationThenPatchContact: (contactId, publicationObj, which) => dispatch(AppActions.createPublicationThenPatchContact(contactId, publicationObj, which)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddEmployerHOC);
