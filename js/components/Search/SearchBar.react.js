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
      query: ''
    };
  }

  render() {
    const props = this.props;
    const state = this.state;
    return (
      <div>
        <div>
          <TextField
          hintText='Search query here...'
          onKeyDown={e => e.keyCode === 13 ? props.onSearchClick(state.query) : null}
          onChange={e => this.setState({query: e.target.value})}
          />
          <RaisedButton onClick={_ => props.onSearchClick(state.query)} label='Search All Lists' labelStyle={{textTransform: 'none'}} />
        </div>
        {props.isReceiving ? <span>WAITING</span> :
          props.results.map((contact, i) => <ContactItem key={i} {...contact} />)
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
    onSearchClick: query => dispatch(actions.fetchSearch(query))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(SearchBar);
