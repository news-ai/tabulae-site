import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Editor, EditorState} from 'draft-js';

class Subject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty()
    };
    this.onChange = (editorState) => {
      const { _setSubjectLine } = this.props;
      // save subject line to send 
      _setSubjectLine(editorState);
      this.setState({ editorState });
    };
  }

  render() {
    const { editorState } = this.state;
    return (
        <Editor
          editorState={editorState}
          onChange={this.onChange}
          placeholder='Subject...'
        />
    );
  }
}

export default Subject;