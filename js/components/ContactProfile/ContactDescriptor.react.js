import React from 'react';
import {grey700} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import alertify from 'alertifyjs';
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
};

const ContactDescriptor = ({showTitle, content, contentTitle, onClick, className, iconClassName}) => {
  return (
    <div className={className} style={{display: 'flex', alignItems: 'center'}}>
      {iconClassName && <i style={{marginRight: 8}} className={iconClassName} aria-hidden='hidden' />}
      {showTitle && <span style={{marginRight: 10}}>{contentTitle}</span>}
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
