import React, {Component} from 'react';
import {connect} from 'react-redux';
import {actions as listActions} from 'components/Lists';
import {actions as publicationActions} from 'components/Publications';
import get from 'lodash/get';
import ContactItem from './ContactItem.react';

class ContactItemContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {checked: false};
    this.onCheck = _ => this.setState(prev => ({checked: !prev.checked}));
  }

  componentWillMount() {
    this.props.fetchList();
    if (this.props.employers !== null) {
      this.props.employers.map(eId => this.props.fetchPublication(eId));
    }
  }

  render() {
    return (
      <ContactItem onCheck={this.onCheck} checked={this.state.checked} {...this.props}/>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    publications: props.employers !== null ? props.employers
    .reduce((acc, eId) => {
      if (state.publicationReducer[eId]) acc.push(state.publicationReducer[eId]);
      return acc;
    }, []) : [],
    listname: state.listReducer[props.listid] ? state.listReducer[props.listid].name : undefined,
    isFetchingList: get(state, `isFetchingReducer.lists[${props.listid}].isReceiving`, false),
    publicationReducer: state.publicationReducer,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchList: _ => dispatch(listActions.fetchList(props.listid)),
    startListFetch: _ => dispatch({type: 'IS_FETCHING', resource: 'lists', id: props.listid, fetchType: 'isReceiving'}),
    endListFetch: _ => dispatch({type: 'IS_FETCHING_DONE', resource: 'lists', id: props.listid, fetchType: 'isReceiving'}),
    fetchPublication: pubId => dispatch(publicationActions.fetchPublication(pubId)),
    startPublicationFetch: pubId => dispatch({type: 'IS_FETCHING', resource: 'publications', id: pubId, fetchType: 'isReceiving'}),
    endPublicationFetch: pubId => dispatch({type: 'IS_FETCHING_DONE', resource: 'publications', id: pubId, fetchType: 'isReceiving'}),
  };
};

const mergeProps = (sProps, dProps, props) => {
  return {
    ...sProps,
    ...dProps,
    ...props,
    fetchList: _ => {
      if (!sProps.isFetchingList && !sProps.listname) {
        // only fetch if it is not currently fetching
        dProps.startListFetch();
        dProps.fetchList()
        .then(_ => dProps.endListFetch());
      }
    },
    fetchPublication: pubId => {
      if (!get(state, `isFetchingReducer.publications[${pubId}].isReceiving`, false) && !sProps.publication.some(pub => pub.id === pubId)) {
        // only fetch if it is not currently fetching
        dProps.startPublicationFetch(pubId);
        dProps.fetchPublication(pubId)
        .then(_ => dProps.endPublicationFetch(pubId));
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ContactItemContainer);
