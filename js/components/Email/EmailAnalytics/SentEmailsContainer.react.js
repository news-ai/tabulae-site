import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actions from '../actions';
import * as actionCreators from '../../../actions/AppActions';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import withRouter from 'react-router/lib/withRouter';
import IconButton from 'material-ui/IconButton';
import Badge from 'material-ui/Badge';
import Link from 'react-router/lib/Link';

import './SentEmails.css';

class SentEmailsPaginationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterValue: this.props.listId,
      isShowingArchived: false
    };
    this.handleChange = (event, index, filterValue) => {
      if (index === 0) this.props.router.push(`/emailstats`);
      else this.props.router.push(`/emailstats/lists/${filterValue}`);
      this.setState({filterValue});
    };
  }

  componentWillMount() {
    const {listReducer, fetchLists} = this.props;
    if (listReducer.received.length === 0) fetchLists();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.listId !== this.props.listId) this.setState({filterValue: nextProps.listId});
  }

  render() {
    const state = this.state;
    const props = this.props;
    const filterLists = state.isShowingArchived ? props.archivedLists : props.lists;
    const selectable = [<MenuItem key={0} value={0} primaryText='All Emails' />]
    .concat(filterLists.map((list, i) => <MenuItem key={i + 1} value={list.id} primaryText={list.name}/>));
    return (
      <div className='row'>
        <div className='large-10 large-offset-1 columns'>
          <div style={{margin: '20px 0'}}>
            <span style={{fontSize: '1.3em', marginRight: 10}}>Emails You Sent</span>
          </div>
            <div className='row'>
              <div className='large-12 medium-12 small-12 columns'>
                {props.lists &&
                  <div className='vertical-center left'>
                    <span>Filter by List: </span>
                    <DropDownMenu value={state.filterValue} onChange={this.handleChange}>
                    {selectable}
                    </DropDownMenu>
                  </div>
                }
                <div className='right'>
                  <Link to='emailstats/trash'><IconButton tooltip='Go to Trash' iconClassName='fa fa-trash'/></Link>
                  <Badge
                  secondary
                  badgeContent={10}
                  badgeStyle={{top: 12, right: 12}}
                  >
                    <Link to='emailstats/scheduled'><IconButton tooltip='Scheduled Emails' iconClassName='fa fa-calendar'/></Link>
                  </Badge>
                </div>
              </div>
            </div>
          {props.children}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    listId: parseInt(props.params.listId, 10) || 0,
    listReducer: state.listReducer,
    canLoadMore: state.stagingReducer.offset !== null,
    lists: state.listReducer.lists && state.listReducer.lists.map(listId => state.listReducer[listId]),
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchSentEmails: _ => dispatch(actions.fetchSentEmails()),
    fetchLists: listId => dispatch(actionCreators.fetchLists()),
    fetchListEmails: listId => dispatch(actions.fetchListEmails(listId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(SentEmailsPaginationContainer));
