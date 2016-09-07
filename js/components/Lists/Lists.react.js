import React, { PropTypes } from 'react';
import ListItem from './ListItem.react';
import ListsTitle from './ListsTitle.react';
import {listPropTypes} from 'constants/CommonPropTypes';

function sortListsByDate(lists) {
  return lists.sort((a, b) => {
    a = new Date(a.updated);
    b = new Date(b.updated);
    return a > b ? -1 : a < b ? 1 : 0;
  });
}

function Lists({isReceiving, title, lists, statementIfEmpty, onToggle, listItemIcon, backRoute, backRouteTitle}) {
  let renderNode;
  const sortedLists = sortListsByDate(lists);
  if (isReceiving) {
    renderNode = <span>loading...</span>;
  } else {
    renderNode = (
      <div>
       {
          sortedLists.length === 0 ? <span>{statementIfEmpty}</span> : null
        }
        {
          sortedLists.map( (list, i) =>
          <ListItem
          list={list}
          onToggle={onToggle}
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
