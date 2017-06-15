import React, {Component} from 'react';
import {
  Editor,
  EditorState,
  CompositeDecorator,
  ContentState,
  Modifier
} from 'draft-js';

import Link from './components/Link';
import CurlySpan from './components/CurlySpan.react';
import {curlyStrategy, findEntities} from './utils/strategies';
import {grey300, grey400, grey500} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

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
      subjectLength: 0,
      variableMenuOpen: false,
      variableMenuAnchorEl: null
    };
    this.truncateText = this._truncateText.bind(this);
    this.insertText = this._insertText.bind(this);
    this.handlePastedText = this._handlePastedText.bind(this);

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

  _insertText(replaceText) {
    const {editorState} = this.state;
    const content = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const newContent = Modifier.insertText(content, selection, '{' + replaceText + '}');
    const newEditorState = EditorState.push(editorState, newContent, 'insert-fragment');
    this.onChange(newEditorState);
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
      <div style={{borderBottom: `1px solid ${grey300}`}} className='vertical-center' >
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
            <MenuItem key={i} primaryText={field.name} onClick={_ => {
              this.insertText(field.name);
              this.setState({variableMenuOpen: false});
            }} />)}
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
          <span style={{fontSize: '0.9em', color: grey500}}>{subjectLength}</span>
        {props.fieldsmap &&
          <IconButton
          iconStyle={{width: 12, height: 12, fontSize: '12px', color: grey400}}
          style={{width: 24, height: 24, padding: 6, marginLeft: 4}}
          iconClassName='fa fa-plus'
          tooltip='Insert Property to Subject'
          tooltipPosition='bottom-center'
          onClick={e => this.setState({variableMenuOpen: true, variableMenuAnchorEl: e.currentTarget})}
          />}
        </div>
      </div>
    );
  }
}

export default Subject;
