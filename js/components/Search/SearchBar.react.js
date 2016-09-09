import React, {Component} from 'react';
import {connect} from 'react-redux';
import TextField from 'material-ui/TextField';


class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: ''
    };
  }

  render() {
    return <div>
      <TextField
      hintText='Search query here...'
      onChange={e => this.setState({query: e.target.value})}
      />
    </div>;
  }
}

const mapStateToProps = state => {
  return {
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: action => dispatch(action),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(SearchBar);
