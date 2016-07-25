import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import Radium from 'radium';

function ListItem({list, key, styles, _onArchive}) {
  return (
    <div key={key}>
      <Link key={key} to={`/lists/${list.id}`} style={[styles.link]}>
        <span>{list.name}</span>
      </Link>
      <i key={key} className='fa fa-archive' style={[styles.icon]} onClick={ _ => _onArchive(listId) } aria-hidden='true'></i>
    </div>
    );
}

ListItem.PropTypes = {
};

ListItem = Radium(ListItem);

export default ListItem;
