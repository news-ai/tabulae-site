import React, { PropTypes } from 'react';
import Link from 'react-router/lib/Link';
import withRouter from 'react-router/lib/withRouter';
import Radium from 'radium';
import {listPropTypes} from 'constants/CommonPropTypes';
import {grey50, grey700} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';

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
  pointer: {
    ':hover': {
      cursor: 'pointer'
    }
  },
  smallIcon: {
    fontSize: 16,
    color: grey700
  },
  small: {
    width: 36,
    height: 36,
    padding: 2,
  },
};

function ListItem({list, onToggle, iconName, tooltip, router}) {
  const updatedDate = new Date(list.updated);
  return (
    <div key='parent' className='row align-middle' style={[styles.parent]}>
      <div className='small-8 medium-7 large-8 columns' style={[styles.pointer]} onClick={_ => router.push(`/lists/${list.id}`)}>
        <Link to={`/lists/${list.id}`}><span>{list.name}</span></Link>
      </div>
      <div className='small-4 medium-4 large-3 columns' onClick={_ => router.push(`/lists/${list.id}`)}>
        <span style={{fontSize: '0.8em', fontColor: 'gray'}}>{updatedDate.toDateString()}</span>
      </div>
      <div className='hide-for-small-only medium-1 large-1 columns'>
        <IconButton
        tooltip={tooltip}
        iconStyle={styles.smallIcon}
        style={styles.small}
        iconClassName={iconName}
        onClick={_ => onToggle(list.id)}
        tooltipPosition='top-left'
        />
      </div>
    </div>
    );
}


ListItem.PropTypes = {
  list: listPropTypes.isRequired,
  key: PropTypes.number,
  onToggle: PropTypes.func.isRequired,
  iconName: PropTypes.string.isRequired,
  tooltip: PropTypes.string
};

export default withRouter(Radium(ListItem));
