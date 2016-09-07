import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { globalStyles } from 'constants/StyleConstants';
import Radium from 'radium';
import {listPropTypes} from 'constants/CommonPropTypes';
import {grey50} from 'material-ui/styles/colors';

const styles = {
  parent: {
    marginBottom: '10px',
    borderRadius: '1.5em',
    paddingLeft: '15px',
    paddingRight: '15px',
    height: '2em',
    display: 'flex',
    alignItems: 'center',
    ':hover': {
      backgroundColor: grey50
    }
  },
  link: {
    // marginLeft: '15px'
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
    <div key='parent' className='row' style={[styles.parent]}>
      <div className='eight columns'>
        <span style={[styles.link]}>
          <Link to={`/lists/${list.id}`}>{list.name}</Link>
        </span>
      </div>
      <div className='three columns'>
        <span style={{fontSize: '0.8em', fontColor: 'gray'}}>{updatedDate.toDateString()}</span>
      </div>
      <div className='one columns'>
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
