import React, {Component} from 'react';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import find from 'lodash/find';
import {connect} from 'react-redux';
import Draft, {
  Editor,
  EditorState,
  ContentState,
  Entity,
  RichUtils,
  SelectionState,
  convertToRaw,
  convertFromRaw,
  CompositeDecorator,
  Modifier,
} from 'draft-js';
import draftRawToHtml from 'components/Email/EmailPanel/utils/draftRawToHtml';
// import htmlToContent from './utils/htmlToContent';
import {convertFromHTML} from 'draft-convert';
import {actions as imgActions} from 'components/Email/EmailPanel/Image';
import {INLINE_STYLES, BLOCK_TYPES, POSITION_TYPES, FONTSIZE_TYPES} from 'components/Email/EmailPanel/utils/typeConstants';
import {stripATextNodeFromContent, getBlockStyle, blockRenderMap, styleMap} from 'components/Email/EmailPanel/utils/renderers';

import Dropzone from 'react-dropzone';
import Paper from 'material-ui/Paper';

import Subject from 'components/Email/EmailPanel/Subject.react';
import Link from 'components/Email/EmailPanel/components/Link';
import CurlySpan from 'components/Email/EmailPanel/components/CurlySpan.react';
import EntityControls from 'components/Email/EmailPanel/components/EntityControls';
import InlineStyleControls from 'components/Email/EmailPanel/components/InlineStyleControls';
import BlockStyleControls from 'components/Email/EmailPanel/components/BlockStyleControls';
import FontSizeControls from 'components/Email/EmailPanel/components/FontSizeControls';
import ExternalControls from 'components/Email/EmailPanel/components/ExternalControls';
import PositionStyleControls from 'components/Email/EmailPanel/components/PositionStyleControls';
import Image from 'components/Email/EmailPanel/Image/Image.react';
import FileWrapper from 'components/Email/EmailPanel/FileWrapper.react';
import alertify from 'alertifyjs';
import sanitizeHtml from 'sanitize-html';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import isURL from 'validator/lib/isURL';
import ValidationHOC from 'components/ContactProfile/ContactPublications/ValidationHOC.react';
import RaisedButton from 'material-ui/RaisedButton';

import {curlyStrategy, findEntities} from 'components/Email/EmailPanel/utils/strategies';

const placeholder = 'Tip: Use column names as variables in your template email. E.g. "Hi {firstname}! It was so good to see you at {location} the other day...';

import linkifyIt from 'linkify-it';
import tlds from 'tlds';

const linkify = linkifyIt();
linkify
.tlds(tlds)
.set({fuzzyLink: false});

const controlsStyle = {
  height: 40,
  zIndex: 200,
  overflow: 'hidden',
  paddingLeft: 10,
  paddingRight: 10,
  backgroundColor: 'white',
};

const Media = props => {
  const {block, contentState} = props;
  const entityKey = block.getEntityAt(0);
  if (entityKey === null) return null;
  const entity = contentState.getEntity(entityKey);
  const {src} = entity.getData();
  const type = entity.getType();

  let media;
  if (type === 'IMAGE') {
    media = <Image diableToolbar src={src}/>;
  }
  return media;
};

function mediaBlockRenderer(block) {
  if (block.getType() === 'atomic') {
    return {
      component: Media,
      editable: false
    };
  }
  return null;
}

class GeneralEditor extends Component {
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

    this.ENTITY_CONTROLS = [
      {label: 'Manage Link', action: this._manageLink.bind(this), icon: 'fa fa-link', entityType: 'LINK'}
    ];

    this.EXTERNAL_CONTROLS = [
      // {
      //   label: 'File Upload',
      //   onToggle: _ => this.setState({filePanelOpen: true}),
      //   icon: 'fa fa-paperclip',
      //   isActive: _ => this.props.files.length > 0,
      // },
      // {
      //   label: 'Image Upload',
      //   onToggle: _ => this.setState({imagePanelOpen: true}),
      //   icon: 'fa fa-camera',
      //   isActive: _ => false
      // }
    ];

