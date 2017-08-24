import React, { Component } from 'react';
import {connect} from 'react-redux';
import {actions as templateActions} from 'components/Email/Template';
import GeneralEditor from 'components/Email/GeneralEditor';
import Select from 'react-select';
import RaisedButton from 'material-ui/RaisedButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import Popover from 'material-ui/Popover';
import FontIcon from 'material-ui/FontIcon';
import Paper from 'material-ui/Paper';
import Collapse from 'react-collapse';
import alertify from 'utils/alertify';
import {blue50, blue100, blue200, blueGrey50, blueGrey100, blue500, blueGrey400, blueGrey600, blueGrey800} from 'material-ui/styles/colors';
import isJSON from 'validator/lib/isJSON';
import find from 'lodash/find';
import styled from 'styled-components';
import {convertToRaw} from 'draft-js';
import draftRawToHtml from 'components/Email/EmailPanel/utils/draftRawToHtml';

const ItemContainer = styled.div`
  height: 40px;
  background-color: ${blueGrey100};
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Menu = styled.ul`
  margin-left: 0px;
  padding-left: 0px;
  max-height: 200px;
  overflow: hidden;
  overflow-y: scroll;
  border-bottom: 1px solid lightgrey;
`;

const MenuItem = styled.li`
  list-style: none;
  width: 100%;
  padding: 7px;
  cursor: pointer;
  font-size: 0.9em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:hover {
    border: 3px solid ${blueGrey100};
    padding: 4px;
  }
`;

const RemoveButton = styled.i.attrs({
  className: props => props.className
})`
  color: ${blueGrey400};
  padding: 5px;
  margin-right: 10px;
  &:hover {
    color: ${blueGrey800};
    border: 1px solid ${blueGrey800};
    padding: 4px;
  }
`;

const MainSection = styled.div`
  display: flex;
  flex-grow: 2;
  justify-content: center;
  order: 1;
`;

const SideSection = styled.div`
  display: ${props => props.show ? 'flex' : 'none'};
  flex-grow: 1;
  flex-basis: 170px;
  max-width: 200px;
  order: -1;
  z-index: 100;
`;


const TabButton = styled.span`
  flex: 1;
  background-color: ${props => props.active && blue50};
  border: ${props => props.active && `2px solid ${blue200}`};
  text-align: center;
  font-size: 0.8em;
  cursor: pointer;
  &:hover {
    background-color: ${props => !props.active && blue50};
  }
