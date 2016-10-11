import React, {PropTypes} from 'react';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';

function CountViewItem({label, count, iconName}) {
  return (
      <Chip>
        <Avatar size={30}>{count}</Avatar>
        {label} <i className={iconName} aria-hidden='true'/>
      </Chip>
    );
}

CountViewItem.PropTypes = {
  label: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  iconName: PropTypes.string.isRequired
};

export default CountViewItem;
