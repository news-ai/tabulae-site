import React, {PropTypes} from 'react';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import FontIcon from 'material-ui/FontIcon';

function CountViewItem({label, count, iconName, onTouchTap}) {
  return (
      <Chip onTouchTap={onTouchTap}>
        <Avatar size={25}>{count}</Avatar>
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
