import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { globalStyles } from 'constants/StyleConstants';
import Radium from 'radium';

const styles = {
  parent: {
    marginBottom: '10px'
  },
  link: {
    margin: '10px'
  },
  icon: {
    color: 'lightgray',
    float: 'left',
    ':hover': {
      color: 'gray',
      cursor: 'pointer'
    }
  }
};

function ListItem({list, key, _onArchiveToggle, iconName}) {
  return (
    <div className='row' style={[styles.parent]} key={key}>
      <div className='six columns'>
        <Link key={key} to={`/lists/${list.id}`} style={[styles.link]}>
          <span>{list.name}</span>
        </Link>
      </div>
      <div className='six columns'>
        <i
        key={key}
        className={iconName}
        style={[globalStyles.icon]}
        onClick={ _ => _onArchiveToggle(list.id) }
        aria-hidden='true'></i>
      </div>
    </div>
    );
}

ListItem.PropTypes = {
};

export default Radium(ListItem);
