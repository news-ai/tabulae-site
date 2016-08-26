import React, { Component } from 'react';
import {
  EditorState,
  RichUtils,
  CompositeDecorator,
  Entity,
  Editor,
  convertToRaw
} from 'draft-js';
import linkifyIt from 'linkify-it';
import alertify from 'alertifyjs';
import tlds from 'tlds';
import 'node_modules/alertifyjs/build/css/alertify.min.css';

const linkify = linkifyIt();
linkify
.tlds(tlds)
.add('git:', 'http:')
.add('ftp:', null)
.set({ fuzzyIP: true });

import InlineStyleControls from './InlineStyleControls.react';
import BlockStyleControls from './BlockStyleControls.react';
import Subject from './Subject.react';
import CurlySpan from './CurlySpan.react';
import LinkTag from './LinkTag.react';

import { curlyStrategy } from './strategies';

// Custom overrides for 'code' style.
const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
};

alertify.defaults.glossary.title = '';
function findLinkEntities(contentBlock, callback) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        Entity.get(entityKey).getType() === 'LINK'
      );
    },
    callback
  );
}


const placeholder = 'Tip: Did you know you can use the column names as variables in your template email? E.g. "Hi {firstname}! It was so good to see you at {location} the other day...';

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote': return 'RichEditor-blockquote';
    default: return null;
  }
}

const compositeDecorator = new CompositeDecorator([{
  strategy: curlyStrategy,
  component: CurlySpan
}, {
  strategy: findLinkEntities,
  component: LinkTag,
},
]);

class EmailEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(compositeDecorator),
    };

    this.focus = () => this.refs.editor.focus();
    this.onChange = (editorState) => {
      // save text body to send
      const content = editorState.getCurrentContent();
      this.props._setBody(editorState);
      this.setState({editorState});
    };
    this.handleKeyCommand = (command) => this._handleKeyCommand(command);
    this.toggleBlockType = (type) => this._toggleBlockType(type);
    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
    this.onInlineLinkClick = this._onInlineLinkClick.bind(this);
    this.confirmLink = this._confirmLink.bind(this);
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

  _onInlineLinkClick(e) {
    e.preventDefault();
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      alertify.prompt('Enter hyperlink', '',
        (e, value) => {
          this.confirmLink(value);
        },
        () => {

        });
    } else {
      alertify.alert('none selected');
    }
  }

  _confirmLink(value) {
    const {editorState} = this.state;
    const entityKey = Entity.create('LINK', 'MUTABLE', {url: value});
    this.setState({
      editorState: RichUtils.toggleLink(
        editorState,
        editorState.getSelection(),
        entityKey
      ),
    });
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

    const customInlineTypes = [{
      label: 'Hyperlink',
      style: 'LINK',
      onClick: this.onInlineLinkClick
    }];

    // move out of InlineStyleControls until I am done with the feature
    // customInlineTypes={customInlineTypes}

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
              customInlineTypes={[]}
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
