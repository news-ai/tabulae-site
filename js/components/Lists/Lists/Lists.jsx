import React, { Component } from 'react';
import ListItem from './ListItem.jsx';
import ListsTitle from './ListsTitle.jsx';
import Waiting from '../../Waiting';
import FontIcon from 'material-ui/FontIcon';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';


const loading = {
  zIndex: 160,
  top: 80,
  right: 10,
  position: 'fixed'
};

const styles = {
  listitemContainer: {marginBottom: 50, marginTop: 50}
};

const origin = {horizontal: 'left', vertical: 'top'};


class Lists extends Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    const {isReceiving, title, lists, statementIfEmpty, onToggle, listItemIcon, backRoute, backRouteTitle, tooltip, extraIconButtons} = this.props;
    return (
      <div>
        <Waiting isReceiving={isReceiving} style={loading} />
        <ListsTitle title={title} route={backRoute} iconName='fa fa-angle-right fa-fw' backRouteTitle={backRouteTitle} />
        <div style={styles.listitemContainer}>
         {lists.length === 0 &&
          <span>{statementIfEmpty}</span>}
        {/*
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', margin: '0 5px'}} >
            <IconMenu
            iconButtonElement={<IconButton iconClassName='fa fa-sort-amount-asc' />}
            anchorOrigin={origin}
            targetOrigin={origin}
            >
              <MenuItem primaryText='Alphabetical +' leftIcon={<FontIcon className='fa fa-sort-alpha-asc' />}  />
              <MenuItem primaryText='Alphabetical -' leftIcon={<FontIcon className='fa fa-sort-alpha-desc' />} />
              <MenuItem primaryText='Most Recently Used' leftIcon={<FontIcon className='fa fa-sort-amount-asc' />}  />
              <MenuItem primaryText='Least Recently Used' leftIcon={<FontIcon className='fa fa-sort-amount-desc' />} />
            </IconMenu>
          </div>
        */}
          {
            lists.map( (list, i) =>
            <ListItem
            key={i}
            list={list}
            onToggle={onToggle}
            iconName={listItemIcon}
            tooltip={tooltip}
            extraIconButtons={extraIconButtons}
            />)
          }
        </div>
      </div>
      );
  }
}

export default Lists;
