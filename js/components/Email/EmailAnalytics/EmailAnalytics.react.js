import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import * as actionCreators from '../../../actions/AppActions';
import StaticEmailContent from '../PreviewEmail/StaticEmailContent.react';
import AnalyticsItem from './AnalyticsItem.react';
import Dialog from 'material-ui/Dialog';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';

const toggleStyle = {
  block: {
    maxWidth: 190,
  },
  label: {
    fontWeight: 'normal',
    fontSize: '0.9em'
  }
};

class EmailAnalytics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sentEmails: [],
      isPreviewOpen: false,
      filterValue: 0,
      isShowingArchived: false
    };
    this.handlePreviewOpen = email => this.setState({isPreviewOpen: true, previewEmail: email});
    this.handlePreviewClose = _ => this.setState({isPreviewOpen: false, previewEmail: null});
    this.handleChange = (event, index, filterValue) => this.setState({filterValue});
  }

  componentWillMount() {
    const {listReducer, listId, fetchLists, fetchSentEmails} = this.props;
    if (listReducer.received.length === 0) fetchLists();
    fetchSentEmails();
  }

  render() {
    const state = this.state;
    const props = this.props;
    const emails = state.filterValue === 0 ? props.sentEmails : props.sentEmails.filter(email => email.listid === state.filterValue);
    const filterLists = state.isShowingArchived ? props.archivedLists : props.lists;
    const selectable = [<MenuItem key={0} value={0} primaryText='All Emails' />].concat(
      filterLists.map(list => <MenuItem key={list.id} value={list.id} primaryText={list.name} onClick={_ => props.fetchListEmails(list.id)} />)
      );
    return (
      <div className='container'>
        <div style={{marginTop: '20px', marginBottom: '20px'}}>
          <span style={{fontSize: '1.3em', marginRight: '10px'}}>Emails You Sent</span>
        </div>
        {props.lists ?
          <div>
            <Toggle style={toggleStyle.block} labelStyle={toggleStyle.label} label='Set to Archived Lists' toggled={state.isShowingArchived} onToggle={_ => this.setState({isShowingArchived: !state.isShowingArchived})} />
            <div>
              <span>Filter by List: </span>
              <DropDownMenu value={state.filterValue} onChange={this.handleChange}>
              {selectable}
              </DropDownMenu>
            </div>
          </div>: null }
        <Dialog
        open={state.isPreviewOpen}
        onRequestClose={this.handlePreviewClose}
        >
          <StaticEmailContent {...state.previewEmail} />
        </Dialog>
        <div style={{marginTop: '30px'}}>
        {emails.map((email, i) =>
          <AnalyticsItem
          key={i}
          onPreviewOpen={ _ => this.handlePreviewOpen(email)}
          {...email}
          />)}
        </div>
        {props.isNextButton ? <RaisedButton
          label='Load More Emails'
          labelStyle={{textTransform: 'none'}}
          onClick={props.fetchSentEmails}
          /> : null}
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  const sentEmails = state.stagingReducer.received
  .filter(id => state.stagingReducer[id].issent)
  .map(id => {
    let email = state.stagingReducer[id];
    if (email.listid !== 0 && state.listReducer[email.listid]) {
      email.listname = state.listReducer[email.listid].name;
    }
    return email;
  });
  return {
    sentEmails,
    listId: props.params.listId,
    listReducer: state.listReducer,
    isNextButton: (state.stagingReducer.offset !== null) ? true: false,
    lists: state.listReducer.lists,
    archivedLists: state.listReducer.archivedLists
  }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch: action => dispatch(action),
    fetchSentEmails: _ => dispatch(actions.fetchSentEmails()),
    fetchLists: listId => dispatch(actionCreators.fetchLists()),
    fetchListEmails: listId => dispatch(actions.fetchListEmails(listId))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EmailAnalytics);
