import React, {Component} from 'react';
import {connect} from 'react-redux';
import Select from 'react-select';
import * as actionCreators from '../../actions/AppActions';
import * as feedActions from '../ContactProfile/actions';
import isEmpty from 'lodash/isEmpty';

import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';

class CopyOrMoveTo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      value: []
    };
    this.onSubmit = this._onSubmit.bind(this);
  }

  componentWillMount() {
    this.props.fetchLists();
  }

  _onSubmit() {
    const props = this.props;
    const state = this.state;
    if (state.value.length === 0) return;
    const selectedLists = state.value.map(obj => props.listReducer[obj.value]);
    selectedLists.map(list => props.addContactsThenPatchList(props.selectedContacts, list));
  }

  render() {
    const state = this.state;
    const props = this.props;
    return (
      <div>
        <Dialog
        title='Copy or Move to Another Table'
        open={state.open}
        modal={false}
        autoScrollBodyContent
        onRequestClose={_ => this.setState({open: false})}
        >
          <div style={{height: 500}}>
            <p>{props.selectedContacts && props.selectedContacts.map((contact, i) => <span key={i}>{contact.firstname}</span>)}</p>
            <p>Select the List(s) to Copy these selected contacts to:</p>
            {props.lists &&
              <Select
              multi
              value={state.value}
              options={props.options}
              onChange={value => this.setState({value})}
              />}
            <RaisedButton label='Submit' onClick={this.onSubmit} />
          </div>
        </Dialog>
        {props.children({
          onRequestOpen: _ => this.setState({open: true})
        })}
      </div>);
  }
}

const mapStateToProps = (state, props) => {
  const lists = state.listReducer.lists.map(id => state.listReducer[id]);
  return {
    lists,
    options: lists.map(list => ({label: list.name, value: list.id})),
    selectedContacts: props.selected && props.selected.length > 0 && props.selected.map(id => state.contactReducer[id]),
    listReducer: state.listReducer
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchLists: _ => dispatch(actionCreators.fetchLists()),
    addContactsThenPatchList: (rawContacts, list) => {
      const contacts = rawContacts.map(contact => {
        let obj = {listid: list.id};
        list.fieldsmap
        .filter(fieldObj => !fieldObj.customfield)
        .map(fieldObj => {
          if (!isEmpty(contact[fieldObj.value])) obj[fieldObj.value] = contact[fieldObj.value];
        });
        obj.customfields = contact.customfields;
        return obj;
      });
      return dispatch(actionCreators.addContacts(contacts))
      .then(addedContacts => {
        // copy feeds over
        for (let i = 0; i < addedContacts.length; i++) {
          dispatch(feedActions.copyFeeds(rawContacts[i].id, addedContacts[i].id, list.id));
        }
        const ids = addedContacts.map(contact => contact.id);

        // update list
        const listBody = {
          listId: list.id,
          name: list.name,
          contacts: list.contacts !== null ? [...list.contacts, ...ids] : ids
        };
        return dispatch(actionCreators.patchList(listBody));
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CopyOrMoveTo);
