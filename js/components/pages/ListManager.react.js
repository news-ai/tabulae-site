import React, { Component } from 'react';
import * as actionCreators from '../../actions/AppActions';
import { connect } from 'react-redux';
import { Link } from 'react-router';

class ListManager extends Component {
  constructor(props) {
    super(props);
    this.state = {}
    this._onClick = _ => { window.location.href = window.location.origin + '/lists/new'; };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(actionCreators.fetchLists());
  }

  render() {
    const { dispatch, lists } = this.props;
    return (
      <div className='container'>
      <h1>Media Lists</h1>
      { lists.map( (list, i) => 
            <Link to={`/lists/${list.id}`} key={i}><p style={{ margin: '5px' }}>{list.name}</p></Link>
            )}
      <button onClick={this._onClick}>Add New List</button>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(ListManager);