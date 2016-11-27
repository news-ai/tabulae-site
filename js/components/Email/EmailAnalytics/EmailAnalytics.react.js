import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actions from '../actions';
import * as actionCreators from '../../../actions/AppActions';
import StaticEmailContent from '../PreviewEmails/StaticEmailContent.react';
import AnalyticsItem from './AnalyticsItem.react';
import Dialog from 'material-ui/Dialog';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';
import InfiniteScroll from '../../InfiniteScroll';
import ScheduledEmails from './ScheduledEmails.react';

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
      filterValue: 0,
      isShowingArchived: false
    };
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
      filterLists.map((list, i) => <MenuItem key={i+1} value={list.id} primaryText={list.name} onClick={_ => props.fetchListEmails(list.id)} />)
      );
    // <Toggle style={toggleStyle.block} labelStyle={toggleStyle.label} label='Set to Archived Lists' toggled={state.isShowingArchived} onToggle={_ => this.setState({isShowingArchived: !state.isShowingArchived})} />
    return (
      <InfiniteScroll onScrollBottom={props.fetchSentEmails}>
        <div className='row'>
          <div className='large-10 large-offset-1 columns'>
            <ScheduledEmails/>
            <div style={{margin: '20px 0'}}>
              <span style={{fontSize: '1.3em', marginRight: '10px'}}>Emails You Sent</span>
            </div>
            {props.lists &&
              <div>
                <div>
                  <span>Filter by List: </span>
                  <DropDownMenu value={state.filterValue} onChange={this.handleChange}>
                  {selectable}
                  </DropDownMenu>
                </div>
              </div>}
            <div style={{margin: '30px 0'}}>
              {emails.map((email, i) =>
                <AnalyticsItem
                key={i}
                {...email}
                />)}
            </div>
             {state.canLoadMore && <p style={{
              display: 'flex',
              justifyContent: 'center'
            }}>Scroll to load more</p>}
          </div>
        </div>
      </InfiniteScroll>
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
    canLoadMore: (state.stagingReducer.offset !== null) ? true: false,
    lists: state.listReducer.lists && state.listReducer.lists.map(listId => state.listReducer[listId]),
    archivedLists: state.listReducer.archivedLists && state.listReducer.archivedLists.map(listId => state.listReducer[listId])
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
