import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import Radium from 'radium';

function ListItem({list, key, _onArchiveToggle, iconName}) {
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

  return (
    <div key={key} style={[styles.parent]}>
      <Link key={key} to={`/lists/${list.id}`} style={[styles.link]}>
        <span>{list.name}</span>
      </Link>
      <i
      key={key}
      className={iconName}
      style={[styles.icon]}
      onClick={ _ => _onArchiveToggle(list.id) }
      aria-hidden='true'></i>
    </div>
    );
}

ListItem.PropTypes = {
};

ListItem = Radium(ListItem);

export default ListItem;
