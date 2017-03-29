// @flow
import React from 'react';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import find from 'lodash/find';
import {connect} from 'react-redux';
import Draft, {
  Editor,
  EditorState,
  ContentState,
  SelectionState,
  Entity,
  RichUtils,
  AtomicBlockUtils,
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
import {stripATextNodeFromContent, mediaBlockRenderer, getBlockStyle, blockRenderMap, styleMap} from './utils/renderers';

import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import Popover from 'material-ui/Popover';
import Paper from 'material-ui/Paper';
import Dropzone from 'react-dropzone';
import {blue700, grey700, grey800} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';


import Subject from 'components/Email/EmailPanel/Subject.react';
import Link from 'components/Email/EmailPanel/components/Link';
import CurlySpan from 'components/Email/EmailPanel/components/CurlySpan.react';
import EntityControls from 'components/Email/EmailPanel/components/EntityControls';
import InlineStyleControls from 'components/Email/EmailPanel/components/InlineStyleControls';
import BlockStyleControls from 'components/Email/EmailPanel/components/BlockStyleControls';
import FontSizeControls from 'components/Email/EmailPanel/components/FontSizeControls';
import ExternalControls from 'components/Email/EmailPanel/components/ExternalControls';
import PositionStyleControls from 'components/Email/EmailPanel/components/PositionStyleControls';
import alertify from 'alertifyjs';
import sanitizeHtml from 'sanitize-html';
import Immutable from 'immutable';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import isURL from 'validator/lib/isURL';
import ValidationHOC from 'components/ContactProfile/ContactPublications/ValidationHOC.react';

import {curlyStrategy, findEntities} from 'components/Email/EmailPanel/utils/strategies';

const placeholder = 'Tip: Use column names as variables in your template email. E.g. "Hi {firstname}! It was so good to see you at {location} the other day...';

import linkifyIt from 'linkify-it';
import tlds from 'tlds';

const linkify = linkifyIt();
linkify
.tlds(tlds)
.set({fuzzyLink: false});

const controlsStyle = {
  position: 'fixed',
  height: 40,
  zIndex: 200,
  bottom: 60,
  // border: `solid 1px ${blue100}`,
  // borderRadius: '0.9em',
  backgroundColor: 'white',
};

class BasicHtmlEditor extends React.Component {
  state : {
    editorState: Object,
    bodyHtml: ?string,
    variableMenuOpen: bool,
    variableMenuAnchorEl: Object,
    isStyleBlockOpen: bool,
    styleBlockAnchorEl: Object,
    filePanelOpen: bool,
    imagePanelOpen: bool,
    imageLink: string
  };
  CONVERT_CONFIGS: Object;
  EXTERNAL_CONTROLS: Array<Object>;
  ENTITY_CONTROLS: Array<Object>;

  toggleMinimize: (event: Event) => void;
  focus: () => void;
  onChange: (editorState: Object) => void;
  handleTouchTap: (event: Event) => void;
  emitHTML: (editorState: Object) => void;
  insertText: (replaceText: string) => void;
  handleKeyCommand: (command: string) => bool;
  toggleBlockType: (blockType: string) => void;
  toggleInlineStyle: (inlineStyle: string) => void;
  handleReturn: (e: Event) => string;
  addLink: () => void;
  removeLink: () => void;
  manageLink: () => void;
  onCheck: () => void;
  handlePastedText: (text: string, html: string) => bool;
  handleDroppedFiles: (selection: Object, files: Array<Object>) => void;
  handleImage: (url: string) => Object;
  onImageUploadClicked: (acceptSelection: Array<Object>, rejectedFiles: Array<Object>) => void;
  onOnlineImageUpload: () => void;
  handleBeforeInput: (lastInsertedChar: string) => string;
  linkifyLastWord: (insertChar: string) => string;
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
      {label: 'Hyperlink', action: this._manageLink.bind(this), icon: 'fa fa-link', entityType: 'LINK'}
    ];

    this.EXTERNAL_CONTROLS = [
      {
        label: 'Attachments',
        onToggle: this.props.onAttachmentPanelOpen,
        icon: 'fa fa-paperclip',
        isActive: _ => this.props.files.length > 0,
        tooltip: 'Attach File'
      },
      {
        label: 'Image Upload',
        onToggle: _ => this.setState({imagePanelOpen: true}),
        icon: 'fa fa-camera',
        isActive: _ => false,
      }
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
            const size = parseInt(imgNode.style['max-height'].slice(0, -1), 10);
            const imageLink = node.href;
            const entityKey = Entity.create('IMAGE', 'MUTABLE', {src,
              size: `${size}%`,
              imageLink: imageLink || '#',
              align: 'left'
            });
            this.props.saveImageData(src);
            return entityKey;
          }
        }
      },
      htmlToBlock: (nodeName, node) => {
        if (nodeName === 'figure') {
          return;
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
      editorState: !isEmpty(this.props.bodyHtml) ?
        EditorState.createWithContent(convertFromHTML(this.CONVERT_CONFIGS)(this.props.bodyHtml), decorator) :
        EditorState.createEmpty(decorator),
      bodyHtml: this.props.bodyHtml || null,
      variableMenuOpen: false,
      variableMenuAnchorEl: null,
      isStyleBlockOpen: true,
      styleBlockAnchorEl: null,
      filePanelOpen: false,
      imagePanelOpen: false,
      imageLink: ''
    };

    this.focus = () => this.refs.editor.focus();
    this.onChange = this._onChange.bind(this);
    this.handleTouchTap = (event) => {
      event.preventDefault();
      this.setState({
        variableMenuOpen: true,
        variableMenuAnchorEl: event.currentTarget,
      });
    };
    function emitHTML(editorState) {
      let raw = convertToRaw(editorState.getCurrentContent());
      let html = draftRawToHtml(raw);
      // console.log(raw);
      // console.log(html);
      this.props.onBodyChange(html, raw);
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
    this.handleImage = this._handleImage.bind(this);
    this.onImageUploadClicked = this._onImageUploadClicked.bind(this);
    this.onOnlineImageUpload = this._onOnlineImageUpload.bind(this);
    this.handleBeforeInput = this._handleBeforeInput.bind(this);
    this.linkifyLastWord = this._linkifyLastWord.bind(this);
    this.getEditorState = () => this.state.editorState;
    this.handleDrop = this._handleDrop.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.templateChanged && nextProps.templateChanged) {
      console.log('change template');
      this.props.turnOffTemplateChange();
      let newContent;
      let editorState;
      if (nextProps.savedBodyHtml) {
        // console.log(nextProps.savedBodyHtml);
        const configuredContent = convertFromHTML(this.CONVERT_CONFIGS)(nextProps.savedBodyHtml);
        // need to process all image entities into ATOMIC blocks because draft-convert doesn't have access to contentState
        editorState = EditorState.push(this.state.editorState, configuredContent, 'insert-fragment');
        // FIRST PASS TO REPLACE IMG WITH ATOMIC BLOCKS
        editorState.getCurrentContent().getBlockMap().forEach((block, key) => {
          block.findEntityRanges(
            (character) => {
              const entityKey = character.getEntity();
              if (entityKey === null) return false;
              if (editorState.getCurrentContent().getEntity(entityKey).getType() === 'IMAGE') {
                // console.log(convertToRaw(editorState.getCurrentContent()));
                editorState = AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
                // console.log(convertToRaw(editorState.getCurrentContent()));
              }
              return (editorState.getCurrentContent().getEntity(entityKey).getType() === 'IMAGE');
            },
            (start, end) => {});
        });

        // SECOND PASS TO REMOVE ORPHANED NON-ATOMIC BLOCKS WITH IMG ENTITIES
        // rebuild contentState with valid blocks
        let truncatedBlocks = [];
        let okayBlock = true; // check if a block is atomic and has image
        let ignoreRest = false;
        editorState.getCurrentContent().getBlockMap().forEach((block, key) => {
          ignoreRest = false;
          block.findEntityRanges(
            (character) => {
              const entityKey = character.getEntity();
              if (ignoreRest || entityKey === null) {
                return false;
              }
              if (editorState.getCurrentContent().getEntity(entityKey).getType() === 'IMAGE') {
                if (block.getType() !== 'atomic') {
                  okayBlock = false;
                  ignoreRest = true;
                }
              }
            },
            (state, end) => {});
          if (okayBlock) truncatedBlocks.push(block);
        });
        const cleanedContentState = ContentState.createFromBlockArray(truncatedBlocks);
        editorState = EditorState.push(this.state.editorState, cleanedContentState, 'insert-fragment');

        this.setState({bodyHtml: nextProps.bodyHtml});

        this.props.clearCacheBodyHtml();
      } else {
        newContent = convertFromRaw(nextProps.savedEditorState);
        editorState = EditorState.push(this.state.editorState, newContent, 'insert-fragment');
      }
      this.onChange(editorState);
    }

  }

  componentWillUnmount() {
    this.props.clearAttachments();
  }

  _onChange(editorState, onChangeType) {
    let newEditorState = editorState;
    this.setState({editorState: newEditorState});

    let previousContent = this.state.editorState.getCurrentContent();

    // only emit html when content changes
    if (previousContent !== newEditorState.getCurrentContent() || onChangeType === 'force-emit-html') {
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

  _handleReturn(e) {
    if (e.key === 'Enter') {
      return this.linkifyLastWord('\n');
    }
    return 'not-handled';
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
      ),
    'force-emit-html'
    );
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

  _handleImage(url) {
    const {editorState} = this.state;
    // const url = 'http://i.dailymail.co.uk/i/pix/2016/05/18/15/3455092D00000578-3596928-image-a-20_1463582580468.jpg';
    const entityKey = editorState.getCurrentContent().createEntity('IMAGE', 'MUTABLE', {
      src: url,
      size: '100%',
      imageLink: '#',
      align: 'left'
    }).getLastCreatedEntityKey();

    const newEditorState = AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
    return newEditorState;
  }

  _handleDroppedFiles(selection, files) {
    files.map(file => {
      if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg') {
        if (file.size <= 5000000) {
          this.props.uploadImage(file)
          .then(url => {
            const newEditorState = this.handleImage(url);
            this.onChange(newEditorState, 'force-emit-html');
          });
        } else {
          alertify.warning(`Image size cannot exceed 5MB. The image dropped was ${(file.size / 1000000).toFixed(2)}MB`);
        }
      } else {
        alertify.warning(`Image type must be PNG or JPEG. The file dropped was ${file.type}.`);
      }
    });
  }

  _onImageUploadClicked(acceptedFiles, rejectedFiles) {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    this.handleDroppedFiles(selection, acceptedFiles);
  }

  _onOnlineImageUpload() {
    const props = this.props;
    const state = this.state;
    if (isURL(state.imageLink)) {
      props.saveImageData(state.imageLink);
      setTimeout(_ => {
        const newEditorState = this.handleImage(state.imageLink);
        this.onChange(newEditorState, 'force-emit-html');
        this.setState({imageLink: ''});
      }, 50);
    }
  }

  _handleDrop(e, dropSelection) {
    const blockKey = e.dataTransfer.getData('text');
    console.log(dropSelection);
    console.log(blockKey);
    console.log(e);
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
        <Dialog actions={[<FlatButton label='Close' onClick={_ => this.setState({imagePanelOpen: false})}/>]}
        autoScrollBodyContent title='Upload Image' open={state.imagePanelOpen} onRequestClose={_ => this.setState({imagePanelOpen: false})}>
          <div style={{margin: '10px 0'}} className='horizontal-center'>Drag n' Drop the image file into the editor</div>
          <div className='horizontal-center'>OR</div>
          <div className='vertical-center horizontal-center' style={{margin: '15px 0'}}>
            <div>
              <ValidationHOC rules={[{validator: isURL, errorMessage: 'Not a valid url.'}]}>
              {({onValueChange, errorMessage}) => (
                <TextField
                errorText={errorMessage}
                hintText='Image link here'
                floatingLabelText='Image link here'
                value={state.imageLink}
                onChange={e => {
                  // for validation
                  onValueChange(e.target.value);
                  // for updating value
                  this.setState({imageLink: e.target.value});
                }}
                />)}
              </ValidationHOC>
              <RaisedButton style={{margin: 5}} label='Submit' onClick={this.onOnlineImageUpload}/>
            </div>
          </div>
          <div className='horizontal-center'>OR</div>
          <div className='vertical-center horizontal-center' style={{margin: '10px 0'}}>
            <RaisedButton label='Upload from File' onClick={_ => this.imgDropzone.open()}/>
          </div>
        </Dialog>
        <Dropzone ref={(node) => (this.imgDropzone = node)} style={{display: 'none'}} onDrop={this.onImageUploadClicked}/>
        <Popover
        open={state.variableMenuOpen}
        anchorEl={state.variableMenuAnchorEl}
        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
        onRequestClose={_ => this.setState({variableMenuOpen: false})}
        >
          <Menu desktop>
          {props.fieldsmap
            .filter(field => !field.hidden)
            .map((field, i) =>
            <MenuItem key={i} primaryText={field.name} onClick={_ => {
              this.insertText(field.name);
              this.setState({variableMenuOpen: false});
            }} />)}
          </Menu>
        </Popover>
        <Subject
        width={props.width}
        onSubjectChange={props.onSubjectChange}
        subjectHtml={props.subjectHtml}
        fieldsmap={props.fieldsmap}
        />
        <div style={{
          height: 460,
          overflowY: 'scroll',
        }}>
          <div className={className} onClick={this.focus}>
            <Editor
            blockStyleFn={getBlockStyle}
            blockRendererFn={
              mediaBlockRenderer({
                getEditorState: this.getEditorState,
                onChange: this.onChange,
                onImageDragDrop: this.handleDrop
              })}
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
          <RaisedButton
          style={{margin: 10}}
          label='Insert Property'
          labelStyle={{textTransform: 'none'}}
          onClick={e => this.setState({variableMenuOpen: true, variableMenuAnchorEl: e.currentTarget})}
          />
        </div>
      {state.isStyleBlockOpen &&
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
          <IconButton
          iconStyle={{width: 14, height: 14, fontSize: '14px', color: grey800}}
          style={{width: 28, height: 28, padding: 6}}
          iconClassName='fa fa-plus pointer'
          onClick={e => this.setState({variableMenuOpen: true, variableMenuAnchorEl: e.currentTarget})}
          tooltip='Insert Property'
          tooltipPosition='top-right'
          />
        </Paper>}
        <div className='vertical-center' style={{
          position: 'absolute',
          bottom: 3,
          width: props.width,
        }}>
        <div style={{padding: 3, marginRight: 10}}>
          <FontIcon
          className={`fa fa-angle-double-${state.isStyleBlockOpen ? 'up' : 'down'} pointer`}
          style={{color: state.isStyleBlockOpen ? blue700 : grey700}}
          onClick={this.onCheck}
          />
        </div>
        {props.children}
      </div>
    </div>
    );
  }
}


const extendedBlockRenderMap = Draft.DefaultDraftBlockRenderMap.merge(blockRenderMap);

const mapStateToProps = (state, props) => {
  return {
    files: state.emailAttachmentReducer.attached,
    templateChanged: state.emailDraftReducer.templateChanged,
    savedEditorState: state.emailDraftReducer.editorState,
    savedBodyHtml: state.emailDraftReducer.bodyHtml
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    setAttachments: files => dispatch({type: 'SET_ATTACHMENTS', files}),
    clearAttachments: _ => dispatch({type: 'CLEAR_ATTACHMENTS'}),
    uploadImage: file => dispatch(imgActions.uploadImage(file)),
    saveImageData: src => dispatch({type: 'IMAGE_UPLOAD_RECEIVE', src}),
    onAttachmentPanelOpen: _ => dispatch({type: 'TURN_ON_ATTACHMENT_PANEL'}),
    turnOffTemplateChange: _ => dispatch({type: 'TEMPLATE_CHANGE_OFF'}),
    clearCacheBodyHtml: _ => dispatch({type: 'CLEAR_CACHE_BODYHTML'})
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BasicHtmlEditor);
