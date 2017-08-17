import React, {Component} from 'react';
import {
  Editor,
  EditorState,
  CompositeDecorator,
  ContentState,
  Modifier,
  convertFromRaw
} from 'draft-js';

import Link from './components/Link';
import CurlySpan from './components/CurlySpan.jsx';
import Property from './components/Property';
import {curlyStrategy, findEntities} from './utils/strategies';
import {grey300, grey400, grey500} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import alertify from 'alertifyjs';
import isJSON from 'validator/lib/isJSON';
import debounce from 'lodash/debounce';

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
        strategy: findEntities.bind(null, 'PROPERTY'),
        component: Property
      },
      {
        strategy: curlyStrategy,
        component: CurlySpan
      }
    ]);

    this.state = {
      editorState: EditorState.createEmpty(decorator),
      subjectString: null,
      subjectLength: 0,
      variableMenuOpen: false,
      variableMenuAnchorEl: null
    };
    this.truncateText = this._truncateText.bind(this);
    this.handlePastedText = this._handlePastedText.bind(this);
    this.onInsertProperty = this.onInsertProperty.bind(this);
    this.onPropertyIconClick = e => this.setState({variableMenuOpen: true, variableMenuAnchorEl: e.currentTarget});

    function emitContent(editorState) {
      this.props.onSubjectChange(editorState.getCurrentContent());
    }
    this.emitContent = debounce(emitContent, 500);

    this.onChange = (editorState) => {
      const previousContent = this.state.editorState.getCurrentContent();
      // only emit html when content changes
      if (previousContent !== editorState.getCurrentContent()) {
        const subject = editorState.getCurrentContent().getBlocksAsArray()[0].getText();
        const subjectLength = subject.length;
        let newEditorState = editorState;
        if (subject.length > MAX_LENGTH) newEditorState = this.truncateText(editorState, MAX_LENGTH);
        this.setState({editorState: newEditorState, subjectLength});
        this.emitContent(newEditorState);
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    let content, editorState;
    if (!!nextProps.subjectHtml) {
      if (nextProps.subjectHtml.entityMap && nextProps.subjectHtml.blocks) {
        const subjectString = JSON.stringify(nextProps.subjectHtml);
        if (subjectString !== this.state.subjectString) {
          content = convertFromRaw(nextProps.subjectHtml);
          this.setState({subjectString});
          editorState = EditorState.push(this.state.editorState, content, 'insert-fragment');
          this.onChange(editorState);
        }
      } else {
        if (nextProps.subjectHtml !== this.state.subjectString) {
          content = ContentState.createFromText(nextProps.subjectHtml);
          this.setState({subjectString: nextProps.subjectHtml});
          editorState = EditorState.push(this.state.editorState, content, 'insert-fragment');
          this.onChange(editorState);
        }
      }
    }
  }

  onInsertProperty(propertyType) {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      alertify.alert('Editor Warning', 'The editor cursor must be focused and not highlighted to insert property.');
      return;
    }
    const contentStateWithEntity = editorState.getCurrentContent().createEntity('PROPERTY', 'IMMUTABLE', {property: propertyType});
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

    const newEditorState = EditorState.push(
      editorState,
      Modifier.insertText(contentStateWithEntity, selection, propertyType, undefined, entityKey),
      'insert-fragment'
      );
    this.onChange(newEditorState);
    this.setState({variableMenuOpen: false});
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

  _handlePastedText(text, html) {
    const newText = text.replace(/(\r\n|\n|\r)/gm, '').substring(0, 255);
    const editorState = this.state.editorState;
    const contentState = Modifier.insertText(editorState.getCurrentContent(), editorState.getSelection(), newText);
    this.onChange(EditorState.push(this.state.editorState, contentState, 'insert-fragment'));
    return 'handled';
  }

  render() {
    const {editorState, subjectLength} = this.state;
    const state = this.state;
    const props = this.props;
    return (
      <div style={styles.container} className='vertical-center' >
        <div
        className='subject-draft-container'
        style={{
          width: this.props.width,
          height: 32,
          overflowX: 'scroll',
        }}>
      {props.fieldsmap &&
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
            <MenuItem key={i} primaryText={field.name} onClick={_ => this.onInsertProperty(field.name)} />)}
          </Menu>
        </Popover>}
          <Editor
          editorState={editorState}
          onChange={this.onChange}
          handleReturn={e => 'handled'}
          placeholder='Subject...'
          handlePastedText={this.handlePastedText}
          />
        </div>
        <div className='vertical-center'>
          <span className='text' style={styles.lengthLabel}>{subjectLength}</span>
        {props.fieldsmap &&
          <IconButton
          iconStyle={styles.icon.iconStyle}
          style={styles.icon.style}
          iconClassName='fa fa-plus'
          tooltip='Insert Property to Subject'
          tooltipPosition='bottom-center'
          onClick={this.onPropertyIconClick}
          />}
        </div>
      </div>
    );
  }
}

const styles = {
  container: {borderBottom: `1px solid ${grey300}`},
  lengthLabel: {color: grey500},
  icon: {
    iconStyle: {width: 12, height: 12, fontSize: '12px', color: grey400},
    style: {width: 24, height: 24, padding: 6, marginLeft: 4}
  }
}

export default Subject;
