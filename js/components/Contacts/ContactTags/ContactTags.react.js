import React, {Component} from 'react';
import {connect} from 'react-redux';
import withRouter from 'react-router/lib/withRouter';
import Link from 'react-router/lib/Link';
// import ContactFeed from 'components/Contacts/ContactFeed/ContactFeed.react';
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import Select from 'react-select';
import * as contactTagActions from './actions';
import {actions as copyActions} from 'components/ListTable/CopyToHOC';
import {actions as listActions} from 'components/Lists';
import alertify from 'alertifyjs';
import ContactItemContainer from '../ContactFeed/ContactItemContainer.react';

import {blue500, blue600, blue800, grey50, grey500, grey800} from 'material-ui/styles/colors';

const styles = {
  container: {marginTop: 20, marginBottom: 10},
  text: {fontSize: '2em', marginRight: '10px'}
};

// utility wrapper to avoid grid confusion
const Centering = ({children}) => <div className='row align-center'><div className='large-10 medium-10 small-12 columns'>{children}</div></div>;

const PageItem = ({pageNumber, isActive, link}) => (
  <Link to={link} >
    <div style={{
      padding: '2px 5px',
      border: `1px solid ${isActive ? blue800 : grey500}`,
      borderRadius: '5%',
      margin: '0 3px',
      color: isActive ? '#ffffff' : grey800,
      backgroundColor: isActive ? blue600 : grey50
    }}>
      {pageNumber}
    </div>
  </Link>
  );

alertify.promisifyPrompt = (title, description, defaultValue) => new Promise((resolve, reject) => {
  alertify.prompt(title, description, defaultValue, (e, value) => resolve(value), reject);
});

class ContactTags extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: [],
      listDialogOpen: false,
      listValue: [],
      pageLimit: this.props.limit || 10,
      currentPage: this.props.currentPage || 0,
    };
    this.onSelect = this._onSelect.bind(this);
    this.onSelectAll = _ => this.setState({
      selected: this.state.selected.length === this.props.contacts.length ?
      [] : this.props.contacts.map(contact => contact.id)
    });
    this.onRemoveDuplicateEmails = (e, isChecked) => {
      this.props.fetchAllContactsByTag(this.props.tag);
      this.props.router.push({
        pathname: '/contacts',
        query: {
          tag: this.props.tag,
          limit: this.state.pageLimit,
          currentPage: this.props.currentPage,
          removeDupes: isChecked
        },
      });
    };
    this.onCopySelectedToNew = _ => alertify.promisifyPrompt(
      'New List',
      `What would you like to name the list?`,
      ''
      ).then(newListName => this.props.copyToNewList(this.state.selected, newListName || `untitled_copied_from_tag_${this.props.tag}`));
    this.onRequestClose = _ => this.setState({listValue: false, listDialogOpen: false});
    this.onRequestOpen = _ => this.setState({listDialogOpen: true});
    this.onSubmit = _ => {
      this.state.listValue.map(({value}) => this.props.copyContactsToList(this.state.selected, value));
      this.setState({listValue: [], listDialogOpen: false});
    };
    this.handlePageLimitChange = e => {
      this.props.router.push({
        pathname: '/contacts',
        query: {tag: this.props.tag, limit: e.target.value, currentPage: 0, removeDupes: this.props.removeDupes}
      });
    };
  }

  componentWillMount() {
    window.Intercom('trackEvent', 'access_contact_tag', {tag: this.props.tag});
    this.props.resetTagContacts();
    if (this.props.tag) this.props.fetchContactsByTag();
    this.props.fetchLists();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.tag !== nextProps.tag) {
      nextProps.fetchContactsByTag();
    } else {
      // fetch more contacts for current page if not yet loaded
      if (
        nextProps.contacts.length < nextProps.total &&
        (nextProps.currentPage + 1) * nextProps.limit > nextProps.contacts.length
        ) {
        nextProps.fetchContactsByTag();
      }
    }

    if (this.props.limit !== nextProps.limit) {
      this.setState({pageLimit: nextProps.limit});
    }
    if (this.props.currentPage !== nextProps.currentPage) {
      this.setState({currentPage: nextProps.currentPage});
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
      <FlatButton label='Submit' primary onTouchTap={this.onSubmit} />
    ];

    const total = props.total;

    let contacts = props.contacts.slice(
      state.currentPage * state.pageLimit,
      (state.currentPage + 1) * state.pageLimit
      );
    // console.log(contacts);
    const numOfPages = total % state.pageLimit > 0 ? Math.floor(total / state.pageLimit) + 1 : Math.floor(total / state.pageLimit);
    let pages = [];
    for (let i = 1; i < numOfPages + 1; i++) {
      pages.push(
        <PageItem
        key={`page-${i}`}
        pageNumber={i}
        isActive={i - 1 === state.currentPage}
        link={{pathname: '/contacts', query: {tag: props.tag, limit: state.pageLimit, currentPage: i - 1}}}
        />);
    }

    // console.log(props.contacts);

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
          {props.isReceiving &&
            <FontIcon color={grey500} className='fa fa-spin fa-spinner'/>}
          </div>
        </div>
        <div className='row' style={{margin: '10px 0'}} >
          <div className='large-6 medium-6 small-12 columns' >
            <Checkbox iconStyle={{fill: blue500}} onCheck={this.onSelectAll} label='Select All' />
            <Checkbox iconStyle={{fill: blue500}} onCheck={this.onRemoveDuplicateEmails} label='Remove Duplicate Emails' />
          </div>
          <div className='columns'>
            <RaisedButton
            disabled={state.selected.length === 0}
            style={{margin: '0 5px', float: 'right'}}
            onClick={this.onCopySelectedToNew}
            label='Copy to New List'
            />
            <RaisedButton
            disabled={state.selected.length === 0}
            style={{margin: '0 5px', float: 'right'}}
            onClick={this.onRequestOpen}
            label='Copy to Existing List'
            />
          </div>
        </div>
        <div className='row' style={{margin: '10px 0'}} >
          <div className='large-3 columns'>
            <span className='text' style={{margin: '0 5px'}}>Selected {state.selected.length} out of {total} result(s)</span>
          </div>
          <div className='columns'>
            <div style={{float: 'right'}}>
              <span className='text' style={{margin: '0 5px'}}>Showing</span>
              <select style={{width: 60}} className='clearfix' value={state.pageLimit} onChange={this.handlePageLimitChange}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
              <span className='text' style={{margin: '0 5px'}} >results per page</span>
            </div>
          </div>
        </div>
      {contacts.map((contact, index) => (
        <ContactItemContainer
        key={contact.id}
        index={index}
        checked={state.selected.some(id => id === contact.id)}
        onSelect={this.onSelect}
        {...contact}
        />
        ))}
      {contacts.length === 0 &&
        <div>None found</div>}
        <div className='vertical-center horizontal-center' style={{padding: '15px 10px', margin: '30px 10px'}} >
      {/*
          <Link to={{pathname: '/contacts', query: {tag: props.tag, limit: state.pageLimit, currentPage: state.currentPage - 1}}}>Prev</Link>
          <Link to={{pathname: '/contacts', query: {tag: props.tag, limit: state.pageLimit, currentPage: state.currentPage + 1}}}>Next</Link>
      */}
          {pages}
        </div>
      </Centering>
      );
  }
}

