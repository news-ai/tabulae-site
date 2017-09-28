// @flow
import React, {Component} from 'react';
import Link from 'react-router/lib/Link';
import withRouter from 'react-router/lib/withRouter';
import {grey50, grey100, grey200, teal50, teal200, grey700, grey500, grey600} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import Tags from 'components/Tags/TagsContainer.jsx';
import Tag from 'components/Tags/Tag.jsx';
import {connect} from 'react-redux';
import get from 'lodash/get';
import Collapse from 'react-collapse';
import cn from 'classnames';
import moment from 'moment-timezone';
import styled from 'styled-components';

const FORMAT = 'ddd, MMM Do Y, hh:mm A';

const styles = {
  parent: {
    // marginBottom: 10,
    borderRadius: '1.5em',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 3,
    paddingBottom: 3,
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
  text: {fontSize: '0.7em', color: grey500},
};

const ParentContainer = styled.div.attrs({
  className: props => props.className
})`
  padding-left: 15px;
  padding-right: 15px;
  margin-top: 3px;
  margin-bottom: 3px;
  &:hover {
    border-left: 4px double black;
    border-right: 4px double black;
    padding-left: 11px;
    padding-right: 11px;
  }
`;

const ListItem = ({list, onToggle, iconName, tooltip, router, nameString, person, isArchiving, extraIconButtons}) => {
  const updatedDate = new Date(list.updated);
  const createdDate = new Date(list.created);
  const listClassName = person.teamid > 0 ? 'small-8 medium-5 large-7 columns pointer' : 'small-8 medium-6 large-7 columns pointer';
  return (
    <ParentContainer className='row align-middle'>
      <div
      id={list.name === 'My first list!' && 'listitem_table_hop'}
      className={listClassName}
      >
        <Link to={`/tables/${list.id}`}><span>{list.name}</span></Link>
          <div className='right'>
          {list.publiclist &&
            <Tag
            hideDelete
            color={teal50}
            borderColor={teal200}
            key='public-tag'
            text='Public'
            link='/public'
            />}
            <Tags hideDelete createLink={name => `/tags/${name}`} listId={list.id}/>
          </div>
      </div>
      <div className='hide-for-small-only medium-1 large-1 columns'>
        <span style={styles.text}>{updatedDate.toLocaleDateString()}</span>
      </div>
      <div className='hide-for-small-only medium-1 large-1 columns'>
        <span style={{fontSize: '0.7em', color: grey500}}>{createdDate.toLocaleDateString()}</span>
      </div>
    {person.teamid > 0 &&
      <div className='small-4 medium-2 large-1 columns horizontal-center'>
        <span style={styles.text}>{nameString}</span>
      </div>}
      <div className='hide-for-small-only medium-3 large-2 columns'>
        <Link to={`/listfeeds/${list.id}`}>
          <IconButton
          tooltip='List Feed'
          id={list.name === 'My first list!' && 'listitem_listfeed_hop'}
          iconStyle={styles.smallIcon}
          style={styles.small}
          iconClassName='fa fa-list'
          tooltipPosition='top-left'
          />
        </Link>
        {!list.readonly && onToggle &&
          <IconButton
          tooltip={tooltip}
          iconStyle={styles.smallIcon}
          style={styles.small}
          iconClassName={isArchiving ? 'fa fa-spin fa-spinner' : iconName}
          onClick={_ => onToggle(list.id)}
          tooltipPosition='top-left'
          />}
        {extraIconButtons}
      </div>
    </ParentContainer>
    );
};

const mapStateToProps = (state, props) => {
  let nameString = '';
  if (state.personReducer.person.id === props.list.createdby) nameString = 'Me';
  else {
    const user = state.personReducer[props.list.createdby];
    if (user) {
      nameString = `${user.firstname} ${user.lastname}`;
    }
  }
  return {
    nameString,
    person: state.personReducer.person,
    isArchiving: get(state, `isFetchingReducer.lists[${props.list.id}].isArchiving`, false),
  };
};

export default connect(mapStateToProps)(withRouter(ListItem));
