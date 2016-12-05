import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actions from '../actions';
import * as actionCreators from '../../../actions/AppActions';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import withRouter from 'react-router/lib/withRouter';

import Tabs, {TabPane} from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
import 'rc-tabs/assets/index.css';

import './SentEmails.css';

class SentEmailsPaginationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterValue: this.props.listId,
      isShowingArchived: false,
      activeKey: this.props.listId > 0 ? '/emailstats' : this.props.location.pathname,
      start: 0,
    };
    this.handleChange = (event, index, filterValue) => {
      if (index === 0) this.props.router.push(`/emailstats`);
      else this.props.router.push(`/emailstats/lists/${filterValue}`);
      this.setState({filterValue});
    };
    this.onTabChange = activeKey => {
      this.props.router.push(activeKey);
      this.setState({activeKey});
    };
    this.onTabClick = key => key === this.state.activeKey && this.setState({activeKey: ''});
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
            <Tabs
            defaultActiveKey='/emailstats'
            activeKey={state.activeKey}
            onChange={this.onTabChange}
            renderTabBar={()=><ScrollableInkTabBar />}
            renderTabContent={()=><TabContent />}
            >
              <TabPane placeholder={<span>Placeholder</span>} tab='All Sent Emails' key='/emailstats'>
                <div style={{margin: 5}}>
                  {props.lists &&
                    <div className='left'>
                      <span>Filter by List: </span>
                      <DropDownMenu value={state.filterValue} onChange={this.handleChange}>
                      {selectable}
                      </DropDownMenu>
                    </div>
                    }
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
            </Tabs>
            </div>
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
