import React, { PropTypes } from 'react';
import Link from 'react-router/lib/Link';
import { globalStyles } from 'constants/StyleConstants';
import Radium from 'radium';
import {listPropTypes} from 'constants/CommonPropTypes';
import {grey50} from 'material-ui/styles/colors';

const styles = {
  parent: {
    marginBottom: 10,
    borderRadius: '1.5em',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 5,
    paddingBottom: 5,
    ':hover': {
      backgroundColor: grey50
    }
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

function ListItem({list, onToggle, iconName}) {
  const updatedDate = new Date(list.updated);
  return (
    <div key='parent' className='row align-middle' style={[styles.parent]}>
      <div className='small-8 medium-7 large-8 columns'>
        <Link to={`/lists/${list.id}`}><span>{list.name}</span></Link>
      </div>
      <div className='small-4 medium-4 large-3 columns'>
        <span style={{fontSize: '0.8em', fontColor: 'gray'}}>{updatedDate.toDateString()}</span>
      </div>
      <div className='hide-for-small-only medium-1 large-1 columns'>
        <i
        alt='archive'
        title='archive'
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
