import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import HeadlineItem from './HeadlineItem.react';
import InfiniteScroll from '../../InfiniteScroll';
import * as headlineActions from './actions';

const styleEmptyRow = {
  padding: 10,
  marginTop: 20,
  marginBottom: 50,
};

class Headlines extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.fetchFeed(this.props.contactId);
  }

  render() {
    const props = this.props;
    return (
        <InfiniteScroll onScrollBottom={_ => props.fetchFeed(props.contactId)}>
          {props.headlines && props.headlines.map((headline, i) => <HeadlineItem key={i} {...headline} />)}
          {props.headlines
            && !props.didInvalidate
            && props.headlines.length === 0
            && <div className='row' style={styleEmptyRow}><p>No RSS attached. Try clicking on "Settings" to start seeing some headlines.</p></div>}
          {props.didInvalidate
            && <div className='row' style={styleEmptyRow}><p>Something went wrong. Sorry about that. A bug has been filed. Check back in a while or use the bottom right Interm button to reach out and we'll try to resolve this for you.</p></div>}
        </InfiniteScroll>
      );
  }
}
const mapStateToProps = (state, props) => {
  const listId = props.listId;
  const contactId = props.contactId;
  const headlines = state.headlineReducer[contactId]
  && state.headlineReducer[contactId].received
  && state.headlineReducer[contactId].received.map(id => state.headlineReducer[id]);
  return {
    listId,
    contactId,
    headlines,
    didInvalidate: state.headlineReducer.didInvalidate
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchFeed: contactid => dispatch(headlineActions.fetchContactHeadlines(contactid)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Headlines);
