import React, {Component} from 'react';
import * as actionCreators from 'actions/AppActions';
import {connect} from 'react-redux';

import Lists from './Lists';
import InfiniteScroll from '../InfiniteScroll';

class PublicListsContainer extends Component {
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
  const lists = state.listReducer.publicLists.map(id => state.listReducer[id]);
  return {
    lists: lists,
    isReceiving: lists === undefined ? true : false,
    statementIfEmpty: 'There are no public lists available.',
    listItemIcon: 'fa fa-arrow-left',
    backRoute: '/',
    backRouteTitle: 'Media Lists',
    title: 'Public Lists',
    tooltip: 'put back',
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: action => dispatch(action),
    fetchLists: _ => dispatch(actionCreators.fetchPublicLists())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PublicListsContainer);
