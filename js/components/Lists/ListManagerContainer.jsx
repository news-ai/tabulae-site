import React, {Component} from 'react';
import * as listActions from './actions';
import browserHistory from 'react-router/lib/browserHistory';
import {connect} from 'react-redux';
// import {skylightStyles} from 'constants/StyleConstants';
// import SkyLight from 'react-skylight';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';

import Lists from './Lists';
import InfiniteScroll from 'components/InfiniteScroll';
import DropFileWrapper from 'components/DropFile/DropFileWrapper.jsx';

import {grey500} from 'material-ui/styles/colors';

import hopscotch from 'hopscotch';
import 'node_modules/hopscotch/dist/css/hopscotch.min.css';
import {tour} from './tour';

class ListManagerContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
    this.onUploadFromNewClick = _ => this.props.newListOnClick(`untitled-${this.props.untitledNum}`);
    this.onRequestClose = _ => this.setState({open: false});
    this.onRequestOpen = _ => this.setState({open: true});
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
  }

  render() {
    return (
      <InfiniteScroll className='row' onScrollBottom={this.props.fetchLists}>
        <Dialog title='Import File' open={this.state.open} onRequestClose={this.onRequestClose} >
          <DropFileWrapper defaultValue={`untitled-${this.props.untitledNum}`} />
        </Dialog>
        <div className='large-offset-1 large-10 columns'>
          <div style={styles.buttonContainer}>
            <RaisedButton
            style={styles.uploadBtn}
            label='Add New List'
            onClick={this.onUploadFromNewClick}
            labelStyle={styles.uploadBtnLabel}
            icon={<i style={styles.icon} className='fa fa-plus' aria-hidden='true' />}
            />
            <RaisedButton
            id='uploadButton'
            className='right'
            style={styles.uploadBtn}
            label='Upload from Existing'
            onClick={this.onRequestOpen}
            labelStyle={styles.uploadBtnLabel}
            icon={<i style={styles.icon} className='fa fa-plus' aria-hidden='true' />}
            />
          </div>
          <Lists {...this.props} />
        </div>
      </InfiniteScroll>
      );
  }
}

const styles = {
  uploadBtn: {margin: 10, float: 'right'},
  uploadBtnLabel: {textTransform: 'none'},
  buttonContainer: {marginTop: 10},
  icon: {color: grey500}
};

const mapStateToProps = (state, props) => {
  const listReducer = state.listReducer;
  let lists = listReducer.lists.map(id => listReducer[id]).filter(list => list.createdby === state.personReducer.person.id);
  let untitledNum = 0;
  lists.map(list => {
    if (list.name.substring(0, 9) === 'untitled-') {
      const num = parseInt(list.name.substring(9, list.name.length), 10);
      if (!isNaN(num) && num >= untitledNum) untitledNum = num + 1;
    }
  });

  return {
    lists,
    untitledNum,
    isReceiving: listReducer.isReceiving,
    statementIfEmpty: 'It looks like you haven\'t created any list. Go ahead and make one!',
    listItemIcon: 'fa fa-archive',
    backRoute: '/archive',
    backRouteTitle: 'Archive',
    title: 'Media Lists',
    tooltip: 'archive',
    showUploadGuide: state.joyrideReducer.showUploadGuide,
    showGeneralGuide: state.joyrideReducer.showGeneralGuide,
    firstTimeUser: state.personReducer.firstTimeUser,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    onToggle: listId => {
      dispatch({type: 'IS_FETCHING', resource: 'lists', id: listId, fetchType: 'isArchiving'});
      return dispatch(listActions.archiveListToggle(listId))
      .then(_ => dispatch(listActions.fetchLists()))
      .then(_ =>dispatch({type: 'IS_FETCHING_DONE', resource: 'lists', id: listId, fetchType: 'isArchiving'}));
    },
    newListOnClick: untitledNum => {
      dispatch(listActions.createEmptyList(untitledNum))
      .then(response => browserHistory.push(`/tables/${response.data.id}`));
    },
    fetchLists: _ => dispatch(listActions.fetchLists())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ListManagerContainer);
