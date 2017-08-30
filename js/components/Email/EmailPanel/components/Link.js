import React, {Component} from 'react';
import ReactTooltip from 'react-tooltip';
import styled from 'styled-components';
import alertify from 'utils/alertify';

const IconButton = styled.i.attrs({
  className: props => props.className
})`
  cursor: pointer;
  color: #fff;
  margin-left: 10px;
`;

export default class Link extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false
    };
    this.onSubmit = () => {
      const {contentState, entityKey} = this.props;
      const entityData = contentState.getEntity(entityKey).getData();
      alertify.prompt('', 'Edit URL to embeded link', entityData.url,
        (e, newValue) => entityData.updateEntityLink(contentState, entityKey, newValue),
        err => console.log(err)
        );
    };
    this.onEdit = _ => this.setState(
      {editing: true},
      _ => {
        setTimeout(_ => this.newEntityUrl.focus(), 10);
      });
  }

  render () {
    const props = this.props;
    const state = this.state;
    let href, isDecoratedText, entityData;
    if (props.entityKey !== null) {
      entityData = props.contentState.getEntity(props.entityKey).getData();
      href = entityData.url;
    } else {
      isDecoratedText = true;
      href = props.decoratedText;
    }
    console.log(state.editing);
    return (
      <span>
        <a href={href} data-tip data-for='tooltipTarget' target='_blank'>
          {props.children}
        </a>
        <ReactTooltip
        id='tooltipTarget'
        className='tooltipStay'
        place='top'
        type='dark'
        effect='solid'
        delayHide={1000}
        getContent={() => (
          <div>
            <span>{href}</span>
          {!isDecoratedText &&
            <IconButton
            className='fa fa-edit'
            onClick={this.onSubmit}
            />}
          </div>
          )}
        />
      </span>
    );
  }
}
