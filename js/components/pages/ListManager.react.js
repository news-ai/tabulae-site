import React, { Component } from 'react';
import * as actionCreators from '../../actions/AppActions';
import { connect } from 'react-redux';
import { Link } from 'react-router';

class ListManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newListName: ''
    }
    this._onChange = e => this.setState({ newListName: e.target.value });
    this._onNewListClick = this._onNewListClick.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(actionCreators.fetchLists());
  }

  _onNewListClick() {
    const { dispatch } = this.props;
    actionCreators.addListWithoutContacts(this.state.newListName);
  }

  render() {
    const { dispatch, lists } = this.props;
    return (
      <div className='container'>
      <h1>Media Lists</h1>
      { lists.map( (list, i) => 
            <Link to={`/lists/${list.id}`} key={i}><p style={{ margin: '5px' }}>{list.name}</p></Link>
            )}
      <input type='text' placeholder='Untitled' onChange={this._onChange} value={this.state.newListName}></input>
      <button onClick={this._onNewListClick}>Add New List</button>
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