`;

function createMarkUp(html) {
  return { __html: html };
}

const fontSizes = [5, 6, 7.5, 8, 9, 10, 10.5, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];
const generateFontSizeStyleMap = fonts => fonts.reduce((acc, font) => {
  acc[`SIZE-${font}`] = ({fontSize: `${font + 4}pt`});
  return acc;
}, {});
const customFontSizes = generateFontSizeStyleMap(fontSizes);

const DEFAULT_PADDING = 65 + 100 + 40; //top bar height + utility bar height + padding
const MIN_WIDTH = 600;
const MAX_WIDTH = 900;
const MIN_HEIGHT = 530;
class Workspace extends Component {
  constructor(props) {
    super(props);

    const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    let height = Math.floor(screenHeight - DEFAULT_PADDING);
    if (height < MIN_HEIGHT) height = MIN_HEIGHT; // set some minimal height
    // console.log(screenWidth)
    // console.log(screenHeight);
    this.state = {
      subject: '', // original
      mutatingSubject: '', // editted
      subjectContentState: '', // current contentstate
      body: '',
      mutatingBody: '',
      bodyContentState: '',
      currentTemplateId: null,
      open: false,
      anchorEl: null,
      useExisting: false,
      showToolbar: true,
      width: 600,
      height: height,
      mode: 'writing'
    };
    this.onSubjectChange = this.onSubjectChange.bind(this);
    this.onBodyChange = this.onBodyChange.bind(this);
    this.handleTemplateChange = this.handleTemplateChange.bind(this);
    this.onClearEditor = this.onClearEditor.bind(this);
    this.onSaveNewTemplateClick = this.onSaveNewTemplateClick.bind(this);
    this.onSaveCurrentTemplateClick = this.onSaveCurrentTemplateClick.bind(this);
    this.onDeleteTemplateClick = this.onDeleteTemplateClick.bind(this);

    // window.onresize = _ => {
    //   const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    //   const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    //   this.setState({screenWidth, screenHeight});
    // };
  }

  componentWillMount() {
    this.props.fetchTemplates();
  }

  componentWillUnmount() {
    // window.onresize = undefined;
  }

  onBodyChange(html, raw) {
    this.setState({mutatingBody: html, bodyContentState: raw});
  }

  onClearEditor() {
    this.setState({
      subject: 'clear', // original
      mutatingSubject: '', // editted
      subjectContentState: '', // current contentstate
      body: 'clear',
      mutatingBody: '',
      bodyContentState: '',
      useExisting: false,
      currentTemplateId: null
    },
    _ => {
      // Hack!! add something to editor then clearing it to triggle in componentWillReceiveProps
      this.setState({subject: '', body: ''});
    });
  }

  handleTemplateChange(value) {
    const templateId = value || null;
    this.setState({currentTemplateId: value});

    if (!!templateId) {
      const template = find(this.props.templates, tmp => templateId === tmp.id);
      let subject = template.subject;
      this.setState({subject, mutatingSubject: subject, useExisting: true});
      if (isJSON(template.body)) {
        const templateJSON = JSON.parse(template.body);
        if (templateJSON.subjectData) subject = templateJSON.subjectData;
        this.setState({body: templateJSON.data, subject});;
      } else {
        this.setState({body: template.body});
      }
    }
  }

  onSubjectChange(contentState) {
    const subjectContent = contentState;
    const subjectBlock = contentState.getBlocksAsArray()[0];
    const subject = subjectBlock.getText();
    let mutatingSubject = '';
    let lastOffset = 0;
    subjectBlock.findEntityRanges(
      (character) => {
        const entityKey = character.getEntity();
        if (entityKey === null) return false;
        return (contentState.getEntity(entityKey).getType() === 'PROPERTY');
      },
      (start, end) => {
        const {property} = subjectContent.getEntity(subjectBlock.getEntityAt(start)).getData();
        mutatingSubject += (subject.slice(lastOffset, start) + `<%= ${property} %>`);
        lastOffset = end;
      });
    mutatingSubject += subject.slice(lastOffset, subject.length);
    const subjectContentState = convertToRaw(subjectContent);

    this.setState({mutatingSubject, subjectContentState});
  }
  
  onSaveNewTemplateClick() {
    alertify.promisifyPrompt(
      '',
      'Name the New Email Template',
      ''
      )
    .then(
      name => {
        this.props.createTemplate(
          name,
          this.state.mutatingSubject,
          JSON.stringify({type: 'DraftEditorState', data: this.state.bodyContentState, subjectData: this.state.subjectContentState})
          )
        .then(currentTemplateId => this.setState({currentTemplateId}));
      },
      _ => console.log('template saving cancelled')
      );
  }

  onSaveCurrentTemplateClick() {
    this.props.saveCurrentTemplate(
      this.state.currentTemplateId,
      this.state.mutatingSubject,
      JSON.stringify({type: 'DraftEditorState' , data: this.state.bodyContentState, subjectData: this.state.subjectContentState})
      );
  }

  onDeleteTemplateClick(templateId) {
    this.props.toggleArchiveTemplate(templateId);
  }

  render() {
    const state = this.state;
    const props = this.props;

    const options = props.templates
    .filter((template) => !(isJSON(template.body) && JSON.parse(template.body).date))
    .map((template, i) =>
      <MenuItem key={template.id}>
        <span
        onClick={_ => {
          this.handleTemplateChange(template.id);
          this.setState({open: false});
        }}
        >{template.name.length > 0 ? template.name : template.subject}</span>
        <RemoveButton onClick={_ => this.onDeleteTemplateClick(template.id)} className='fa fa-trash' />
      </MenuItem>
      );
    const currentTemplate = find(this.props.templates, tmp => state.currentTemplateId === tmp.id);
    return (
      <div>
        <div style={{
          // border: '1px solid blue',
          display: 'flex',
          // justifyContent: 'space-around',
          paddingTop: 15
        }}>
          <div style={{padding: '5px 5px 5px 12px', zIndex: 200, order: -1, position: 'fixed'}}>
            <i
            onClick={_ => this.setState({showToolbar: !state.showToolbar})}
            className={`pointer fa fa-angle-double-${state.showToolbar ? 'left' : 'right'}`}
            />
            <span
            onClick={_ => this.setState({showToolbar: !state.showToolbar})}
            className='smalltext pointer'
            style={{marginLeft: 5, userSelect: 'none', color: blueGrey800}}
            >{state.showToolbar ? 'Hide Tools' : 'Show Tools'}</span>
          </div>
          <SideSection show={state.showToolbar} >
          {state.showToolbar &&
            <Paper zDepth={2} style={{
              // textAlign: 'center',
              height: 600,
              position: 'fixed',
              display: 'flex',
              flexDirection: 'column',
              order: 1
            }} >
              <div style={{marginTop: 40}} >
                <div style={{display: 'flex', marginBottom: 10}} >
                  <TabButton active={state.mode === 'writing'} onClick={_ => this.setState({mode: 'writing'})}>Writing Mode</TabButton>
                  <TabButton active={state.mode === 'preview'} onClick={_ => this.setState({mode: 'preview'})}>Preview</TabButton>
                </div>
                <RaisedButton
                label='Load Existing'
                style={{marginBottom: 5, width: '100%'}}
                backgroundColor={blue500}
                labelColor='#ffffff'
                labelStyle={{textTransform: 'none'}}
                icon={<FontIcon color='#ffffff' className={state.open ? 'fa fa-angle-double-down' : 'fa fa-angle-double-up'} />}
                onTouchTap={e => this.setState({open: !state.open})}
                />
                <Collapse isOpened={state.open}>
                  <Menu>
                  {options}
                  </Menu>
                </Collapse>
              </div>
              <div style={{marginTop: 'auto'}} >
                <ItemContainer>
                {!!state.currentTemplateId &&
                  <span className='text'>{currentTemplate.name || currentTemplate.subject}</span>}
                </ItemContainer>
                <RaisedButton
                backgroundColor={blue500}
                style={{marginBottom: 5, width: '100%'}}
                disabled={!state.useExisting}
                label='Save'
                labelStyle={{textTransform: 'none'}}
                onTouchTap={this.onSaveCurrentTemplateClick}
                />
                <RaisedButton
                backgroundColor={blue500}
                style={{marginBottom: 5, width: '100%'}}
                label='Save New...'
                labelColor='#ffffff'
                labelStyle={{textTransform: 'none'}}
                onTouchTap={this.onSaveNewTemplateClick}
                />
                <RaisedButton
                secondary
                style={{marginBottom: 5, width: '100%'}}
                label='Clear Editor'
                labelColor='#ffffff'
                labelStyle={{textTransform: 'none'}}
                onTouchTap={this.onClearEditor}
                />
              </div>
            </Paper>}
          </SideSection>
          <MainSection>
          {state.mode === 'writing' &&
           <GeneralEditor
            onEditMode
            allowReplacement
            allowGeneralizedProperties
            allowToolbarDisappearOnBlur
            containerClassName='RichEditor-editor-workspace'
            width={600}
            height='unlimited'
            debounce={500}
            bodyContent={state.body}
            rawBodyContentState={state.bodyContentState}
            subjectHtml={state.subject}
            rawSubjectContentState={state.subjectContentState}
            subjectParams={{allowGeneralizedProperties: true, style: {marginTop: 80, marginBottom: 15}}}
            controlsStyle={{zIndex: 100, marginBottom: 15, position: 'fixed', backgroundColor: '#ffffff'}}
            controlsPosition='top'
            onBodyChange={this.onBodyChange}
            onSubjectChange={this.onSubjectChange}
            placeholder='Start building your template here...'
            extendStyleMap={customFontSizes}
            />}
          {state.mode === 'preview' &&
            <div style={{marginTop: 80}} >
              <div
              style={{width: state.width, borderBottom: '2px solid gray', paddingBottom: 10, marginBottom: 10}}
              dangerouslySetInnerHTML={createMarkUp(state.mutatingSubject)}
              />
              <div
              style={{width: state.width}}
              dangerouslySetInnerHTML={createMarkUp(state.mutatingBody)}
              />
            </div>}
          </MainSection>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    templates: state.templateReducer.received.map(id => state.templateReducer[id]).filter(template => !template.archived)
  }),
  dispatch => ({
    fetchTemplates: _ => dispatch(templateActions.getTemplates()),
    saveCurrentTemplate: (id, subject, body) => dispatch(templateActions.patchTemplate(id, subject, body)),
    createTemplate: (name, subject, body) => dispatch(templateActions.createTemplate(name, subject, body)),
    toggleArchiveTemplate: templateId => dispatch(templateActions.toggleArchiveTemplate(templateId)),
  })
  )(Workspace);
