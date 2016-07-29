import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { globalStyles } from '../../constants/StyleConstants';
import Radium from 'radium';

const styles = {
  parent: {
    margin: '10px',
  },
  link: {
    margin: '10px'
  },
  icon: {
    color: 'lightgray',
    float: 'right',
    ':hover': {
      color: 'gray',
      cursor: 'pointer'
    }
  }
};

function ListItem({list, key, _onArchiveToggle, iconName}) {
  return (
    <div key={key} style={[styles.parent]}>
      <Link key={key} to={`/lists/${list.id}`} style={[styles.link]}>
        <span>{list.name}</span>
      </Link>
      <i
      key={key}
      className={iconName}
      style={[globalStyles.icon]}
      onClick={ _ => _onArchiveToggle(list.id) }
      aria-hidden='true'></i>
    </div>
    );
}

ListItem.PropTypes = {
};

export default Radium(ListItem);
