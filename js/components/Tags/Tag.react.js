import React from 'react';
import {grey800, grey500} from 'material-ui/styles/colors';
import Link from 'react-router/lib/Link';
import FontIcon from 'material-ui/FontIcon';

const styles = {
  container: {
    margin: '0 5px',
    padding: '1px 8px',
    height: 20,
  },
  text: {
    color: grey800, cursor: 'pointer'
  },
  icon: {fontSize: '0.8em', marginLeft: 8},
};

const Tag = ({text, onDeleteTag, hideDelete, color, borderColor, link}) => {
  const span = <span className='smalltext' style={styles.text}>{text}</span>;

  return (
    <div className='vertical-center' style={Object.assign({}, styles.container, {
      backgroundColor: color,
      borderRight: `1px solid ${borderColor}`,
      borderBottom: `1px solid ${borderColor}`,
    })}>
      {link ? <Link to={link}>{span}</Link> : span}
      {!hideDelete &&
        <FontIcon
        onClick={onDeleteTag}
        style={styles.icon}
        className='fa fa-times'
        color={grey500}
        hoverColor={grey800}
        />}
    </div>);
};

export default Tag;
