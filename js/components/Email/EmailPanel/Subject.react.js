import React, {Component} from 'react';
import {
  Editor,
  EditorState,
  CompositeDecorator,
  ContentState,
  convertFromHTML
} from 'draft-js';

import Link from './components/Link';
import CurlySpan from './components/CurlySpan.react';
import { curlyStrategy, findEntities } from './utils/strategies';

class Subject extends Component {
  constructor(props) {
    super(props);
    const decorator = new CompositeDecorator([
      {
        strategy: findEntities.bind(null, 'link'),
        component: Link
      },
      {
        strategy: curlyStrategy,
        component: CurlySpan
      }
    ]);

    this.state = {
      editorState: EditorState.createEmpty(decorator),
      subjectHtml: null
    };

    this.onChange = (editorState) => {
      this.props.onSubjectChange(editorState);
      this.setState({editorState});
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.subjectHtml !== this.state.subjectHtml) {
      const content = ContentState.createFromText(nextProps.subjectHtml);
      // const editorState = EditorState.push(this.state.editorState, content, 'insert-fragment');
      const editorState = EditorState.push(this.state.editorState, content, 'insert-fragment');
      this.setState({editorState, subjectHtml: nextProps.subjectHtml});
    }
  }

  render() {
    const {editorState} = this.state;
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

