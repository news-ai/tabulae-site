import React, { Component, PropTypes } from 'react';
import * as actionCreators from 'actions/AppActions';
import { connect } from 'react-redux';
import Lists from '../Lists';
import RaisedButton from 'material-ui/RaisedButton';

class ListManagerContainer extends Component {
  constructor(props) {
    super(props);
    this.onScrollBottom = this._onScrollBottom.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(actionCreators.fetchLists());
    window.addEventListener('scroll', this.onScrollBottom);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScrollBottom);
  }

  _onScrollBottom(ev) {
    ev.preventDefault();
    if ((window.innerHeight + window.scrollY + 20) >= document.body.offsetHeight) {
      
    }
  }

  render() {
    return (
      <div className='container'>
        <RaisedButton
        style={{float: 'right'}}
        label='Add New List'
        onClick={_ => this.props.newListOnClick(this.props.untitledNum)}
        labelStyle={{textTransform: 'none'}}
        icon={<i className='fa fa-plus' aria-hidden='true' />}
        />
        <Lists {...this.props} />
      </div>
      );
  }
}


const mapStateToProps = state => {
  const listReducer = state.listReducer;
  const lists = listReducer.lists.map(id => listReducer[id]);
  let untitledNum = 0;
  lists.map(list => {
    if (list.name.substring(0, 9) === 'untitled-') {
      const num = parseInt(list.name.substring(9, list.name.length), 10);
      if (!isNaN(num) && num >= untitledNum) untitledNum = num + 1;
    }
  });
  return {
    lists: lists,
    untitledNum,
    isReceiving: listReducer.isReceiving,
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
    newListOnClick: untitledNum => dispatch(actionCreators.createEmptyList(untitledNum))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(ListManagerContainer);
