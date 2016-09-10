import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import * as actions from './actions';
import ContactItem from './ContactItem.react';


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
    this.onScrollBottom = this._onScrollBottom.bind(this);
  }

  componentWillMount() {
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScrollBottom);
  }

  componentWillReceiveProps(nextProps) {
  }

  componentWillUnmount() {
    this.props.clearSearchCache();
    window.removeEventListener('scroll', this.onScrollBottom);
  }

  _onScrollBottom(ev) {
    ev.preventDefault();
    if ((window.innerHeight + window.scrollY + 20) >= document.body.offsetHeight) this.props.fetchSearch(this.state.prevQuery);
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
      <div className='container'>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '15px',
          marginBottom: '15px'
        }}>
          <div>
           <TextField
            id='text-field-controlled'
            hintText='Search query here...'
            onKeyDown={e => e.keyCode === 13 ? this.onSearchClick() : null}
            onChange={e => this.setState({query: e.target.value})}
            value={this.state.query}
            />
            <RaisedButton style={{marginLeft: '10px'}} onClick={this.onSearchClick}  label='Search All Lists' labelStyle={{textTransform: 'none'}} />
          </div>
        </div>
        {props.isReceiving ? <span>WAITING</span> :
          <div style={{marginBottom: '25px'}}>
            {state.isSearchReceived ? <p>We found {props.results.length} results for "{state.prevQuery}"</p> : null}
            {props.results.map((contact, i) => <div key={i} style={{marginTop: '10px'}}><ContactItem {...contact} /></div>)}
          </div>
        }
        {state.isSearchReceived && props.results.length % 50 === 0 && props.results.length > 0 ? <p style={{
          display: 'flex',
          justifyContent: 'center'
        }}>Scroll to load more</p> : null}

      </div>);
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
