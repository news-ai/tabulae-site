import React, { Component, PropTypes } from 'react';
import * as actionCreators from 'actions/AppActions';
import browserHistory from 'react-router/lib/browserHistory';
import {connect} from 'react-redux';
import {skylightStyles} from 'constants/StyleConstants';
import SkyLight from 'react-skylight';
import Lists from '../Lists';
import RaisedButton from 'material-ui/RaisedButton';
import InfiniteScroll from '../InfiniteScroll';
import DropFile from '../ImportFile';

class ListManagerContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listId: null
    };
    this.onUploadExistingClick = this._onUploadExistingClick.bind(this);
  }

  componentDidMount() {
    this.props.fetchLists();
  }

  _onUploadExistingClick(untitledNum) {
    this.props.createEmptyList(untitledNum)
    .then(response => {
      this.setState({listId: response.data.id});
      this.refs.input.show();
    });
  }

  render() {
    return (
      <InfiniteScroll onScrollBottom={this.props.fetchLists}>
        {this.state.listId !== null ? <SkyLight
          ref='input'
          overlayStyles={skylightStyles.overlay}
          dialogStyles={skylightStyles.dialog}
          hideOnOverlayClicked
          title='File Drop'>
            <DropFile
            listId={this.state.listId}
            />
        </SkyLight> : null}

        <div className='row'>
          <div className='large-offset-1 large-10 columns'>
            <RaisedButton
            style={{float: 'right', marginTop: '20px'}}
            label='Add New List'
            onClick={_ => this.props.newListOnClick(this.props.untitledNum)}
            labelStyle={{textTransform: 'none'}}
            icon={<i className='fa fa-plus' aria-hidden='true' />}
            />
            <RaisedButton
            style={{float: 'right', marginTop: '20px'}}
            label='Upload from Existing'
            onClick={_ => this.onUploadExistingClick(this.props.untitledNum)}
            labelStyle={{textTransform: 'none'}}
            icon={<i className='fa fa-plus' aria-hidden='true' />}
            />
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
    createEmptyList: untitledNum => dispatch(actionCreators.createEmptyList(untitledNum)),
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
