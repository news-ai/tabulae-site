import React, {Component} from 'react';
import {connect} from 'react-redux';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import Link from 'react-router/lib/Link';
import {purple50, purple200, grey700, grey800, grey500} from 'material-ui/styles/colors';
import {actions as listActions} from 'components/Lists';
import {actions as publicationActions} from 'components/Publications';
import get from 'lodash/get';
// import ContactItem from 'components/Search/ContactItem.react';
import Tags from 'components/Tags/Tags.react';
import Collapse from 'react-collapse';
// import {Tooltip} from 'react-lightweight-tooltip';

const spanStyle = {color: grey700}

const PublicationSpan = ({name, id}) => (
  <Link className='hoverGray' to={`/publications/${id}`}>
    <span className='text'>{name}</span>
  </Link>
  );

const greenRoundedStyle = {
  content: {
  },
  tooltip: {
    borderRadius: '6px',
    padding: 2
  },
  arrow: {
  },
};

const span = {
  fontSize: '0.8em',
  color: grey800,
  verticalAlign: 'text-top'
};

// TODO: implement isFetchingList like AnalyticsItem
const ContactItem = ({id, firstname, lastname, email, employers, publications, listname, listid, tags}) => {
  return (
    <Paper zDepth={1} style={{padding: 10}}>
      <div className='row'>
        <div className='large-10 columns'>
          <Link to={`/tables/${listid}/${id}`}>{firstname} {lastname}</Link>
        </div>
        <div className='large-2 columns smalltext'>
          <Link to={`/tables/${listid}`}>List: {listname}</Link>
        </div>
      </div>
      <div><span className='text'>{email}</span></div>
      <div className='row'>
        <div className='large-8 columns'>
        {publications.length > 0 && publications.reduce((acc, pub, i) => {
          // separator
          acc.push(<PublicationSpan key={i} {...pub}/>);
          if (i !== publications.length - 1) acc.push(<span key={`span-${i}`} style={spanStyle}>, </span>);
          return acc;
        }, [])}
        </div>
        <div className='large-4 columns'>
        {tags !== null &&
          <Tags color={purple50} borderColor={purple200} tags={tags} createLink={name => `/contacts?tag=${name}`}/>}
        </div>
      </div>
    </Paper>
    );
};

class ContactItemContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchList();
    if (this.props.employers !== null) {
      this.props.employers.map(eId => this.props.fetchPublication(eId));
    }
  }

  render() {
    return (
      <ContactItem {...this.props}/>
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