    this.CONVERT_CONFIGS = {
      htmlToStyle: (nodeName, node, currentStyle) => {
        if (nodeName === 'span') {
          const fontSize = node.style.fontSize.substring(0, node.style.fontSize.length - 2);
          const foundType = find(FONTSIZE_TYPES, type => type.label === fontSize);
          if (foundType) return currentStyle.add(foundType.style);
          return currentStyle;
        } else {
          return currentStyle;
        }
      },
      htmlToEntity: (nodeName, node) => {
        if (nodeName === 'a') {
          if (node.firstElementChild === null) {
            // LINK ENTITY
            return Entity.create('LINK', 'MUTABLE', {url: node.href});
          } else if (node.firstElementChild.nodeName === 'IMG') {
            // IMG ENTITY
            const imgNode = node.firstElementChild;
            const src = imgNode.src;
            const size = parseFloat(imgNode.style['max-height']) / 100;
            const imageLink = node.href;
            const imgReducerObj = this.props.emailImageReducer[src];
            const entityKey = Entity.create('IMAGE', 'IMMUTABLE', {src,
              size: imgNode.style['max-height'],
              imageLink: imageLink || '#',
              align: imgReducerObj.align
            });
            this.props.saveImageData(src);
            this.props.saveImageEntityKey(src, entityKey);
            this.props.setImageSize(src, size);
            if (imageLink.length > 0) {
              this.props.setImageLink(src, imageLink);
            } else {
              this.props.setImageLink(src, undefined);
            }
            return entityKey;
          }
        }
      },
      htmlToBlock: (nodeName, node) => {
        if (nodeName === 'figure') {
          return 'atomic';
        }
        if (nodeName === 'p' || nodeName === 'div') {
          if (node.style.textAlign === 'center') {
            return {
              type: 'center-align',
              data: {}
            };
          } else if (node.style.textAlign === 'right') {
            return {
              type: 'right-align',
              data: {}
            };
          } else if (node.style.textAlign === 'justify') {
            return {
              type: 'justify-align',
              data: {}
            };
          }
        }
      },
    };

    this.state = {
      editorState: EditorState.createEmpty(decorator),
      bodyHtml: this.props.bodyHtml || null,
      imageLink: ''
    };

