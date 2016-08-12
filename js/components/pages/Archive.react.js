import React, { Component } from 'react';
import Radium from 'radium';
import * as actionCreators from 'actions/AppActions';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ListItem from '../pieces/ListItem.react';

class Archive extends Component {
  constructor(props) {
    super(props);
    this._onArchiveToggle = this._onArchiveToggle.bind(this);
    this.state = {
      styles: {}
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(actionCreators.fetchLists());
  }

  _onArchiveToggle(listId) {
    const { dispatch } = this.props;
    dispatch(actionCreators.archiveListToggle(listId))
    .then( _ => dispatch(actionCreators.fetchLists()));
  }

  render() {
    const { lists, isReceiving } = this.props;
    return (
      <div className='container'>
      <h1>Media Lists</h1>
      {
        isReceiving ? <i className='fa fa-spinner fa-spin fa-3x'></i> :
        <div>
        {
          lists.length === 0 ? <span>
          It looks like you haven't archived any list. This is where lists go when you archive them.
          </span> : null
        }
        {
          lists.map( (list, i) =>
          <ListItem
          list={list}
          _onArchiveToggle={this._onArchiveToggle}
          iconName='fa fa-arrow-left'
          key={i}
          />)
        }
        </div>
      }
      </div>
      );
  }
}

const mapStateToProps = state => {
  const lists = state.listReducer.archivedList;
  return {
    lists: lists,
    isReceiving: lists === undefined ? true : false
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: action => dispatch(action)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(Archive);
