import React, {Component} from 'react';
import {connect} from 'react-redux';
import withRouter from 'react-router/lib/withRouter';
import ContactFeed from 'components/Contacts/ContactFeed/ContactFeed.react';
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import Select from 'react-select';
import * as contactTagActions from './actions';
import {actions as copyActions} from 'components/ListTable/CopyToHOC';
import {actions as listActions} from 'components/Lists';
import alertify from 'alertifyjs';

const styles = {
  container: {marginTop: 20, marginBottom: 10},
  text: {fontSize: '2em', marginRight: '10px'}
};

// utility wrapper to avoid grid confusion
const Centering = ({children}) => <div className='row align-center'><div className='large-10 medium-10 small-12 columns'>{children}</div></div>;

alertify.promisifyPrompt = (title, description, defaultValue) => new Promise((resolve, reject) => {
  alertify.prompt(title, description, defaultValue, (e, value) => resolve(value), reject);
});

class ContactTags extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: [],
      listDialogOpen: false,
      listValue: false
    };
    this.onSelect = this._onSelect.bind(this);
    this.onSelectAll = _ => this.setState({
      selected: this.state.selected.length === this.props.contacts.length ?
      [] : this.props.contacts.map(contact => contact.id)
    });
    this.onCopySelectedToNew = _ => alertify.promisifyPrompt(
      'New List',
      `What would you like to name the list?`,
      ''
      ).then(newListName => this.props.copyToNewList(this.state.selected, newListName || `untitled_copied_from_tag_${this.props.tag}`));
    this.onRequestClose = _ => this.setState({listValue: false, listDialogOpen: false});
    this.onRequestOpen = _ => this.setState({listDialogOpen: true});
    this.onSubmit = _ => {
      this.state.listValue.map(({value}) => this.props.copyContactsToList(this.state.selected, value));
      this.setState({listValue: false, listDialogOpen: false});
    };
  }

  componentWillMount() {
    window.Intercom('trackEvent', 'access_contact_tag', {tag: this.props.tag});
    if (this.props.tag) this.props.fetchContactsByTag();
    this.props.fetchLists();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.tag !== nextProps.tag) {
      nextProps.fetchContactsByTag();
    }
  }

  _onSelect(contactId) {
    let newSelected = [];
    let seen = false;
    this.state.selected.forEach(id => {
      if (id !== contactId) {
        newSelected.push(id);
      } else {
        seen = true;
        return false;
      }
    });
    if (!seen) newSelected.push(contactId);
    this.setState({selected: newSelected});
  }

  render() {
    const props = this.props;
    const state = this.state;
    const actions = [
      <FlatButton label='Cancel' onTouchTap={this.onRequestClose}/>,
      <FlatButton
        label='Submit'
        primary
        keyboardFocused
        onTouchTap={this.onSubmit}
      />
    ];

    return (
      <Centering>
        <Dialog actions={actions} open={state.listDialogOpen} onRequestClose={this.onRequestClose}>
          <div style={{height: 400}}>
            <p>Select the List(s) to Copy these selected contacts to:</p>
          {props.lists &&
            <Select
            multi
            value={state.listValue}
            options={props.options}
            onChange={listValue => this.setState({listValue})}
            onValueClick={({value}) => props.router.push(`/tables/${value}`)}
            />}
          </div>
        </Dialog>
        <div className='row' style={styles.container}>
          <div className='large-12 medium-12 small-12 columns'>
            <span style={styles.text}>Contact Tag: {props.tag}</span>
          </div>
        </div>
        <div className='row'>
          <div className='large-6 medium-6 small-12 columns' >
            <Checkbox onCheck={this.onSelectAll} label='Select All' />
          </div>
          <div className='columns'>
            <RaisedButton disabled={state.selected.length === 0} style={{margin: '0 5px', float: 'right'}} onClick={this.onCopySelectedToNew} label='Copy to New List'/>
            <RaisedButton disabled={state.selected.length === 0} style={{margin: '0 5px', float: 'right'}} onClick={this.onRequestOpen} label='Copy to Existing List'/>
          </div>
        </div>
        <div>
          <div className='large-12 medium-12 small-12 columns'>
            <span className='smalltext'>selected {state.selected.length} contact{state.selected.length > 1 ? 's' : null} </span>
          </div>
        </div>
        <ContactFeed selected={state.selected} onSelect={this.onSelect} contacts={props.contacts}/>
        {props.contacts.length === 0 && <div>None found</div>}
      </Centering>
      );
  }
}


const mapStateToProps = (state, props) => {
  const tag = props.router.location.query.tag;
  let contacts = [];
  if (tag && state.contactTagReducer[tag]) {
    contacts = state.contactTagReducer[tag].received.map(id => state.contactReducer[id]);
  }
  const lists = state.listReducer.lists.map(id => state.listReducer[id]);
  return {
    lists,
    options: lists.map(list => ({label: list.name, value: list.id})),
    contacts,
    tag,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const tag = props.router.location.query.tag;
  const copyContactsToList = (contacts, listid) =>  {
    return dispatch(copyActions.copyContactsToList(contacts, listid))
    .then(_ => alertify.notify('Copy completed!', 'custom', 2, function(){}))
    .catch(err => {
      console.log(err);
      window.Intercom('trackEvent', 'copy_error', {error: err.toString()});
      alertify.alert('Error', 'An error occured. Copy unavailable at this moment.');
    });
  };

  return {
    fetchLists: _ => dispatch(listActions.fetchLists()),
    fetchContactsByTag: _ => dispatch(contactTagActions.fetchContactsByTag(tag)),
    copyToNewList: (contacts, name) => {
      window.Intercom('trackEvent', 'copy_some_contacts_to_new');
      return dispatch(listActions.createEmptyList(name))
      .then(response => copyContactsToList(contacts, response.data.id));
    },
    copyContactsToList: (contacts, listid) => {
      window.Intercom('trackEvent', 'copy_some_contacts_to_existing');
      return copyContactsToList(contacts, listid);
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ContactTags));