    this.focus = () => this.refs.editor.focus();
    this.onChange = this._onChange.bind(this);
    function emitHTML(editorState) {
      let raw = convertToRaw(editorState.getCurrentContent());
      // cleanup mismatching raw entityMap and entity values
      // hack!! until convertToRaw actually converts current entity data in editorState
      let entityMap = raw.entityMap;
      const keys = Object.keys(entityMap);
      keys.map(key => {
        const entity = entityMap[key];
        if (entity.type === 'IMAGE') {
          const imgReducerObj = this.props.emailImageReducer[entity.data.src];
          entityMap[key].data = Object.assign({}, entityMap[key].data, {
            size: `${~~(imgReducerObj.size * 100)}%`,
            imageLink: imgReducerObj.imageLink || '#',
            align: imgReducerObj.align || 'left',
          });
        }
      });
      raw.entityMap = entityMap;
      // end hack
      let html = draftRawToHtml(raw);
      this.props.onBodyChange(html);
    }
    this.emitHTML = debounce(emitHTML, this.props.debounce);
    this.insertText = this._insertText.bind(this);
    this.handleKeyCommand = this._handleKeyCommand.bind(this);
    this.toggleBlockType = this._toggleBlockType.bind(this);
    this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
    this.handleReturn = this._handleReturn.bind(this);
    this.addLink = this._addLink.bind(this);
    this.removeLink = this._removeLink.bind(this);
    this.manageLink = this._manageLink.bind(this);
    this.onCheck = _ => this.setState({isStyleBlockOpen: !this.state.isStyleBlockOpen});
    this.handlePastedText = this._handlePastedText.bind(this);
    this.handleDroppedFiles = this._handleDroppedFiles.bind(this);
    this.handleBeforeInput = this._handleBeforeInput.bind(this);
    this.linkifyLastWord = this._linkifyLastWord.bind(this);
  }

  componentDidMount() {
    if (!isEmpty(this.props.bodyHtml)) {
      const configuredContent = convertFromHTML(this.CONVERT_CONFIGS)(this.props.bodyHtml);
      const newContent = stripATextNodeFromContent(configuredContent);
      const editorState = EditorState.push(this.state.editorState, newContent, 'insert-fragment');
      this.onChange(editorState);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.bodyHtml !== this.state.bodyHtml) {
      console.log('change template');
      const configuredContent = convertFromHTML(this.CONVERT_CONFIGS)(nextProps.bodyHtml);
      const newContent = stripATextNodeFromContent(configuredContent);
      const editorState = EditorState.push(this.state.editorState, newContent, 'insert-fragment');
      this.onChange(editorState);
      this.setState({bodyHtml: nextProps.bodyHtml});
    }

    if (!this.props.updated && nextProps.updated) {
      const emailImageObject = nextProps.emailImageReducer[nextProps.current];
      const entityKey = emailImageObject.entityKey;
      Entity.replaceData(entityKey, {
        src: nextProps.current,
        size: `${~~(emailImageObject.size * 100)}%`,
        imageLink: emailImageObject.imageLink || '#'
      });
      this.props.onImageUpdated();
      this.emitHTML(this.state.editorState);
    }
  }
  componentWillUnmount() {
    this.props.clearAttachments();
  }

  _onChange(editorState) {
    let previousContent = this.state.editorState.getCurrentContent();
    this.setState({editorState});

    // only emit html when content changes
    if (previousContent !== editorState.getCurrentContent()) {
      this.emitHTML(editorState);
    }
  }

  _linkifyLastWord(insertChar = '') {
    // check last words in a block and linkify if detect link
    // insert special char after handling linkify case
    let editorState = this.state.editorState;
    let handled = 'not-handled';
    if (editorState.getSelection().getHasFocus() && editorState.getSelection().isCollapsed()) {
      const selection = editorState.getSelection();
      const focusKey = selection.getFocusKey();
      const focusOffset = selection.getFocusOffset();
      const block = editorState.getCurrentContent().getBlockForKey(focusKey);
      const links = linkify.match(block.get('text'));
      if (typeof links !== 'undefined' && links !== null) {
        for (let i = 0; i < links.length; i++) {
          if (links[i].lastIndex === focusOffset) {
            // last right before space inserted
            let selectionState = SelectionState.createEmpty(block.getKey());
            selectionState = selection.merge({
              anchorKey: block.getKey(),
              anchorOffset: focusOffset - links[i].raw.length,
              focusKey: block.getKey(),
              focusOffset
            });
            editorState = EditorState.acceptSelection(editorState, selectionState);

            // check if entity exists already
            const startOffset = selectionState.getStartOffset();
            const endOffset = selectionState.getEndOffset();

            let linkKey;
            let hasEntityType = false;
            for (let j = startOffset; j < endOffset; j++) {
              linkKey = block.getEntityAt(j);
              if (linkKey !== null) {
                const type = editorState.getCurrentContent().getEntity(linkKey).getType();
                if (type === 'LINK') {
                  hasEntityType = true;
                  break;
                }
              }
            }

            if (!hasEntityType) {
              // insert space
              const content = editorState.getCurrentContent();
              const newContent = Modifier.insertText(content, selection, insertChar);
              editorState = EditorState.push(editorState, newContent, 'insert-fragment');

              handled = 'handled';
              // insert entity if no entity exist
              const entityKey = editorState.getCurrentContent().createEntity('LINK', 'MUTABLE', {url: links[i].url}).getLastCreatedEntityKey();
              editorState = RichUtils.toggleLink(editorState, selectionState, entityKey);

              // move selection focus back to original spot
              selectionState = selectionState.merge({
                anchorKey: block.getKey(),
                anchorOffset: focusOffset + 1, // add 1 for space in front of link
                focusKey: block.getKey(),
                focusOffset: focusOffset + 1
              });
              editorState = EditorState.acceptSelection(editorState, selectionState);
              this.onChange(editorState);
            }
            break;
          }
        }
      }
    }
    return handled;
  }

  _handleBeforeInput(lastInsertedChar) {
    let handled = 'not-handled';
    if (lastInsertedChar === ' ') handled = this.linkifyLastWord(' ');
    return handled;
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
      return 'not-handled';
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
      return 'handled';
    }
    return 'not-handled';
  }

  _manageLink() {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    if (selection.isCollapsed()) return;
    const startKey = selection.getStartKey();
    const startOffset = selection.getStartOffset();
    const endOffset = selection.getEndOffset();
    const blockAtLinkBeginning = contentState.getBlockForKey(startKey);
    let i;
    let linkKey;
    let hasEntityType = false;
    for (i = startOffset; i < endOffset; i++) {
      linkKey = blockAtLinkBeginning.getEntityAt(i);
      if (linkKey !== null) {
        const type = contentState.getEntity(linkKey).getType();
        if (type === 'LINK') {
          hasEntityType = true;
          break;
        }
      }
    }
    if (hasEntityType) {
      // REMOVE LINK
      this.removeLink();
    } else {
      // ADD LINK
      this.addLink();
    }
  }

  _addLink(/* e */) {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    if (selection.isCollapsed()) return;
    alertify.prompt(
      '',
      'Enter a URL',
      'http://',
      (e, url) => {
        const entityKey = contentState.createEntity('LINK', 'MUTABLE', {url}).getLastCreatedEntityKey();
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
    this.onChange(RichUtils.toggleLink(editorState, selection, null));
  }

  _handlePastedText(text, html) {
    const {editorState} = this.state;
    let newState;
    let blockMap;
    // let blockArray;
    let contentState;

    if (html) {
      const saneHtml = sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['span']),
        allowedAttributes: {
          p: ['style'],
          div: ['style'],
          span: ['style'],
          a: ['href']
        }
      });
      contentState = convertFromHTML(this.CONVERT_CONFIGS)(saneHtml);
      blockMap = contentState.getBlockMap();
    } else {
      contentState = ContentState.createFromText(text.trim());
      blockMap = contentState.blockMap;
    }

    const prePasteSelection = editorState.getSelection();
    const prePasteNextBlock = editorState.getCurrentContent().getBlockAfter(prePasteSelection.getEndKey());

    newState = Modifier.replaceWithFragment(editorState.getCurrentContent(), editorState.getSelection(), blockMap);
    let newEditorState = EditorState.push(editorState, newState, 'insert-fragment');

    let inPasteRange = false;
    newEditorState.getCurrentContent().getBlockMap().forEach((block, key) => {
      if (prePasteNextBlock && key === prePasteNextBlock.getKey()) {
        // hit next block pre-paste, stop linkify
        return false;
      }
      if (key === prePasteSelection.getStartKey() || inPasteRange) {
        inPasteRange = true;
        const links = linkify.match(block.get('text'));
        if (typeof links !== 'undefined' && links !== null) {
          for (let i = 0; i < links.length; i++) {
            let selectionState = SelectionState.createEmpty(block.getKey());
            selectionState = newEditorState.getSelection().merge({
              anchorKey: block.getKey(),
              anchorOffset: links[i].index,
              focusKey: block.getKey(),
              focusOffset: links[i].lastIndex
            });
            newEditorState = EditorState.acceptSelection(newEditorState, selectionState);

            // check if entity exists already
            const startOffset = selectionState.getStartOffset();
            const endOffset = selectionState.getEndOffset();

            let linkKey;
            let hasEntityType = false;
            for (let j = startOffset; j < endOffset; j++) {
              linkKey = block.getEntityAt(j);
              if (linkKey !== null) {
                const type = contentState.getEntity(linkKey).getType();
                if (type === 'LINK') {
                  hasEntityType = true;
                  break;
                }
              }
            }
            if (!hasEntityType) {
              // insert entity if no entity exist
              const entityKey = newEditorState.getCurrentContent().createEntity('LINK', 'MUTABLE', {url: links[i].url}).getLastCreatedEntityKey();
              newEditorState = RichUtils.toggleLink(newEditorState, selectionState, entityKey);
            }
          }
        }
      }
    });

    newEditorState = EditorState.forceSelection(newEditorState, prePasteSelection);

    this.onChange(newEditorState);
    return true;
  }

  _handleDroppedFiles(selection, files) {
    alertify.warning('Image operations not available at this point.');
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

    return (
      <div>
        <Subject
        onSubjectChange={props.onSubjectChange}
        subjectHtml={props.subjectHtml}
        width={props.width}
        />
        <div style={{
          height: 480,
          overflowY: 'scroll',
        }}>
          <div className={className} onClick={this.focus}>
            <Editor
            blockStyleFn={getBlockStyle}
            blockRendererFn={mediaBlockRenderer}
            blockRenderMap={extendedBlockRenderMap}
            customStyleMap={styleMap}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            handleReturn={this.handleReturn}
            handlePastedText={this.handlePastedText}
            handleDroppedFiles={this.handleDroppedFiles}
            handleBeforeInput={this.handleBeforeInput}
            onChange={this.onChange}
            placeholder={placeholder}
            ref='editor'
            spellCheck
            />
          </div>
        </div>
        <Paper zDepth={1} className='row vertical-center clearfix' style={controlsStyle}>
          <InlineStyleControls
          editorState={editorState}
          onToggle={this.toggleInlineStyle}
          inlineStyles={INLINE_STYLES}
          />
          <EntityControls
          editorState={editorState}
          entityControls={this.ENTITY_CONTROLS}
          />
          <ExternalControls
          editorState={editorState}
          externalControls={this.EXTERNAL_CONTROLS}
          active={props.files.length > 0}
          />
          <PositionStyleControls
          editorState={editorState}
          blockTypes={POSITION_TYPES}
          onToggle={this.toggleBlockType}
          />
          <FontSizeControls
          editorState={editorState}
          onToggle={this.toggleInlineStyle}
          inlineStyles={FONTSIZE_TYPES}
          />
          <BlockStyleControls
          editorState={editorState}
          blockTypes={BLOCK_TYPES}
          onToggle={this.toggleBlockType}
          />
        </Paper>
      </div>
    );
  }
}

