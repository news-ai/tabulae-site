import React, { Component } from 'react';
import Radium from 'radium';
import * as actionCreators from '../../actions/AppActions';
import { connect } from 'react-redux';
import { Link } from 'react-router';

class ListManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      styles: {
        link: {
          margin: '10px'
        },
        icon: {
          color: 'lightgray',
          ':hover': {
            color: 'gray'
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

  _onArchive() {
    console.log('ARCHIVE DIS SHIT');
  }

  render() {
    const { lists } = this.props;
    return (
      <div className='container'>
      <h1>Media Lists</h1>
      {
        lists.map( (list, i) =>
          <div key={i}>
            <Link key={i} to={`/lists/${list.id}`} style={[this.state.styles.link]}>
              <span>{list.name}</span>
            </Link>
            <i key={i} className='fa fa-archive' style={[this.state.styles.icon]} onClick={ _ => this._onArchive(list.id) } aria-hidden='true'></i>
          </div>
          )
      }
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

ListManager = Radium(ListManager);

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(ListManager);
