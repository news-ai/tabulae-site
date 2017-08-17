import React, { Component } from 'react';
import {connect} from 'react-redux';
import {actions as templateActions} from 'components/Email/Template';
import GeneralEditor from 'components/Email/GeneralEditor';
import Select from 'react-select';
import RaisedButton from 'material-ui/RaisedButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import FontIcon from 'material-ui/FontIcon';
import Collapse from 'react-collapse';

import {blueGrey100, blue500} from 'material-ui/styles/colors';
import isJSON from 'validator/lib/isJSON';
import find from 'lodash/find';
import styled from 'styled-components';

const ItemContainer = styled.div`
  height: 40px;
  background-color: ${blueGrey100};
  margin-bottom: 5px;
`;

class Workspace extends Component {
  constructor(props) {
    super(props);
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
      useExisting: false
    }
    this.updateBody = (html, raw) => {
      // console.log(html);
      this.setState({body: html, bodyContentState: raw});
    };
    this.onSubjectChange = (editorState) => {
      const subject = editorState.getCurrentContent().getBlocksAsArray()[0].getText();
      this.setState({subject});
    };
    this.handleTemplateChange = this.handleTemplateChange.bind(this);
    this.onTouchTap = e => {
      e.preventDefault();
      this.setState({open: true, anchorEl: e.currentTarget});
    };
  }

  componentWillMount() {
    this.props.fetchTemplates();
  }

  handleTemplateChange(value) {
    const templateId = value || null;
    this.setState({currentTemplateId: value});

    if (!!templateId) {
      const template = find(this.props.templates, tmp => templateId === tmp.id);
      let subject = template.subject;
      this.setState({subject, useExisting: true});
      if (isJSON(template.body)) {
        const templateJSON = JSON.parse(template.body);
        console.log(templateJSON.data);
        this.setState({body: templateJSON.data});;
      } else {
        this.setState({body: template.body});
      }
    }
  }

  render() {
    const state = this.state;
    const props = this.props;

    const options = [
      <MenuItem key='placeholder-option' value={null} primaryText='Select Old Templates' />,
    ...props.templates
    .filter((template) => !(isJSON(template.body) && JSON.parse(template.body).date))
    .map((template, i) =>
      <MenuItem
      key={template.id}
      value={template.id}
      primaryText={template.name.length > 0 ? template.name : template.subject}
      onTouchTap={_ => this.handleTemplateChange(template.id)}
      />)
    ]
    return (
      <div style={{
        border: '1px solid blue',
        display: 'flex',
        justifyContent: 'space-around',
        marginTop: 10
      }} >
        <div style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          flexGrow: 1,
          padding: 10,
          border: '1px solid green',
          // justifyContent: 'space-between'
        }} >
          <div>
            <ItemContainer />
            <ItemContainer />
            <RaisedButton
            label='Load Existing'
            style={{marginBottom: 5, width: '100%'}}
            backgroundColor={blue500}
            labelStyle={{textTransform: 'none', color: '#ffffff'}}
            labelPosition='right'
            icon={<FontIcon color='#ffffff' className={state.open ? 'fa fa-minus-square-o' : 'fa fa-plus-square-o'} />}
            onTouchTap={e => this.setState({open: !state.open})}
            />
            <Collapse isOpened={state.open}>
              <Menu desktop autoWidth={false} maxHeight={200} style={{width: '100%'}} >
              {options}
              </Menu>
            </Collapse>
          </div>
          <div style={{marginTop: 'auto'}} >
            <RaisedButton
            primary
            style={{marginBottom: 5, width: '100%'}}
            disabled={!state.useExisting}
            label='Save'
            labelStyle={{textTransform: 'none'}}
            />
            <RaisedButton
            primary
            style={{marginBottom: 5, width: '100%'}}
            label='Save New...'
            labelStyle={{textTransform: 'none'}}
            />
          </div>
        </div>
        <div style={{
          display: 'flex',
          flexGrow: 2,
          justifyContent: 'center',
        }} >
          <div style={{
            border: '1px solid black',
            padding: 15
          }} >
            <GeneralEditor
            onEditMode
            allowReplacement
            width={600}
            height={530}
            debounce={500}
            bodyContent={state.body}
            rawBodyContentState={state.bodyContentState}
            subjectHtml={state.subject}
            controlsStyle={{zIndex: 0, marginBottom: 15}}
            controlsPosition='top'
            onBodyChange={this.updateBody}
            onSubjectChange={this.onSubjectChange}
            placeholder='Start building your template here'
            />
          </div>
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
  })
  )(Workspace);
