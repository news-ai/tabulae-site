import React, {Component, PropTypes} from 'react';
import * as actionCreators from 'actions/AppActions';
import browserHistory from 'react-router/lib/browserHistory';
import {connect} from 'react-redux';

import Lists from './Lists';
import InfiniteScroll from '../InfiniteScroll';

import {grey500} from 'material-ui/styles/colors';

import hopscotch from 'hopscotch';
import 'node_modules/hopscotch/dist/css/hopscotch.min.css';
import {tour} from './tour';

class TagListsContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.fetchLists();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.showUploadGuide !== this.props.showUploadGuide) {
      setTimeout(_ => this.refs.input.show(), 1000);
    }

    if (nextProps.showGeneralGuide !== this.props.showGeneralGuide) {
      hopscotch.startTour(tour);
    }

    if (nextProps.tag !== this.props.tag) {
      nextProps.fetchLists();
    }
  }

  render() {
    return (
      <InfiniteScroll className='row' onScrollBottom={this.props.fetchLists}>
        <div className='large-offset-1 large-10 columns'>
          <Lists {...this.props} />
        </div>
      </InfiniteScroll>
      );
  }
}


const mapStateToProps = (state, props) => {
  const tag = props.params.tag;
  const listReducer = state.listReducer;
  const lists = listReducer.tagLists.map(id => listReducer[id]);
  return {
    lists,
    tag,
    isReceiving: listReducer.isReceiving,
    statementIfEmpty: `There is no list tagged with :${tag}`,
    title: `Tag: ${tag}`,
    tooltip: 'archive',
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const tag = props.params.tag;
  return {
    dispatch: action => dispatch(action),
    onToggle: listId => dispatch(actionCreators.archiveListToggle(listId))
    .then( _ => dispatch(actionCreators.fetchLists())),
    newListOnClick: untitledNum => {
      dispatch(actionCreators.createEmptyList(untitledNum))
      .then(response => browserHistory.push(`/lists/${response.data.id}`));
    },
    fetchLists: _ => dispatch(actionCreators.fetchTagLists(tag))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TagListsContainer);
