import React, {Component} from 'react';
import {connect} from 'react-redux';
import EmailsList from 'components/Email/EmailAnalytics/EmailsList';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import {actions as stagingActions} from 'components/Email';
import {grey800} from 'material-ui/styles/colors';
import {actions as listActions} from 'components/Lists';
import withRouter from 'react-router/lib/withRouter';
import DatePicker from 'material-ui/DatePicker';
import IconButton from 'material-ui/IconButton';
import moment from 'moment';

const styles = {
  filterLabel: {fontSize: '0.9em', color: grey800},
};

const DATEFORMAT = 'YYYY-MM-DD';
const DEFAULT_DATE = '0001-01-01T00:00:00Z';

class AllSentEmailsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterListValue: this.props.listId || 0,
      filterDateValue: undefined,
      isShowingArchived: false,
    };
    this.handleListChange = (event, index, filterListValue) => {
      let query = Object.assign({}, this.props.location.query);
      if (index === 0) {
        delete query.listId;
      } else {
        this.props.fetchListEmails(filterListValue);
        query.listId = filterListValue;
      }
      this.props.router.push({pathname: `/emailstats/all`, query});
      this.setState({filterListValue});
    };
    this.handleDateChange = (e, filterDateValue) => {
      let query = Object.assign({}, this.props.location.query);
      const queryDate = moment(filterDateValue).format(DATEFORMAT);
      this.props.fetchSpecificDayEmails(queryDate);
      query.date = queryDate;
      this.props.router.push({pathname: `/emailstats/all`, query});
      this.setState({filterDateValue});
    };
    this.onDateCancel = _ => {
      let query = Object.assign({}, this.props.location.query);
      delete query.date;
      this.setState({filterDateValue: undefined});
    };
  }

  componentWillMount() {
    const {listReceived, fetchLists} = this.props;
    if (!listReceived || listReceived.length === 0) fetchLists();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.listId !== this.props.listId) {
      nextProps.fetchEmails();
      this.setState({filterListValue: nextProps.listId});
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
    console.log(props.date);
    return (
      <div>
      {props.lists && (routeKey === '/emailstats/all' || props.listId > 0) &&
        <div className='vertical-center'>
          <span style={styles.filterLabel}>Filter by List: </span>
          <DropDownMenu value={state.filterListValue} onChange={this.handleListChange}>
          {selectable}
          </DropDownMenu>
          <span style={styles.filterLabel}>Filter by Date: </span>
          <DatePicker
          value={state.filterDateValue}
          onChange={this.handleDateChange}
          autoOk hintText='Filter by Day' container='inline'
          />
          <IconButton iconClassName='fa fa-times' onClick={this.onDateCancel}/>
        </div>}

        <EmailsList {...this.props}/>
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  const listId = parseInt(props.router.location.query.listId, 10) || 0;
  const date = props.router.location.query.date;
  let emails;
  let validators = [];
  if (listId === 0) {
    validators.push(id => state.stagingReducer[id].delivered && !state.stagingReducer[id].archived && state.stagingReducer[id].issent);
  } else {
    validators.push(id => state.stagingReducer[id].delivered && !state.stagingReducer[id].archived && state.stagingReducer[id].listid === listId);
  }
  emails = state.stagingReducer.received.reduce((acc, id, i) => {
    validators.map(validate => {
      if (validate(id)) acc.push(state.stagingReducer[id]);
    });
    return acc;
  }, []);
  if (date && state.emailStatsReducer[date] && state.emailStatsReducer[date].received) {
    emails = state.emailStatsReducer[date].received.map(id => state.stagingReducer[id]);
  }


  return {
    date,
    emails,
    listId,
    isReceiving: state.stagingReducer.isReceiving,
    placeholder: 'No emails found.',
    hasNext: true,
    listReceived: state.listReducer.received,
    lists: state.listReducer.lists && state.listReducer.lists.map(id => state.listReducer[id]),
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const listId = parseInt(props.router.location.query.listId, 10) || 0;
  const date = props.router.location.query.date;
  return {
    fetchEmails: _ => listId === 0 ? dispatch(stagingActions.fetchSentEmails()) : dispatch(stagingActions.fetchListEmails(listId)),
    refreshEmails: _ => {
      dispatch({type: 'RESET_STAGING_OFFSET'});
      dispatch(stagingActions.fetchSentEmails());
    },
    fetchLists: _ => dispatch(listActions.fetchLists()),
    fetchListEmails: id => dispatch(stagingActions.fetchListEmails(id)),
    fetchSpecificDayEmails: day => dispatch(stagingActions.fetchSpecificDayEmails(day)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(AllSentEmailsContainer));
