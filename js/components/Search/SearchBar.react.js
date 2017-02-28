import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import withRouter from 'react-router/lib/withRouter';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import * as actions from './actions';
import ContactItem from './ContactItem.react';
import InfiniteScroll from '../InfiniteScroll';
import Waiting from '../Waiting';


class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      prevQuery: '',
      isSearchReceived: false,
      isReceiving: false,
      navigate: false
    };
    this.onSearchClick = this._onSearchClick.bind(this);
  }

  componentWillMount() {
    if (this.props.searchQuery) {
      this.props.fetchSearch(this.props.searchQuery)
      .then(_ => this.setState({
        isSearchReceived: true,
        prevQuery: this.props.searchQuery,
        query: ''
      }));
    }
  }

  componentDidMount() {
    this.props.router.setRouteLeaveHook(this.props.route, nextLocation => {
      if (nextLocation.pathname !== '/search/table') this.props.clearSearchCache();
      // don't clear cache if heading to temp list
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.searchQuery !== this.props.searchQuery) {
      this.props.clearSearchCache();
      this.props.fetchSearch(nextProps.searchQuery)
      .then(_ => this.setState({
        isSearchReceived: true,
        prevQuery: nextProps.searchQuery,
        query: ''
      }));
    }
  }


  _onSearchClick() {
    if (this.props.isReceiving) return;
    const query = this.refs.searchQuery.input.value;
    this.props.router.push(`/search?query=${query}`);
  }

  render() {
    const props = this.props;
    const state = this.state;
    let expectedResultsString = '';
    if (state.isSearchReceived) {
      if (props.results.length % 50 === 0 && props.results.length > 0) expectedResultsString = `${props.results.length}+ results`;
      else if (props.results.length === 0 ) expectedResultsString = `0 result`;
      else if (props.results.length === 1) expectedResultsString = `1 result`;
      else expectedResultsString = `${props.results.length} results`;
    }
    return (
      <InfiniteScroll onScrollBottom={_ => props.fetchSearch(state.prevQuery)}>
          <div
          className='row horizontal-center'
          style={{margin: '20px 0'}}>
            <div className='vertical-center'>
             <TextField
              hintText='Search query here...'
              ref='searchQuery'
              onKeyDown={e => e.keyCode === 13 ? this.onSearchClick() : null}
              />
              <RaisedButton primary style={{marginLeft: 10}} onClick={this.onSearchClick} label='Search All Lists' labelStyle={{textTransform: 'none'}} />
            </div>
          </div>
        {state.isSearchReceived ?
          <div className='horizontal-center'>We found {expectedResultsString} for "{state.prevQuery}"</div> : null}
          <div className='row'>
            <Waiting isReceiving={props.isReceiving} style={{top: 80, right: 10, position: 'fixed'}} />
            <div className='large-12 columns' style={{marginBottom: 30}}>
              {props.results.map((contact, i) => <div key={i} style={{marginTop: '10px'}}><ContactItem {...contact} query={props.searchQuery} /></div>)}
            </div>
          </div>
          {state.isSearchReceived && props.results.length % 50 === 0 && props.results.length > 0 &&
          <div className='row horizontal-center'>
            <span>Scroll to load more</span>
          </div>}
      </InfiniteScroll>
      );
  }
}

const mapStateToProps = (state, props) => {
  const searchQuery = props.location.query.query;
  const results = state.searchReducer.received.map(id => {
    const contact = state.searchReducer[id];
    const list = state.listReducer[contact.listid];
    if (list) {
      list.contacts.map((contactId, i) => {
        if (contactId === contact.id) contact.rowNum = i;
      });
    }
    return contact;
  });
  return {
    isReceiving: state.searchReducer.isReceiving,
    results: results,
    searchQuery
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: action => dispatch(action),
    fetchSearch: query => dispatch(actions.fetchSearch(query)),
    clearSearchCache: _ => dispatch(actions.clearSearchCache()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(withRouter(SearchBar));
