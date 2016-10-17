import React from 'react';
import alertify from 'alertifyjs';
import isURL from 'validator/lib/isURL';
import isEmail from 'validator/lib/isEmail';
import 'node_modules/alertifyjs/build/css/alertify.min.css';

import {grey700, grey800, red600} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';

const styles = {
  smallIcon: {
    fontSize: 16,
    color: grey700
  },
  small: {
    width: 36,
    height: 36,
    padding: 2,
  },
  iconStyle: {
    marginRight: 15,
    color: grey800
  }
};

let contentStyle = {
  color: 'black',
  marginLeft: 10,
  marginRight: 10,
  fontSize: '0.9em'
};

function ContactDescriptor({
  showTitle,
  content,
  contentTitle,
  onClick,
  className,
  iconClassName,
  errorText,
  extraIcons,
}) {
  const icon = content && isURL(content) && !isEmail(content) ?
  <a href={content.substring(0, 4) === 'http' ? content : `https://${content}`} style={styles.iconStyle} target='_blank'>
    <i className={iconClassName} aria-hidden='hidden' />
  </a> : <i style={styles.iconStyle} className={iconClassName} aria-hidden='hidden' />;
  if (content) contentStyle = Object.assign({}, contentStyle, {color: grey700});

  return (
    <div className={`${className} vertical-center`} style={{height: 35}}>
      {iconClassName && icon}
      {showTitle && <span style={styles.iconStyle}>{contentTitle}</span>}
      {errorText !== null && <span style={{fontSize: '0.7em', color: red600}}>{errorText}</span>}
      <span style={contentStyle}>{content ? content : `---- ${contentTitle} empty ----`}</span>
      <IconButton
      iconStyle={styles.smallIcon}
      style={styles.small}
      iconClassName={content ? 'fa fa-edit' : 'fa fa-plus'}
      tooltip={`${content ? 'Edit' : 'Add'} ${contentTitle}`}
      tooltipPosition='top-right'
      onClick={_ => alertify.prompt(`Enter ${contentTitle}`, '', onClick, function() {})}
      />
      {extraIcons}
  </div>);
}

export default ContactDescriptor;
