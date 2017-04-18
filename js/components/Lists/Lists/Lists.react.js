import React from 'react';
import ListItem from './ListItem.react';
import ListsTitle from './ListsTitle.react';
import Waiting from '../../Waiting';

const loading = {
  zIndex: 160,
  top: 80,
  right: 10,
  position: 'fixed'
};

const styles = {
  listitemContainer: {marginBottom: 50, marginTop: 50}
};

function Lists({isReceiving, title, lists, statementIfEmpty, onToggle, listItemIcon, backRoute, backRouteTitle, tooltip}) {
  return (
    <div>
      <Waiting isReceiving={isReceiving} style={loading} />
       <ListsTitle
        title={title}
        route={backRoute}
        iconName='fa fa-angle-right fa-fw'
        backRouteTitle={backRouteTitle}
        />
      <div style={styles.listitemContainer}>
       {lists.length === 0 && <span>{statementIfEmpty}</span>}
        {
          lists.map( (list, i) =>
          <ListItem
          list={list}
          onToggle={onToggle}
          iconName={listItemIcon}
          key={i}
          tooltip={tooltip}
          />)
        }
      </div>
    </div>);
}

export default Lists;
