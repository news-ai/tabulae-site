import React, { PropTypes } from 'react';
import ListItem from './ListItem.react';
import ListsTitle from './ListsTitle.react';
import Waiting from '../Waiting';
import {listPropTypes} from 'constants/CommonPropTypes';

const loading = {
  zIndex: 160,
  top: 80,
  right: 10,
  position: 'fixed'
};

function Lists({isReceiving, title, lists, statementIfEmpty, onToggle, listItemIcon, backRoute, backRouteTitle}) {
  return (
    <div>
      <Waiting isReceiving={isReceiving} style={loading} />
       <ListsTitle
        title={title}
        route={backRoute}
        iconName='fa fa-angle-right fa-fw'
        backRouteTitle={backRouteTitle}
        />
      <div style={{
        marginBottom: '50px',
        marginTop: '50px'
      }}>
      <div>
       {lists.length === 0 ? <span>{statementIfEmpty}</span> : null}
        {
          lists.map( (list, i) =>
          <ListItem
          list={list}
          onToggle={onToggle}
          iconName={listItemIcon}
          key={i}
          />)
        }
      </div>
      </div>
    </div>);
}

Lists.PropTypes = {
  isReceiving: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  lists: listPropTypes.isRequired,
  statementIfEmpty: PropTypes.string.isRequired,
  onToggle: PropTypes.func.isRequired,
  listItemIcon: PropTypes.string.isRequired,
  backRoute: PropTypes.string.isRequired,
  backRouteTitle: PropTypes.string.isRequired
};

export default Lists;
