import React from 'react';
import debounce from 'lodash/debounce';
import {stateToHTML} from 'draft-js-export-html';
import {
  Editor,
  EditorState,
  ContentState,
  Entity,
  RichUtils,
  convertToRaw,
  CompositeDecorator,
  Modifier,
} from 'draft-js';
import draftRawToHtml from './utils/draftRawToHtml';
// import htmlToContent from './utils/htmlToContent';
import {convertFromHTML} from 'draft-convert';

import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Checkbox from 'material-ui/Checkbox';
import Popover from 'material-ui/Popover';
import Paper from 'material-ui/Paper';
import FontIcon from 'material-ui/FontIcon';
import {blue100, grey300} from 'material-ui/styles/colors';

import Subject from './Subject.react';
import Link from './components/Link';
import CurlySpan from './components/CurlySpan.react';
import EntityControls from './components/EntityControls';
import InlineStyleControls from './components/InlineStyleControls';
import BlockStyleControls from './components/BlockStyleControls';
import alertify from 'alertifyjs';

import 'node_modules/draft-js/dist/Draft.css';

import {curlyStrategy, findEntities} from './utils/strategies';

const placeholder = 'Tip: Use column names as variables in your template email. E.g. "Hi {firstname}! It was so good to see you at {location} the other day...';

class BasicHtmlEditor extends React.Component {
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

    this.ENTITY_CONTROLS = [
      {label: 'Add Link', action: this._addLink.bind(this) },
      {label: 'Remove Link', action: this._removeLink.bind(this) }
    ];

    this.INLINE_STYLES = [
      {label: 'Bold', style: 'BOLD', icon: 'fa fa-bold'},
      {label: 'Italic', style: 'ITALIC', icon: 'fa fa-italic'},
      {label: 'Underline', style: 'UNDERLINE', icon: 'fa fa-underline'},
      {label: 'Monospace', style: 'CODE'},
      {label: 'Strikethrough', style: 'STRIKETHROUGH', icon: 'fa fa-strikethrough'}
    ];

    this.BLOCK_TYPES = [
      {label: 'Normal', style: 'unstyled'},
      {label: 'Heading - Large', style: 'header-one'},
      {label: 'Heading - Medium', style: 'header-two'},
      {label: 'Blockquote', style: 'blockquote'},
      {label: 'Unordered List', style: 'unordered-list-item'},
      {label: 'Ordered List', style: 'ordered-list-item'},
      {label: 'Code Block', style: 'code-block'}
    ];

    this.state = {
      editorState: EditorState.createEmpty(decorator),
      bodyHtml: null,
      variableMenuOpen: false,
      variableMenuAnchorEl: null,
      isStyleBlockOpen: true,
      styleBlockAnchorEl: null
    };

