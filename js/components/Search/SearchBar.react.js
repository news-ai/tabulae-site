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
      isReceiving: false
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

  componentWillUnmount() {
    this.props.clearSearchCache();
  }


  _onSearchClick() {
    if (this.props.isReceiving) return;
    this.props.router.push(`/search?query=${this.state.query}`);
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
          <div className='row' style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: 15,
            marginBottom: 15
          }}>
            <div>
             <TextField
              hintText='Search query here...'
              onKeyDown={e => e.keyCode === 13 ? this.onSearchClick() : null}
              onChange={e => this.setState({query: e.target.value})}
              value={this.state.query}
              />
              <RaisedButton primary style={{marginLeft: 10}} onClick={this.onSearchClick} label='Search All Lists' labelStyle={{textTransform: 'none'}} />
            </div>
          </div>
          {props.results.length > 0 ?
          <div className='row' style={{marginTop: 20}}>
            <div className='large-offset-10 medium-offset-10 small-offset-6 columns'>
              <RaisedButton labelStyle={{textTransform: 'none'}} label='Bulk Edit' />
            </div>
          </div> : null}
          <div className='row'>
            <Waiting isReceiving={props.isReceiving} style={{top: 80, right: 10, position: 'fixed'}} />
            <div className='large-12 columns' style={{marginBottom: '25px'}}>
              {state.isSearchReceived ? <p>We found {expectedResultsString} for "{state.prevQuery}"</p> : null}
              {props.results.map((contact, i) => <div key={i} style={{marginTop: '10px'}}><ContactItem {...contact} query={props.searchQuery} /></div>)}
            </div>
          <div className='row'>
          {state.isSearchReceived && props.results.length % 50 === 0 && props.results.length > 0 ?
            <div className='large-12 columns' style={{display: 'flex', justifyContent: 'center'}}>
            <p>Scroll to load more</p>
            </div> : null}
          </div>
        </div>
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
  console.log(results);
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
