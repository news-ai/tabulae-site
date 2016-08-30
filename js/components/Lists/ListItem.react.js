import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { globalStyles } from 'constants/StyleConstants';
import Radium from 'radium';
import {listPropTypes} from 'constants/CommonPropTypes';

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

function ListItem({list, key, onToggle, iconName}) {
  return (
    <div className='row' style={[styles.parent]} key={key}>
      <div className='six columns'>
        <Link key={key} to={`/lists/${list.id}`} style={[styles.link]}>
          <span>{list.name}</span>
        </Link>
      </div>
      <div className='six columns'>
        <i
        alt='archive'
        key={key}
        className={iconName}
        style={[globalStyles.icon]}
        onClick={ _ => onToggle(list.id) }
        aria-hidden='true'></i>
      </div>
    </div>
    );
}


ListItem.PropTypes = {
  list: listPropTypes.isRequired,
  key: PropTypes.number,
  onToggle: PropTypes.func.isRequired,
  iconName: PropTypes.string.isRequired
};

export default Radium(ListItem);