    this.focus = () => this.refs.editor.focus();
    this.onChange = (editorState) => {
      let previousContent = this.state.editorState.getCurrentContent();
      this.setState({editorState});

      // only emit html when content changes
      if (previousContent !== editorState.getCurrentContent()) {
        this.emitHTML(editorState);
      }
    };
    this.handleTouchTap = (event) => {
      event.preventDefault();
      this.setState({
        variableMenuOpen: true,
        variableMenuAnchorEl: event.currentTarget,
      });
    };
    function emitHTML(editorState) {
      const raw = convertToRaw(editorState.getCurrentContent());
      let html = draftRawToHtml(raw);
      // console.log(html);
      this.props.onBodyChange(html);
    }
    this.emitHTML = debounce(emitHTML, this.props.debounce);
    this.insertText = this._insertText.bind(this);
    this.handleKeyCommand = (command) => this._handleKeyCommand(command);
    this.toggleBlockType = (type) => this._toggleBlockType(type);
    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
    this.handleReturn = (e) => this._handleReturn(e);
    this.addLink = this._addLink.bind(this);
    this.removeLink = this._removeLink.bind(this);
    this.onCheck = (e, checked) => this.setState({isStyleBlockOpen: checked});
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.bodyHtml !== this.state.bodyHtml) {
      console.log('change template');
      // const content = ContentState.createFromBlockArray(htmlToContent(nextProps.bodyHtml));
      const content = convertFromHTML(nextProps.bodyHtml);
      const editorState = EditorState.push(this.state.editorState, content, 'insert-fragment');
      this.onChange(editorState);
      this.setState({bodyHtml: nextProps.bodyHtml});
    }
  }

  _insertText(replaceText) {
    const {editorState} = this.state;
    const content = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const newContent = Modifier.insertText(content, selection, '{' + replaceText + '}');
    const newEditorState = EditorState.push(editorState, newContent, 'insert-fragment');
    this.onChange(newEditorState);
  }

  _handleKeyCommand(command) {
    const {editorState} = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _handleReturn(e) {
    if (e.metaKey === true) {
      return this._addLineBreak();
    } else {
      return false;
    }
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

  _addLineBreak(/* e */) {
    let newContent, newEditorState;
    const {editorState} = this.state;
    const content = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const block = content.getBlockForKey(selection.getStartKey());

    // console.log(content.toJS(), selection.toJS(), block.toJS());

    if (block.type === 'code-block') {
      newContent = Modifier.insertText(content, selection, '\n');
      newEditorState = EditorState.push(editorState, newContent, 'add-new-line');
      this.onChange(newEditorState);
      return true;
    } else {
      return false;
    }
  }

  _addLink(/* e */) {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (selection.isCollapsed()) {
      return;
    }
    const href = alertify.prompt('', 'Enter a URL', 'https://',
      (e, href) => {
        const entityKey = Entity.create('link', 'MUTABLE', {href});
        this.onChange(RichUtils.toggleLink(editorState, selection, entityKey));
      },
      _ => {});
  }

  _removeLink(/* e */) {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (selection.isCollapsed()) {
      return;
    }
    this.onChange( RichUtils.toggleLink(editorState, selection, null));
  }

  render() {
    const {editorState} = this.state;
    const props = this.props;
    const state = this.state;

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = 'RichEditor-editor';
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' RichEditor-hidePlaceholder';
      }
    }
    const bottomBlockStyle = {
      position: 'absolute',
      bottom: 3,
      display: 'flex',
      justifyContent: 'space-between',
      width: props.width,
      paddingRight: 30
    };

    return (
      <div>
        <div className='vertical-center'>
        <Checkbox
        checked={state.isStyleBlockOpen}
        checkedIcon={<FontIcon className='fa fa-file-text' color={blue100}/>}
        uncheckedIcon={<FontIcon className='fa fa-file-text' color={grey300} />}
        onCheck={this.onCheck}
        iconStyle={{fontSize: 16, padding: 2, marginRight: 10}}
        />
       {state.isStyleBlockOpen &&
          <Paper zDepth={2} style={{position: 'fixed', marginLeft: 35, zIndex: 200}}>
            <div className='vertical-center' style={{paddingLeft: 10, paddingRight: 10}}>
              <InlineStyleControls
                editorState={editorState}
                onToggle={this.toggleInlineStyle}
                inlineStyles={this.INLINE_STYLES}
              />
              <EntityControls
                editorState={editorState}
                entityControls={this.ENTITY_CONTROLS}
              />
              <BlockStyleControls
              editorState={editorState}
              blockTypes={this.BLOCK_TYPES}
              onToggle={this.toggleBlockType}
              />
            </div>
          </Paper>}
        </div>
        <FlatButton
        label='Insert Content'
        labelStyle={{textTransform: 'none'}}
        onClick={e => this.setState({variableMenuOpen: true, variableMenuAnchorEl: e.currentTarget})}
        />
        <Popover
        open={state.variableMenuOpen}
        anchorEl={state.variableMenuAnchorEl}
        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
        onRequestClose={_ => this.setState({variableMenuOpen: false})}
        >
          <Menu desktop>
          {props.fieldsmap.map((field, i) =>
            <MenuItem key={i} primaryText={field.name} onClick={_ => {
              this.insertText(field.name);
              this.setState({variableMenuOpen: false});
            }} />)}
          </Menu>
        </Popover>
        <div style={{marginTop: '8px'}}>
          <Subject
          onSubjectChange={props.onSubjectChange}
          subjectHtml={props.subjectHtml}
          />
        </div>
        <div className={className} onClick={this.focus}>
          <Editor
            blockStyleFn={getBlockStyle}
            customStyleMap={styleMap}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            handleReturn={this.handleReturn}
            onChange={this.onChange}
            placeholder={placeholder}
            ref='editor'
            spellCheck
          />
        </div>
         <div style={bottomBlockStyle}>{props.children}</div>
      </div>
    );
  }
}

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2
  }
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote': return 'RichEditor-blockquote';
    default: return null;
  }
}

export default BasicHtmlEditor;