const mapStateToProps = (state, props) => {
  const tag = props.router.location.query.tag;
  const currentPage = props.router.location.query.currentPage;
  const limit = props.router.location.query.limit;
  const removeDupes = props.router.location.query.removeDupes === 'true' ? true : false;
  let contacts = [];
  let total = 0;
  if (tag && state.contactTagReducer[tag]) {
    contacts = state.contactTagReducer[tag].received.map(id => state.contactReducer[id]);
    total = state.contactTagReducer[tag].total;
  }

  if (removeDupes) {
    // all are fetched
    let seen = {};
    contacts = contacts.reduce((acc, contact) => {
      if (!contact.email) acc.push(contact);
      else if (!seen[contact.email]) {
        acc.push(contact);
        seen[contact.email] = true;
      }
      return acc;
    }, []);
    total = contacts.length;
  }

  const lists = state.listReducer.lists.map(id => state.listReducer[id]);

  return {
    isReceiving: state.contactTagReducer.isReceiving,
    options: lists.map(list => ({label: list.name, value: list.id})),
    currentPage: currentPage ? parseInt(currentPage, 10) : currentPage,
    limit: limit ? parseInt(limit, 10) : limit,
    lists,
    options: lists.map(list => ({label: list.name, value: list.id})),
    contacts,
    tag,
    total,
    removeDupes,
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
    fetchAllContactsByTag: _ => dispatch(contactTagActions.fetchAllContactsByTag(tag)),
    copyToNewList: (contacts, name) => {
      window.Intercom('trackEvent', 'copy_some_contacts_to_new');
      return dispatch(listActions.createEmptyList(name))
      .then(response => copyContactsToList(contacts, response.data.id));
    },
    copyContactsToList: (contacts, listid) => {
      window.Intercom('trackEvent', 'copy_some_contacts_to_existing');
      return copyContactsToList(contacts, listid);
    },
    resetTagContacts: _ => dispatch({type: 'TAG_CONTACTS_RESET', tag}),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ContactTags));
