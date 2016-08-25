import React, { Component } from 'react';
import {
  EditorState,
  RichUtils,
  Editor,
  CompositeDecorator
} from 'draft-js';

import InlineStyleControls from './InlineStyleControls.react';
import BlockStyleControls from './BlockStyleControls.react';
import Subject from './Subject.react';
import CurlySpan from './CurlySpan.react';

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

// Custom overrides for 'code' style.
const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
};

const placeholder = 'Tip: Did you know you can use the column names as variables in your template email? E.g. "Hi {firstname}! It was so good to see you at {location} the other day...';

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote': return 'RichEditor-blockquote';
    default: return null;
  }
}

class EmailEditor extends Component {
  constructor(props) {
    super(props);

    const compositeDecorator = new CompositeDecorator([{
      strategy: curlyStrategy,
      component: CurlySpan
    }]);

    this.state = {
      editorState: EditorState.createEmpty(compositeDecorator),
    };

    this.focus = () => this.refs.editor.focus();
    this.onChange = (editorState) => {
      const { _setBody } = this.props;
      // save text body to send
      // const content = editorState.getCurrentContent();
      _setBody(editorState);
      this.setState({editorState});
    };
    this.handleKeyCommand = (command) => this._handleKeyCommand(command);
    this.toggleBlockType = (type) => this._toggleBlockType(type);
    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
  }


  _handleKeyCommand(command) {
    const { editorState } = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _handleSubjectKeyCommand(command) {
    const { subjectEditorState } = this.state;
    const newState = RichUtils.handleKeyCommand(subjectEditorState, command);
    if (newState) {
      this.onSubjectChange(newState);
      return true;
    }
    return false;
  }

  _toggleBlockType(blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    );
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  render() {
    const { editorState } = this.state;
    const props = this.props;

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = 'RichEditor-editor';
    const contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' RichEditor-hidePlaceholder';
      }
    }

    return (
      <div>
        <div className='RichEditor-root' style={props.style}>
          <div className='RichEditor-controls RichEditor-styleButton'>
            <span>Emails are sent from: {props.person.email}</span>
          </div>
          <BlockStyleControls
              editorState={editorState}
              onToggle={this.toggleBlockType}
          />
          <InlineStyleControls
              editorState={editorState}
              onToggle={this.toggleInlineStyle}
          />
          <div>
            <Subject
              _setSubjectLine={props._setSubjectLine}
            />
          </div>
          <div className={className} onClick={this.focus}>
            <Editor
              blockStyleFn={getBlockStyle}
              customStyleMap={styleMap}
              editorState={editorState}
              handleKeyCommand={this.handleKeyCommand}
              onChange={this.onChange}
              placeholder={placeholder}
              ref='editor'
              spellCheck
            />
          </div>
        </div>
      </div>
    );
  }
}

export default EmailEditor;
