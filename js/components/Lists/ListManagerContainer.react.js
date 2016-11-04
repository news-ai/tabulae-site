import React, {Component, PropTypes} from 'react';
import * as actionCreators from 'actions/AppActions';
import browserHistory from 'react-router/lib/browserHistory';
import {connect} from 'react-redux';
import {skylightStyles} from 'constants/StyleConstants';
import SkyLight from 'react-skylight';
import RaisedButton from 'material-ui/RaisedButton';

import Lists from './Lists';
import InfiniteScroll from '../InfiniteScroll';
import DropFileWrapper from '../pages/DropFileWrapper.react';
import TextField from 'material-ui/TextField';

import {grey500} from 'material-ui/styles/colors';

import hopscotch from 'hopscotch';
import 'node_modules/hopscotch/dist/css/hopscotch.min.css';
import {tour} from './tour';

class ListManagerContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tagValue: this.props.tagQuery
    }
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

    if (nextProps.tagQuery !== this.props.tagQuery) {
      this.setState({tagValue: nextProps.tagQuery});
      if (nextProps.tagQuery && nextProps.tagQuery.length > 0) {
        nextProps.fetchLists();
      }
    }
  }

  render() {
    const state = this.state;
    return (
      <InfiniteScroll className='row' onScrollBottom={this.props.fetchLists}>
        <SkyLight
        ref='input'
        overlayStyles={skylightStyles.overlay}
        dialogStyles={skylightStyles.dialog}
        title='Import File'>
          <DropFileWrapper defaultValue={`untitled-${this.props.untitledNum}`} />
        </SkyLight>
        <div className='large-offset-1 large-10 columns'>
          <div style={{marginTop: 10}}>
            <RaisedButton
            style={{float: 'right', margin: 10}}
            label='Add New List'
            onClick={_ => this.props.newListOnClick(`untitled-${this.props.untitledNum}`)}
            labelStyle={{textTransform: 'none'}}
            icon={<i style={{color: grey500}} className='fa fa-plus' aria-hidden='true' />}
            />
            <RaisedButton
            id='uploadButton'
            style={{float: 'right', margin: 10}}
            label='Upload from Existing'
            onClick={_ => this.refs.input.show()}
            labelStyle={{textTransform: 'none'}}
            icon={<i style={{color: grey500}} className='fa fa-plus' aria-hidden='true' />}
            />
          </div>
          {/*<div className='vertical-center'>
            <TextField name='tag-search' value={state.tagValue} onChange={e => this.setState({tagValue: e.target.value})}/>
          </div>*/
          }
          <Lists {...this.props} />
        </div>
      </InfiniteScroll>
      );
  }
}


const mapStateToProps = (state, props) => {
  const tagQuery = props.location.query.tag;
  const listReducer = state.listReducer;
  let lists = listReducer.lists.map(id => listReducer[id]);
  let untitledNum = 0;
  lists.map(list => {
    if (list.name.substring(0, 9) === 'untitled-') {
      const num = parseInt(list.name.substring(9, list.name.length), 10);
      if (!isNaN(num) && num >= untitledNum) untitledNum = num + 1;
    }
  });
  if (tagQuery && tagQuery.length > 0) {
    lists = listReducer.tagLists.map(id => listReducer[id]);
  }
  return {
    lists,
    untitledNum,
    tagQuery,
    isReceiving: listReducer.isReceiving,
    statementIfEmpty: 'It looks like you haven\'t created any list. Go ahead and make one!',
    listItemIcon: 'fa fa-archive',
    backRoute: '/archive',
    backRouteTitle: 'Archive',
    title: 'Media Lists',
    tooltip: 'archive',
    showUploadGuide: state.joyrideReducer.showUploadGuide,
    showGeneralGuide: state.joyrideReducer.showGeneralGuide,
    firstTimeUser: state.personReducer.firstTimeUser
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const tagQuery = props.location.query.tag;
  return {
    dispatch: action => dispatch(action),
    onToggle: listId => dispatch(actionCreators.archiveListToggle(listId))
    .then( _ => dispatch(actionCreators.fetchLists())),
    newListOnClick: untitledNum => {
      dispatch(actionCreators.createEmptyList(untitledNum))
      .then(response => browserHistory.push(`/lists/${response.data.id}`));
    },
    fetchLists: _ => (tagQuery && tagQuery.length > 0) ? dispatch(actionCreators.fetchTagLists(tagQuery)) : dispatch(actionCreators.fetchLists())
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(ListManagerContainer);
