import React, {Component} from 'react';
import {connect} from 'react-redux';
import EmailsList from 'components/Email/EmailAnalytics/EmailsList';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import {actions as stagingActions} from 'components/Email';
import {grey800} from 'material-ui/styles/colors';
import {actions as listActions} from 'components/Lists';
import withRouter from 'react-router/lib/withRouter';

const styles = {
  filterLabel: {fontSize: '0.9em', color: grey800},
};

class AllSentEmailsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterValue: this.props.listId || 0,
      isShowingArchived: false,
    };
    this.handleFilterChange = (event, index, filterValue) => {
      if (index === 0) this.props.router.push(`/emailstats/all`);
      else this.props.router.push(`/emailstats/all?listId=${filterValue}`);
      this.setState({filterValue});
    };
  }

  componentWillMount() {
    const {listReceived, fetchLists} = this.props;
    if (!listReceived || listReceived.length === 0) fetchLists();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.listId !== this.props.listId) {
      this.props.fetchEmails();
      this.setState({filterValue: nextProps.listId});
    }
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
  const listId = parseInt(props.router.location.query.listId, 10) || 0;
  console.log(listId);
  let emails;
  if (listId === 0) {
    emails = state.stagingReducer.received.reduce((acc, id, i) => {
      if (state.stagingReducer[id].delivered && !state.stagingReducer[id].archived && state.stagingReducer[id].issent) {
        acc.push(state.stagingReducer[id]);
      }
      return acc;
    }, []);
  } else {
    emails = state.stagingReducer.received
    .reduce((acc, id) => {
      const email = state.stagingReducer[id];
      if (state.stagingReducer[id].delivered && !state.stagingReducer[id].archived && email.listid === listId) {
        acc.push(email);
      }
      return acc;
    }, []);
  }


  return {
    emails,
    // listId,
    isReceiving: state.stagingReducer.isReceiving,
    placeholder: 'No emails found.',
    hasNext: true,
    listReceived: state.listReducer.received,
    lists: state.listReducer.lists && state.listReducer.lists.map(id => state.listReducer[id]),
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const listId = parseInt(props.router.location.query.listId, 10) || 0;
  return {
    fetchEmails: _ => listId === 0 ? dispatch(stagingActions.fetchSentEmails()) : dispatch(stagingActions.fetchListEmails(listId)),
    refreshEmails: _ => {
      dispatch({type: 'RESET_STAGING_OFFSET'});
      dispatch(stagingActions.fetchSentEmails());
    },
    fetchLists: _ => dispatch(listActions.fetchLists()),
    fetchListEmails: id => dispatch(stagingActions.fetchListEmails(id))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(AllSentEmailsContainer));
