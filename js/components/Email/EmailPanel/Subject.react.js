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
import {curlyStrategy, findEntities} from './utils/strategies';

import {is} from 'immutable';

const MAX_LENGTH = 15;

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
    // this.truncateText = this._truncateText.bind(this);

    this.onChange = (editorState) => {
      // const subject = editorState.getCurrentContent().getBlocksAsArray()[0].getText();
      // if (subject.length > MAX_LENGTH) {
      //   const newEditorState = this.truncateText(editorState, MAX_LENGTH);
      //   this.props.onSubjectChange(newEditorState);
      //   this.setState({editorState: newEditorState});
      // } else {
      this.props.onSubjectChange(editorState);
      this.setState({editorState});
      // }
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.subjectHtml !== this.state.subjectHtml) {
      const content = ContentState.createFromText(nextProps.subjectHtml);
      // const editorState = EditorState.push(this.state.editorState, content, 'insert-fragment');
      const editorState = EditorState.push(this.state.editorState, content, 'insert-fragment');
      this.setState({subjectHtml: nextProps.subjectHtml});
      this.onChange(editorState);
    }
  }

  // _truncateText(editorState, charCount) {
  //   const contentState = editorState.getCurrentContent();
  //   const blocks = contentState.getBlockMap();

  //   let count = 0;
  //   let isTruncated = false;
  //   const truncatedBlocks = [];
  //   blocks.forEach((block) => {
  //     if (!isTruncated) {
  //       const length = block.getLength();
  //       if (count + length > charCount) {
  //         isTruncated = true;
  //         const truncatedText = block.getText().slice(0, charCount - count);
  //         const state = ContentState.createFromText(`${truncatedText}...`);
  //         truncatedBlocks.push(state.getFirstBlock());
  //       } else {
  //         truncatedBlocks.push(block);
  //       }
  //       count += length + 1;
  //     }
  //   });

  //   if (isTruncated) {
  //     const state = ContentState.createFromBlockArray(truncatedBlocks);
  //     return EditorState.createWithContent(state);
  //   }

  //   return editorState;
  // }

  render() {
    const {editorState} = this.state;
    return (
      <Editor
      editorState={editorState}
      onChange={this.onChange}
      handleReturn={e => 'handled'}
      placeholder='Subject...'
      />
    );
  }
}

export default Subject;

