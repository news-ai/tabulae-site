import React, { Component, PropTypes } from 'react';
import * as actionCreators from 'actions/AppActions';
import browserHistory from 'react-router/lib/browserHistory';
import {connect} from 'react-redux';
import {skylightStyles} from 'constants/StyleConstants';
import SkyLight from 'react-skylight';
import Lists from '../Lists';
import RaisedButton from 'material-ui/RaisedButton';
import InfiniteScroll from '../InfiniteScroll';
import DropFileWrapper from './DropFileWrapper.react';


class ListManagerContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.fetchLists();
  }

  render() {
    return (
      <InfiniteScroll onScrollBottom={this.props.fetchLists}>
        <SkyLight
        ref='input'
        overlayStyles={skylightStyles.overlay}
        dialogStyles={skylightStyles.dialog}
        hideOnOverlayClicked
        title='File Drop'>
          <DropFileWrapper defaultValue={`untitled-${this.props.untitledNum}`} />
        </SkyLight>
        <div className='row'>
          <div className='large-offset-1 large-10 columns'>
            <div style={{marginTop: 10}}>
              <RaisedButton
              style={{float: 'right', margin: 10}}
              label='Add New List'
              onClick={_ => this.props.newListOnClick(`untitled-${this.props.untitledNum}`)}
              labelStyle={{textTransform: 'none'}}
              icon={<i className='fa fa-plus' aria-hidden='true' />}
              />
              <RaisedButton
              style={{float: 'right', margin: 10}}
              label='Upload from Existing'
              onClick={_ => this.refs.input.show()}
              labelStyle={{textTransform: 'none'}}
              icon={<i className='fa fa-plus' aria-hidden='true' />}
              />
            </div>
            <Lists {...this.props} />
          </div>
        </div>
      </InfiniteScroll>
      );
  }
}


const mapStateToProps = state => {
  const listReducer = state.listReducer;
  const lists = listReducer.lists.map(id => listReducer[id]);
  let untitledNum = 0;
  lists.map(list => {
    if (list.name.substring(0, 9) === 'untitled-') {
      const num = parseInt(list.name.substring(9, list.name.length), 10);
      if (!isNaN(num) && num >= untitledNum) untitledNum = num + 1;
    }
  });
  return {
    lists: lists,
    untitledNum,
    isReceiving: listReducer.isReceiving,
    statementIfEmpty: 'It looks like you haven\'t created any list. Go ahead and make one!',
    listItemIcon: 'fa fa-archive',
    backRoute: '/archive',
    backRouteTitle: 'Archive',
    title: 'Media Lists',
    tooltip: 'archive',
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: action => dispatch(action),
    onToggle: listId => dispatch(actionCreators.archiveListToggle(listId))
    .then( _ => dispatch(actionCreators.fetchLists())),
    newListOnClick: untitledNum => {
      dispatch(actionCreators.createEmptyList(untitledNum))
      .then(response => browserHistory.push(`/lists/${response.data.id}`));
    },
    fetchLists: _ => dispatch(actionCreators.fetchLists())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(ListManagerContainer);
