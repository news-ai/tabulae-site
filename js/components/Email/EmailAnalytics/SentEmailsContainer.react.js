// @flow
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {actions as listActions} from 'components/Lists';
import {actions as stagingActions} from 'components/Email';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import withRouter from 'react-router/lib/withRouter';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import {grey600} from 'material-ui/styles/colors';

import Tabs, {TabPane} from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
import 'rc-tabs/assets/index.css';

import './SentEmails.css';

class SentEmailsPaginationContainer extends Component {
  handleFilterChange: (event: Event, index: number, filterValue: number) => void;
  onTabChange: (activeKey: string) => void;
  onSearchClick: (query: string) => void;
  state: {
    filterValue: number,
    isShowingArchived: bool,
    activeKey: string,
    start: number,
  };
  constructor(props) {
    super(props);
    this.state = {
      filterValue: this.props.listId,
      isShowingArchived: false,
      activeKey: this.props.listId > 0 ? '/emailstats' : this.props.location.pathname,
      start: 0,
    };
    this.handleFilterChange = (event, index, filterValue) => {
      if (index === 0) this.props.router.push(`/emailstats`);
      else this.props.router.push(`/emailstats/lists/${filterValue}`);
      this.setState({filterValue});
    };
    this.onTabChange = activeKey => {
      this.props.router.push(activeKey);
      this.setState({activeKey});
    };
    this.onSearchClick = this._onSearchClick.bind(this);
  }

  componentWillMount() {
    const {listReducer, fetchLists, searchQuery} = this.props;
    if (listReducer.received.length === 0) fetchLists();
    if (searchQuery) this.onSearchClick(searchQuery);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.listId !== this.props.listId) this.setState({filterValue: nextProps.listId});
    if (nextProps.searchQuery && nextProps.searchQuery !== this.props.searchQuery) {
      this.onSearchClick(nextProps.searchQuery);
    }
  }

  _onSearchClick(query) {
    if (!query) return;
    this.onTabChange('/emailstats/search');
    this.props.router.push(`/emailstats/search/${query}`);
  }

  render() {
    const state = this.state;
    const props = this.props;
    const filterLists = state.isShowingArchived ? props.archivedLists : props.lists;
    const selectable = [<MenuItem key={0} value={0} primaryText='------- All Emails -------' />]
    .concat(filterLists.map((list, i) => <MenuItem key={i + 1} value={list.id} primaryText={list.name}/>));

    return (
        <div className='large-10 large-offset-1 columns'>
          <div className='vertical-center' style={{margin: '20px 0'}}>
            <span style={{fontSize: '1.3em', marginRight: 10}}>Emails You Sent</span>
            <div className='right'>
              <TextField
              ref='emailSearch'
              floatingLabelText='Search Filter'
              onKeyDown={e => e.key === 'Enter' ? this.onSearchClick(this.refs.emailSearch.input.value) : null}
              />
              <IconButton
              iconStyle={{color: grey600}}
              iconClassName='fa fa-search'
              onClick={e => this.onSearchClick(this.refs.emailSearch.input.value)}
              />
            </div>
          </div>
          <div className='row'>
            <Tabs
            defaultActiveKey='/emailstats'
            activeKey={state.activeKey}
            onChange={this.onTabChange}
            renderTabBar={() => <ScrollableInkTabBar/>}
            renderTabContent={() => <TabContent/>}
            >
              <TabPane placeholder={<span>Placeholder</span>} tab='All Sent Emails' key='/emailstats'>
                <div style={{margin: 5}}>
                {props.lists &&
                  <div className='left'>
                    <div className='vertical-center'>
                      <span>Filter by List: </span>
                      <DropDownMenu value={state.filterValue} onChange={this.handleFilterChange}>
                      {selectable}
                      </DropDownMenu>
                    </div>
                  </div>}
                  {props.children}
                </div>
              </TabPane>
              <TabPane placeholder={<span>Placeholder</span>} tab='Scheduled Emails' key='/emailstats/scheduled'>
                <div style={{margin: 5}}>
                {props.children}
                </div>
              </TabPane>
              <TabPane placeholder={<span>Placeholder</span>} tab='Trash' key='/emailstats/trash'>
                <div style={{margin: 5}}>
                {props.children}
                </div>
              </TabPane>
              <TabPane placeholder={<span>Placeholder</span>} tab='Search' key='/emailstats/search'>
                <div style={{margin: 5}}>
                {props.children}
                </div>
              </TabPane>
            </Tabs>
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
    searchQuery: props.params.searchQuery
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchSentEmails: _ => dispatch(stagingActions.fetchSentEmails()),
    fetchLists: listId => dispatch(listActions.fetchLists()),
    fetchListEmails: listId => dispatch(stagingActions.fetchListEmails(listId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(SentEmailsPaginationContainer));
