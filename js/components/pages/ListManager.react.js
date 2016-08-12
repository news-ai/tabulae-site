import React, { Component } from 'react';
import Radium from 'radium';
import * as actionCreators from 'actions/AppActions';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ListItem from '../pieces/ListItem.react';

class ListManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      styles: {}
    };
    this._onClick = _ => { window.location.href = window.location.origin + '/lists/new'; };
    this._onArchiveToggle = this._onArchiveToggle.bind(this);
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
    const { lists } = this.props;
    return (
      <div className='container'>
        <div style={{marginTop: '20px'}}>
          <span style={{fontSize: '2em', marginRight: '10px'}}>Media Lists</span>
          <Link to='/archive'>
            <span>Archive</span>
            <i className='fa fa-angle-right fa-fw' aria-hidden='true'></i>
          </Link>
        </div>
        <div style={{
          marginBottom: '50px',
          marginTop: '50px'
        }}>
          {
            lists.length === 0 ? <span>
            It looks like you haven't created any list. Go ahead and make one!
            </span> : null
          }
          {
            lists.map( (list, i) =>
              <ListItem
              list={list}
              _onArchiveToggle={this._onArchiveToggle}
              iconName='fa fa-archive'
              key={i}
              />
              )
          }
        </div>
        <button onClick={this._onClick}>Add New List</button>
        <Link to={`/archive`} />
      </div>
      );
  }
}

const mapStateToProps = (state, props) => {
  return {
    lists: state.listReducer.lists
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: action => dispatch(action)
  };
};

ListManager = Radium(ListManager);

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(ListManager);
