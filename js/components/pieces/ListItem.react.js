import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import Radium from 'radium';

function ListItem({list, key, _onArchiveToggle, iconName}) {
  const styles = {
    link: {
      margin: '10px'
    },
    icon: {
      color: 'lightgray',
      ':hover': {
        color: 'gray',
        cursor: 'pointer'
      }
    }
  };

  return (
    <div key={key}>
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
