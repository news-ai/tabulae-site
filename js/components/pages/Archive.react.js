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
        <div style={{marginTop: '20px'}}>
          <span style={{fontSize: '2em', marginRight: '10px'}}>
          List Archive
          </span>
          <Link to='/'>
            <span>Media Lists</span>
            <i className='fa fa-angle-right fa-fw' aria-hidden='true'></i>
          </Link>
        </div>
        <div style={{
          marginBottom: '50px',
          marginTop: '50px'
        }}>
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
