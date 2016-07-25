import React, { Component } from 'react';
import Radium from 'radium';
import * as actionCreators from '../../actions/AppActions';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ListItem from '../pieces/ListItem.react';

class ListManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      styles: {
        listItem: {
          link: {
            margin: '10px'
          },
          icon: {
            color: 'lightgray',
            ':hover': {
              color: 'gray',
              cursor: 'pointer'
            }
          }
        }
      }
    };
    this._onClick = _ => { window.location.href = window.location.origin + '/lists/new'; };
    this._onArchive = this._onArchive.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(actionCreators.fetchLists());
  }

  _onArchive(listId) {
    const { dispatch } = this.props;
    dispatch(actionCreators.archiveList(listId))
    .then( _ => dispatch(actionCreators.fetchLists()));
  }

  render() {
    const { lists } = this.props;
    return (
      <div className='container'>
      <h1>Media Lists</h1>
      {
        lists.map( (list, i) =>
          <ListItem
          list={list}
          styles={this.state.styles.listItem}
          _onArchive={this._onArchive}
          key={i}
          / >
          )
      }
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
