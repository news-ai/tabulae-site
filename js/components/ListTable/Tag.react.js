import React, {PropTypes} from 'react';
import {blue50, grey800, grey500} from 'material-ui/styles/colors';
import FontIcon from 'material-ui/FontIcon';

const Tag = ({text, onDeleteTag}) => (
  <div className='vertical-center' style={{backgroundColor: blue50, margin: '0 5px', padding: '3px 8px'}}>
    <span style={{color: grey800, fontSize: '0.8em'}}>{text}</span>
    <FontIcon
    onClick={onDeleteTag}
    style={{fontSize: '0.8em', marginLeft: '8px'}}
    className='fa fa-times'
    color={grey500}
    hoverColor={grey800}/>
  </div>);

export default Tag;
