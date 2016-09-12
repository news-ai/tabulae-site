import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import * as actions from './actions';
import ContactItem from './ContactItem.react';
import InfiniteScroll from '../InfiniteScroll';


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
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
  }

  componentWillUnmount() {
    this.props.clearSearchCache();
  }


  _onSearchClick() {
    if (this.props.isReceiving) return;
    this.props.fetchSearch(this.state.query)
    .then(_ => this.setState({
      isSearchReceived: true,
      prevQuery: this.state.query,
      query: ''
    }));
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <InfiniteScroll onScrollBottom={_ => props.fetchSearch(state.prevQuery)}>
          <div className='row' style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '15px',
            marginBottom: '15px'
          }}>
            <div>
             <TextField
              hintText='Search query here...'
              onKeyDown={e => e.keyCode === 13 ? this.onSearchClick() : null}
              onChange={e => this.setState({query: e.target.value})}
              value={this.state.query}
              />
              <RaisedButton style={{marginLeft: '10px'}} onClick={this.onSearchClick}  label='Search All Lists' labelStyle={{textTransform: 'none'}} />
            </div>
          </div>
          <div className='row'>
            {props.isReceiving ? <span>WAITING</span> :
            <div className='large-12 columns' style={{marginBottom: '25px'}}>
              {state.isSearchReceived ? <p>We found {props.results.length} results for "{state.prevQuery}"</p> : null}
              {props.results.map((contact, i) => <div key={i} style={{marginTop: '10px'}}><ContactItem {...contact} /></div>)}
            </div>
            }
          <div className='row'>
          {state.isSearchReceived && props.results.length % 50 === 0 && props.results.length > 0 ? <p style={{
            display: 'flex',
            justifyContent: 'center'
          }}>Scroll to load more</p> : null}
          </div>
          </div>
      </InfiniteScroll>
      );
  }
}

const mapStateToProps = state => {
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
    results: results
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
  )(SearchBar);
