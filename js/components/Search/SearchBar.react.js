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
      isSearchReceived: false
    };
    this.onSearchClick = this._onSearchClick.bind(this);
  }

  componentWillMount() {
  }

  componentWillUnmount() {
    this.props.clearSearchCache();
  }

  _onSearchClick() {
    this.props.fetchSearch(this.state.query)
    .then(_ => this.setState({isSearchReceived: true}));
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
            hintText='Search query here...'
            onKeyDown={e => e.keyCode === 13 ? this.onSearchClick() : null}
            onChange={e => this.setState({query: e.target.value})}
            />
            <RaisedButton style={{marginLeft: '10px'}} onClick={this.onSearchClick} label='Search All Lists' labelStyle={{textTransform: 'none'}} />
          </div>
        </div>
        {props.isReceiving ? <span>WAITING</span> :
          <div>
            {state.isSearchReceived ? <p>We found {props.results.length} results for "{state.query}"</p> : null}
            {props.results.map((contact, i) => <div key={i} style={{marginTop: '10px'}}><ContactItem {...contact} /></div>)}
          </div>
        }
      </div>);
  }
}

const mapStateToProps = state => {
  return {
    isReceiving: state.searchReducer.isReceiving,
    results: state.searchReducer.received.map(id => state.searchReducer[id])
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
