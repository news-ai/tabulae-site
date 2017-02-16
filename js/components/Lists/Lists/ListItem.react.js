import React, {PropTypes} from 'react';
import Link from 'react-router/lib/Link';
import withRouter from 'react-router/lib/withRouter';
import {listPropTypes} from 'constants/CommonPropTypes';
import {teal50, teal200, grey700, grey500} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import Tags from '../../Tags/Tags.react';
import Tag from '../../Tags/Tag.react';
import {connect} from 'react-redux';

const styles = {
  parent: {
    marginBottom: 10,
    borderRadius: '1.5em',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 5,
    paddingBottom: 5,
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

function ListItem({list, onToggle, iconName, tooltip, router, nameString, person}) {
  const updatedDate = new Date(list.updated);
  const listClassName = person.teamid > 0 ? 'small-8 medium-5 large-7 columns pointer' : 'small-8 medium-6 large-7 columns pointer';
  return (
    <div key='parent' className='row align-middle hovergray' style={styles.parent}>
      <div
      id={list.name === 'My first list!' && 'listitem_table_hop'}
      className={listClassName}>
        <Link to={`/tables/${list.id}`}><span>{list.name}</span></Link>
          <div style={{float: 'right'}}>
          {list.publiclist &&
            <Tag
            hideDelete
            color={teal50}
            borderColor={teal200}
            key='public-tag'
            text='Public'
            link='/public'
            />}
            <Tags hideDelete listId={list.id}/>
          </div>
      </div>
      <div className='hide-for-small-only medium-2 large-1 columns horizontal-center'>
        <span style={{fontSize: '0.8em', fontColor: grey500}}>{updatedDate.toLocaleDateString()}</span>
      </div>
    {person.teamid &&
      <div className='small-4 medium-2 large-2 columns horizontal-center'>
        <span style={{fontSize: '0.8em', fontColor: grey500}}>{nameString}</span>
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
          iconClassName={iconName}
          onClick={_ => onToggle(list.id)}
          tooltipPosition='top-left'
          />}
      </div>
    </div>
    );
}
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
    person: state.personReducer.person
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {};
};

ListItem.PropTypes = {
  list: listPropTypes.isRequired,
  key: PropTypes.number,
  onToggle: PropTypes.func.isRequired,
  iconName: PropTypes.string.isRequired,
  tooltip: PropTypes.string
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ListItem));
