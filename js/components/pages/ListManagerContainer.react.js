import React, { Component, PropTypes } from 'react';
import * as actionCreators from 'actions/AppActions';
import { connect } from 'react-redux';
import Lists from '../Lists';
import RaisedButton from 'material-ui/RaisedButton';

class ListManagerContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(actionCreators.fetchLists());
  }

  render() {
    return (
      <div className='container'>
        <RaisedButton
        style={{float: 'right'}}
        label='Add New List'
        onClick={this.props.newListOnClick}
        labelStyle={{textTransform: 'none'}}
        icon={<i className='fa fa-plus' aria-hidden='true' />}
        />
        <Lists {...this.props} />
      </div>
      );
  }
}


const mapStateToProps = state => {
  const lists = state.listReducer.lists;
  return {
    lists: lists,
    isReceiving: state.listReducer.isReceiving,
    statementIfEmpty: 'It looks like you haven\'t created any list. Go ahead and make one!',
    listItemIcon: 'fa fa-archive',
    backRoute: '/archive',
    backRouteTitle: 'Archive',
    title: 'Media Lists'
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: action => dispatch(action),
    onToggle: listId => dispatch(actionCreators.archiveListToggle(listId))
    .then( _ => dispatch(actionCreators.fetchLists())),
    newListOnClick: _ => dispatch(actionCreators.createEmptyList())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(ListManagerContainer);
