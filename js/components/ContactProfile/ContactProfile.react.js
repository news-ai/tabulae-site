import React, { PropTypes, Component } from 'react';
import {connect} from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';

class ContactProfile extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div>
    ContactProfile
    </div>;
  }
}

const mapStateToProps = (state, props) => {
  return {};
};

const mapDispatchToProps = (dispatch, props) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ContactProfile);
