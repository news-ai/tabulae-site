import React, {Component} from 'react';
import * as listActions from './actions';
import {connect} from 'react-redux';

import Lists from './Lists';
import InfiniteScroll from '../InfiniteScroll';

class TeamListsContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.fetchLists();
  }

  render() {
    return (
      <InfiniteScroll onScrollBottom={this.props.fetchLists}>
        <div className='row' style={{marginTop: 10}}>
          <div className='large-offset-1 large-10 columns'>
          <Lists {...this.props} />
          </div>
        </div>
      </InfiniteScroll>
      );
  }
}

const mapStateToProps = state => {
  const lists = state.listReducer.teamLists.map(id => state.listReducer[id]);
  return {
    lists,
    isReceiving: lists === undefined ? true : false,
    statementIfEmpty: 'There are no team lists available.',
    listItemIcon: 'fa fa-arrow-left',
    title: 'Team Lists',
    tooltip: 'put back',
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchLists: _ => dispatch(listActions.fetchTeamLists())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TeamListsContainer);
