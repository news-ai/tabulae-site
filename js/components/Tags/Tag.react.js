import React, {PropTypes} from 'react';
import {blue50, blue200, grey800, grey500} from 'material-ui/styles/colors';
import withRouter from 'react-router/lib/withRouter';
import FontIcon from 'material-ui/FontIcon';

const Tag = ({text, onDeleteTag, hideDelete, router}) => (
  <div className='vertical-center' style={{
    backgroundColor: blue50,
    margin: '0 5px',
    padding: '1px 8px',
    borderRight: `1px solid ${blue200}`,
    borderBottom: `1px solid ${blue200}`,
  }}>
    <span onClick={_ => router.push(`?tag=${text}`)} style={{color: grey800, fontSize: '0.8em', cursor: 'pointer'}}>{text}</span>
    {!hideDelete &&
      <FontIcon
      onClick={onDeleteTag}
      style={{fontSize: '0.8em', marginLeft: '8px'}}
      className='fa fa-times'
      color={grey500}
      hoverColor={grey800}/>}
  </div>);

export default withRouter(Tag);
