import React, {PropTypes} from 'react';
import Link from 'react-router/lib/Link';
import Radium from 'radium';

function ListManagerTitle({title, backRouteTitle, route, iconName}) {
  return (
    <div style={{marginTop: '20px'}}>
      <span style={{fontSize: '2em', marginRight: '10px'}}>{title}</span>
      <Link to={route}>
        <span>{backRouteTitle}</span>
        <i className={iconName} aria-hidden='true'></i>
      </Link>
    </div>);
}

ListManagerTitle.PropTypes = {
};

export default Radium(ListManagerTitle);
