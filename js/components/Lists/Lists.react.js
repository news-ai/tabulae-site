import React from 'react';
import ListItem from './ListItem.react';
import ListsTitle from './ListsTitle.react';

function Lists({ isReceiving, title, lists, statementIfEmpty, onArchiveToggle, listItemIcon, backRoute, backRouteTitle}) {
  let renderNode;
  if (isReceiving) {
    renderNode = <span>loading...</span>;
  } else {
    renderNode = (
      <div>
       {
          lists.length === 0 ? <span>{statementIfEmpty}</span> : null
        }
        {
          lists.map( (list, i) =>
          <ListItem
          list={list}
          onArchiveToggle={onArchiveToggle}
          iconName={listItemIcon}
          key={i}
          />)
        }
      </div>
      );
  }
  return (
    <div>
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
       {renderNode}
      </div>
    </div>);
}

export default Lists;
