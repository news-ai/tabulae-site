import React, {Component} from 'react';
import {connect} from 'react-redux';
import {actions as templateActions} from 'components/Email/Template';
import Link from 'react-router/lib/Link';
import styled from 'styled-components';
import {grey50} from 'material-ui/styles/colors';

const ListItem = styled.div.attrs({
  className: props => props.className
})`
  margin-bottom: 10px;
  border-radius: 1.5em;
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 5px;
  padding-bottom: 5px;
  &:hover {
    background: ${grey50};
  }
`;

const TemplateManager = props => {
  const {templates} = props;
  return (
    <div>
      <div className='row' style={{marginTop: 20}} >
        <div className='columns'>
          <span style={{fontSize: '2em'}} >Template Manager</span>
        </div>
      </div>
      <div style={{marginBottom: 50, marginTop: 50}}>
      {templates.map((template, i) => (
        <ListItem className='row'>
          <div className='large-12 medium-12 small-12 columns'>
            <Link to={`/workspace/${template.id}`} style={{textTransform: 'none'}} >
            {template.name.length > 0 ? template.name : template.subject}
            </Link>
          </div>
        </ListItem>
        ))}
      </div>
    </div>
    );
};

class TemplateManagerContainer extends Component {
  componentWillMount() {
    this.props.fetchTemplates();
  }

  render() {
    return <TemplateManager {...this.props} />;
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
  )(TemplateManagerContainer);
