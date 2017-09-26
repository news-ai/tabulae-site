import React, {Component} from 'react';
import * as listActions from './actions';
import browserHistory from 'react-router/lib/browserHistory';
import Link from 'react-router/lib/Link';
import withRouter from 'react-router/lib/withRouter';
import {connect} from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import DropDownMenu from 'material-ui/DropDownMenu';

import Lists from './Lists';
import InfiniteScroll from 'components/InfiniteScroll';
import DropFileWrapper from 'components/DropFile/DropFileWrapper.jsx';

import {grey500} from 'material-ui/styles/colors';

import hopscotch from 'hopscotch';
import 'node_modules/hopscotch/dist/css/hopscotch.min.css';
import {tour} from './tour';
const origin = {horizontal: 'left', vertical: 'top'};

class ListManagerContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
    this.onUploadFromNewClick = _ => this.props.newListOnClick(`untitled-${this.props.untitledNum}`);
    this.onRequestClose = _ => this.setState({open: false});
    this.onRequestOpen = _ => this.setState({open: true});
    this.onSortChange = (e, index, value) => value ? this.props.router.push({pathname: '/', query: {sort: value}}) : this.props.router.push('/');
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

    if (this.props.location.query.sort !== nextProps.location.query.sort) {
      nextProps.fetchLists();
    }
  }

  render() {
    const sortType = this.props.location.query.sort;
    let sortLabel = 'fa fa-sort-amount-asc';
    switch (sortType) {
      case 'leastRecentlyUsed':
        sortLabel = 'fa fa-sort-amount-desc';
        break;
      case 'alphabetical':
        sortLabel = 'fa fa-sort-alpha-asc';
        break;
      case 'antiAlphabetical':
        sortLabel = 'fa fa-sort-alpha-desc';
        break;
    }
    return (
      <InfiniteScroll className='row' onScrollBottom={this.props.fetchLists}>
        <Dialog title='Import File' open={this.state.open} onRequestClose={this.onRequestClose} >
          <DropFileWrapper defaultValue={`untitled-${this.props.untitledNum}`} />
        </Dialog>
        <div className='large-offset-1 large-10 small-12 columns'>
          <div style={{marginTop: 10}}>
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
        </div>
        <div className='large-offset-1 large-10 small-12 columns'>
          <div className='vertical-center' style={{justifyContent: 'flex-end'}} >
            {/*iconButtonElement={<IconButton iconClassName={sortLabel} />} */ }
            <DropDownMenu value={sortType} onChange={this.onSortChange}>
              <MenuItem value={undefined} primaryText='Most Recently Used'  />
              <MenuItem value='leastRecentlyUsed' primaryText='Least Recently Used' />
              <MenuItem value='alphabetical' primaryText='Alphabetical +'  />
              <MenuItem value='antiAlphabetical' primaryText='Alphabetical -' />
            </DropDownMenu>
          </div>
        </div>
        <div className='large-offset-1 large-10 small-12 columns'>
          <Lists {...this.props} />
        </div>
      </InfiniteScroll>
      );
  }
}

const styles = {
  uploadBtn: {margin: 10, float: 'right'},
  uploadBtnLabel: {textTransform: 'none'},
  icon: {color: grey500}
};

const mapStateToProps = (state, props) => {
  const listReducer = state.listReducer;
  const sortType = props.location.query.sort || 'lists';
  let lists = listReducer[sortType].received.map(id => listReducer[id]).filter(list => list.createdby === state.personReducer.person.id);

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
  const sortType = props.location.query.sort;
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
    fetchLists: _ => {
      switch (sortType) {
        case 'leastRecentlyUsed':
          return dispatch(listActions.fetchLeastRecentlyUsedLists());
        case 'alphabetical':
          return dispatch(listActions.fetchAlphabeticalLists());
        case 'antiAlphabetical':
          return dispatch(listActions.fetchAntiAlphabeticalLists());
        default:
          return dispatch(listActions.fetchLists());
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ListManagerContainer));
