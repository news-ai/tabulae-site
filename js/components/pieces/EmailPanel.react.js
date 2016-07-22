import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Editor, EditorState } from 'draft-js';

class EmailPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this._onChange = this._onChange.bind(this);
  }

  _onChange(editorState) {
    this.setState({ editorState });
  }

  render() {
    return (
      <div>
      </div>
      );
  }
}

const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: action => dispatch(action)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EmailPanel);

