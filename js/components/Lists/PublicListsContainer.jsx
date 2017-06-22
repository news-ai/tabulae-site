import React, {Component} from 'react';
import * as listActions from './actions';
import {connect} from 'react-redux';

import Lists from './Lists';
import InfiniteScroll from 'components/InfiniteScroll';

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
    lists,
    isReceiving: lists === undefined ? true : false,
    statementIfEmpty: 'There are no public lists available.',
    listItemIcon: 'fa fa-arrow-left',
    title: 'Public Lists',
    tooltip: 'put back',
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchLists: _ => dispatch(listActions.fetchPublicLists())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PublicListsContainer);
