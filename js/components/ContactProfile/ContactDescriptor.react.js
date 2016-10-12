import React from 'react';
import {grey700, grey800} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import alertify from 'alertifyjs';
import isURL from 'validator/lib/isURL';
import isEmail from 'validator/lib/isEmail';
import 'node_modules/alertifyjs/build/css/alertify.min.css';

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

const ContactDescriptor = ({showTitle, content, contentTitle, onClick, className, iconClassName}) => {
  const icon = content && isURL(content) && !isEmail(content) ? <a
  href={content.substring(0, 4) === 'http' ? content : `https://${content}`}
  style={styles.iconStyle}
  target='_blank'>
  <i className={iconClassName} aria-hidden='hidden' />
  </a> : <i style={styles.iconStyle} className={iconClassName} aria-hidden='hidden' />;
  return (
    <div className={className} style={{display: 'flex', alignItems: 'center'}}>
      {iconClassName && icon}
      {showTitle && <span style={styles.iconStyle}>{contentTitle}</span>}
      <span style={{color: content ? 'black' : grey700}}>{content ? content : `---- ${contentTitle} empty ----`}</span>
      <IconButton
      style={{marginLeft: 3}}
      iconStyle={styles.smallIcon}
      style={styles.small}
      iconClassName={content ? 'fa fa-edit' : 'fa fa-plus'}
      tooltip={`${content ? 'Edit' : 'Add'} ${contentTitle}`}
      tooltipPosition='top-right'
      onClick={_ => alertify.prompt(`Enter ${contentTitle}`, '', onClick, function() {})}
      />
  </div>
  );
};

export default ContactDescriptor;