const extendedBlockRenderMap = Draft.DefaultDraftBlockRenderMap.merge(blockRenderMap);

const mapStateToProps = (state, props) => {
  return {
    files: state.emailAttachmentReducer.attached,
    emailImageReducer: state.emailImageReducer,
    updated: state.emailImageReducer.updated,
    current: state.emailImageReducer.current,
    person: state.personReducer.person
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    setAttachments: files => dispatch({type: 'SET_ATTACHMENTS', files}),
    clearAttachments: _ => dispatch({type: 'CLEAR_ATTACHMENTS'}),
    uploadImage: file => dispatch(imgActions.uploadImage(file)),
    saveImageData: src => dispatch({type: 'IMAGE_UPLOAD_RECEIVE', src}),
    saveImageEntityKey: (src, key) => dispatch({type: 'SAVE_IMAGE_ENTITY_KEY', entityKey: key, src}),
    setImageSize: (src, size) => dispatch({type: 'SET_IMAGE_SIZE', size, src: src}),
    setImageLink: (src, imageLink) => dispatch({type: 'SET_IMAGE_LINK', imageLink, src: src}),
    setImageAlignment: (src, align) => dispatch({type: 'SET_IMAGE_ALIGN', align, src: src}),
    onImageUpdated: _ => dispatch({type: 'ON_IMAGE_UPDATED'})
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GeneralEditor);
