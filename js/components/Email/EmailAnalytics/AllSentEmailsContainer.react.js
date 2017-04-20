import React, {Component} from 'react';
import {connect} from 'react-redux';
import EmailsList from 'components/Email/EmailAnalytics/EmailsList';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import {actions as stagingActions} from 'components/Email';
import {grey800} from 'material-ui/styles/colors';
import {actions as listActions} from 'components/Lists';

const styles = {
  filterLabel: {fontSize: '0.9em', color: grey800},
};

class AllSentEmailsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterValue: this.props.listId,
      isShowingArchived: false,
    };
    this.handleFilterChange = (event, index, filterValue) => {
      if (index === 0) this.props.router.push(`/emailstats`);
      else this.props.router.push(`/emailstats/lists/${filterValue}`);
      this.setState({filterValue});
    };
  }

  componentWillMount() {
    const {listReceived, fetchLists} = this.props;
    if (!listReceived || listReceived.length === 0) fetchLists();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.listId !== this.props.listId) this.setState({filterValue: nextProps.listId});
  }

  render() {
    const props = this.props;
    const state = this.state;
    const filterLists = state.isShowingArchived ? props.archivedLists : props.lists;
    const selectable = [
      <MenuItem key={0} value={0} primaryText='------- All Emails -------' />]
      .concat(filterLists.map((list, i) =>
        <MenuItem key={i + 1} value={list.id} primaryText={list.name}/>
        ));
    // console.log(props.router.location);
    const routeKey = props.router.location.pathname;
    return (
      <div>
      {props.lists && (routeKey === '/emailstats/all' || props.listId > 0) &&
        <div className='vertical-center'>
          <span style={styles.filterLabel}>Filter by List: </span>
          <DropDownMenu value={state.filterValue} onChange={this.handleFilterChange}>
          {selectable}
          </DropDownMenu>
        </div>}
        <EmailsList {...this.props}/>
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  const emails = state.stagingReducer.received.reduce((acc, id, i) => {
    if (state.stagingReducer[id].delivered && !state.stagingReducer[id].archived && state.stagingReducer[id].issent) {
      acc.push(state.stagingReducer[id]);
    }
    return acc;
  }, []);

  return {
    emails,
    listId: parseInt(props.params.listId, 10) || 0,
    isReceiving: state.stagingReducer.isReceiving,
    placeholder: 'No emails found.',
    hasNext: true,
    listReceived: state.listReducer.received,
    lists: state.listReducer.lists && state.listReducer.lists.map(listId => state.listReducer[listId]),
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchEmails: _ => dispatch(stagingActions.fetchSentEmails()),
    refreshEmails: _ => {
      dispatch({type: 'RESET_STAGING_OFFSET'});
      dispatch(stagingActions.fetchSentEmails());
    },
    fetchLists: listId => dispatch(listActions.fetchLists()),
    fetchListEmails: listId => dispatch(stagingActions.fetchListEmails(listId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AllSentEmailsContainer);
