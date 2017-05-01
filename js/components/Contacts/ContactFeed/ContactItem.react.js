import React, {Component} from 'react';
import {connect} from 'react-redux';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import {actions as listActions} from 'components/Lists';
import get from 'lodash/get';
// import ContactItem from 'components/Search/ContactItem.react';


// TODO: implement isFetchingList like AnalyticsItem
const ContactItem = ({firstname, lastname, email, employers, listname}) => {
  return (
    <Paper zDepth={1} style={{padding: 10}}>
      <div className='row'>
        <div className='large-10 columns'>{firstname} {lastname}</div>
        <div className='large-2 columns'>{listname}</div>
      </div>
      <div><span className='text'>{email}</span></div>
      <div></div>
    </Paper>
    );
};

class ContactItemContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchList();
  }
  render() {
    return <ContactItem {...this.props}/>;
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
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchList: _ => dispatch(listActions.fetchList(props.listid)),
    startListFetch: _ => dispatch({type: 'IS_FETCHING', resource: 'lists', id: props.listid, fetchType: 'isReceiving'}),
    endListFetch: _ => dispatch({type: 'IS_FETCHING_DONE', resource: 'lists', id: props.listid, fetchType: 'isReceiving'}),
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
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ContactItemContainer);
