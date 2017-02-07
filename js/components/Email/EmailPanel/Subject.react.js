import React, {Component} from 'react';
import {
  Editor,
  EditorState,
  CompositeDecorator,
  ContentState,
} from 'draft-js';

import Link from './components/Link';
import CurlySpan from './components/CurlySpan.react';
import {curlyStrategy, findEntities} from './utils/strategies';
import {grey500} from 'material-ui/styles/colors';

const MAX_LENGTH = 255;

class Subject extends Component {
  constructor(props) {
    super(props);
    const decorator = new CompositeDecorator([
      {
        strategy: findEntities.bind(null, 'LINK'),
        component: Link
      },
      {
        strategy: curlyStrategy,
        component: CurlySpan
      }
    ]);

    this.state = {
      editorState: EditorState.createEmpty(decorator),
      subjectHtml: null,
      subjectLength: 0
    };
    this.truncateText = this._truncateText.bind(this);

    this.onChange = (editorState) => {
      const subject = editorState.getCurrentContent().getBlocksAsArray()[0].getText();
      const subjectLength = subject.length;
      if (subject.length > MAX_LENGTH) {
        const newEditorState = this.truncateText(editorState, MAX_LENGTH);
        this.props.onSubjectChange(newEditorState);
        this.setState({editorState: newEditorState, subjectLength});
      } else {
        this.props.onSubjectChange(editorState);
        this.setState({editorState, subjectLength});
      }
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

  _truncateText(editorState, charCount) {
    const contentState = editorState.getCurrentContent();
    const blocks = contentState.getBlockMap();

    let count = 0;
    let isTruncated = false;
    const truncatedBlocks = [];
    blocks.forEach((block) => {
      if (!isTruncated) {
        const length = block.getLength();
        if (count + length > charCount) {
          isTruncated = true;
          const truncatedText = block.getText().slice(0, charCount - count);
          const state = ContentState.createFromText(truncatedText);
          truncatedBlocks.push(state.getFirstBlock());
        } else {
          truncatedBlocks.push(block);
        }
        count += length + 1;
      }
    });

    if (isTruncated) {
      const state = ContentState.createFromBlockArray(truncatedBlocks);
      return EditorState.createWithContent(state);
    }

    return editorState;
  }

  render() {
    const {editorState, subjectLength} = this.state;
    return (
      <div
      style={{marginTop: 12}}
      className='vertical-center'
      >
        <div
        className='subject-draft-container'
        style={{
          width: 500,
          height: 32,
          overflowX: 'scroll',
          marginRight: 5,
        }}>
          <Editor
          editorState={editorState}
          onChange={this.onChange}
          handleReturn={e => 'handled'}
          placeholder='Subject...'
          />
        </div>
        <div
        style={{
          width: 20,
          height: 32,
        }}>
          <span style={{fontSize: '0.9em', color: grey500}}>{subjectLength}</span>
        </div>
      </div>
    );
  }
}

export default Subject;

