import React from 'react';
import {grey800, grey500} from 'material-ui/styles/colors';
import Link from 'react-router/lib/Link';
import FontIcon from 'material-ui/FontIcon';

const Tag = ({text, onDeleteTag, hideDelete, color, borderColor, link}) => (
  <div className='vertical-center' style={{
    backgroundColor: color,
    margin: '0 5px',
    padding: '1px 8px',
    borderRight: `1px solid ${borderColor}`,
    borderBottom: `1px solid ${borderColor}`,
    height: 20
  }}>
    <Link to={link}><span style={{color: grey800, fontSize: '0.8em', cursor: 'pointer'}}>{text}</span></Link>
    {!hideDelete &&
      <FontIcon
      onClick={onDeleteTag}
      style={{fontSize: '0.8em', marginLeft: 8}}
      className='fa fa-times'
      color={grey500}
      hoverColor={grey800}/>}
  </div>);

export default Tag;
