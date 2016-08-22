import React, {Component} from 'react';
import CurlySpan from './CurlySpan.react';
import {
  Editor,
  EditorState,
  CompositeDecorator
} from 'draft-js';

const CURLY_REGEX = /{([^}]+)}/g;

function findWithRegex(regex, contentBlock, callback) {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}

function curlyStrategy(contentBlock, callback) {
  findWithRegex(CURLY_REGEX, contentBlock, callback);
}

class Subject extends Component {
  constructor(props) {
    super(props);
    const compositeDecorator = new CompositeDecorator([{
      strategy: curlyStrategy,
      component: CurlySpan
    }]);

    this.state = {
      editorState: EditorState.createEmpty(compositeDecorator)
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