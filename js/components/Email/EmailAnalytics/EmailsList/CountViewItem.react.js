import React, {PropTypes} from 'react';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import FontIcon from 'material-ui/FontIcon';
import {blue200, blue50} from 'material-ui/styles/colors';

function CountViewItem({label, count, iconName, onTouchTap, style}) {
  return (
      <Chip style={style} backgroundColor={blue50} onTouchTap={onTouchTap}>
        <Avatar
        size={25}
        backgroundColor={blue200}
        color='white'
        >{count}</Avatar>
        {label} <FontIcon style={{fontSize: 16}} className={iconName}/>
      </Chip>
    );
}

CountViewItem.PropTypes = {
  label: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  iconName: PropTypes.string.isRequired
};

export default CountViewItem;