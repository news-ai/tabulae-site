import React from 'react';
import styled from 'styled-components';
import {grey500, grey700} from 'material-ui/styles/colors';

const PlainFontIcon = styled.i.attrs({
  className: props => props.className
})`
  color: ${grey500};
  font-size: 1.3em;
  margin: auto;
  &:hover {
    color: ${grey700};
  }
`;

const PlainIconButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  margin: 3px 5px;
`;

const PlainIconButtonLabel = styled.span`
  font-size: 0.7em;
  color: ${grey700};
`;

const PlainIconButton = ({label, onClick, disabled, className}) => (
  <PlainIconButtonContainer disabled={disabled} onClick={e => !disabled && onClick(e)}>
    <PlainFontIcon className={className} />
    <PlainIconButtonLabel>{label}</PlainIconButtonLabel>
  </PlainIconButtonContainer>
  );

export default PlainIconButton;
