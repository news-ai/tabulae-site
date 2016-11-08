import React, {Component} from 'react';
import {connect} from 'react-redux';
import Select from 'react-select';
import * as actionCreators from '../../actions/AppActions';
import * as feedActions from '../ContactProfile/actions';
import isEmpty from 'lodash/isEmpty';
import withRouter from 'react-router/lib/withRouter';

import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';


class CopyToHOC extends Component {
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
        title='Copy to Another Table'
        open={state.open}
        modal={false}
        autoScrollBodyContent
        onRequestClose={_ => this.setState({open: false})}
        >
          <div className='row'>
            <div className='large-12 medium-12 small-12 columns' style={{margin: '20px 0'}}>
              <span style={{fontWeight: 'bold', marginRight: 8}}>Selected</span>
              {props.selected.length === 0 && <span>none selected</span>}
              {props.selectedContacts &&
                <span>{props.selectedContacts
                .map(contact => contact.firstname)
                .join(', ')}</span>}
            </div>
            <div className='large-12 medium-12 small-12 columns' style={{margin: '20px 0'}}>
              <p>Select the List(s) to Copy these selected contacts to:</p>
              {props.lists &&
                <Select
                multi
                value={state.value}
                options={props.options}
                onChange={value => this.setState({value})}
                onValueClick={({value}) => props.router.push(`/tables/${value}`)}
                />}
            </div>
            <div className='large-12 medium-12 small-12 columns horizontal-center' style={{marginTop: 10, marginBottom: 80}}>
              <RaisedButton
              label='Submit'
              primary
              disabled={!props.selectedContacts || state.value.length === 0}
              icon={<FontIcon className={props.isReceiving ? 'fa fa-spinner fa-spin' : 'fa fa-clone'} />}
              onClick={this.onSubmit} />
            </div>
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
    listReducer: state.listReducer,
    isReceiving: state.contactReducer.isReceiving
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchLists: _ => dispatch(actionCreators.fetchLists()),
    addContactsThenPatchList: (rawContacts, list) => {
      if (rawContacts.length === 0) return;
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(CopyToHOC));
