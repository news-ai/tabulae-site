import React, { Component } from 'react';
import {connect} from 'react-redux';
import {actions as templateActions} from 'components/Email/Template';
import GeneralEditor from 'components/Email/GeneralEditor';
import Select from 'react-select';
import RaisedButton from 'material-ui/RaisedButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

import {blueGrey100} from 'material-ui/styles/colors';
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
      subject: '',
      rawBodyContentState: '',
      currentTemplateId: null,
      bodyContent: ''
    }
    this.updateBody = (html, raw) => {
      // console.log(html);
      this.setState({body: html, rawBodyContentState: raw});
    };
    this.onSubjectChange = (editorState) => {
      const subject = editorState.getCurrentContent().getBlocksAsArray()[0].getText();
      this.setState({subject});
    };
    this.handleTemplateChange = this.handleTemplateChange.bind(this);
  }

  componentWillMount() {
    this.props.fetchTemplates();
  }

  handleTemplateChange(e, i, value) {
    const templateId = value || null;
    this.setState({currentTemplateId: value});

    if (!!templateId) {
      const template = find(this.props.templates, tmp => templateId === tmp.id);
      const subject = template.subject;
      this.setState({subject});
      if (isJSON(template.body)) {
        const templateJSON = JSON.parse(template.body);
        console.log(templateJSON.data);
        this.setState({bodyContent: templateJSON.data});;
      } else {
        this.setState({bodyContent: template.body});
      }
    }
  }

  render() {
    const state = this.state;
    const props = this.props;

    // let options = [];
    // if (props.templates.length > 0) {
    //   const {recent, saved} = props.templates
    //   .reduce(({recent, saved}, template) => {
    //     if (isJSON(template.body) && JSON.parse(template.body).date) {
    //       recent = [...recent, {
    //         label: template.name.length > 0 ? template.name : template.subject,
    //         value: template.id,
    //         type: 'name'
    //       }];
    //     } else {
    //       saved = [...saved, {
    //         label: template.name.length > 0 ? template.name : template.subject,
    //         value: template.id,
    //         type: 'name'
    //       }];
    //     }
    //     return {recent, saved};
    //   }, {recent: [], saved: []});
    //   options = [
    //     // {label: 'Recently Sent Emails', type: 'header', disabled: true},
    //     // ...recent,
    //     // {label: 'Saved Templates', type: 'header', disabled: true},
    //     ...saved
    //   ]
    // }
    const options = [
      <MenuItem key='placeholder-option' value={null} primaryText='Select Old Templates' />,
    ...props.templates
    .filter((template) => !(isJSON(template.body) && JSON.parse(template.body).date))
    .map((template, i) =>
      <MenuItem key={template.id} value={template.id} primaryText={template.name.length > 0 ? template.name : template.subject} />)
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
        }} >
          <ItemContainer />
          <ItemContainer />
          <ItemContainer />
          <DropDownMenu value={state.currentTemplateId} onChange={this.handleTemplateChange} >
          {options}
          </DropDownMenu>
          <RaisedButton primary label='Save' labelStyle={{textTransform: 'none'}} />
          <RaisedButton primary label='Save New...' labelStyle={{textTransform: 'none'}} />
        </div>
        <div style={{
          display: 'flex',
          flexGrow: 2,
          justifyContent: 'center',
          padding: 15,
        }} >
          <div style={{border: '1px solid black'}} >
            <GeneralEditor
            onEditMode
            allowReplacement
            width={600}
            height={530}
            debounce={500}
            bodyContent={state.bodyContent}
            rawBodyContentState={state.rawBodyContentState}
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
