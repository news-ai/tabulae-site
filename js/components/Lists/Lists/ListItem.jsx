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

const FORMAT = 'ddd, MMM Do Y, hh:mm A';

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
  text: {fontSize: '0.7em', color: grey500},
};

// class ListItem extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       open: false
//     };
//   }

//   render() {
//     const {list, onToggle, iconName, tooltip, router, nameString, person, isArchiving, extraIconButtons} = this.props;
//     return (
//       <div style={{marginBottom: 10}} >
//         <div className='row vertical-center' style={{border: `1px solid ${grey700}`}} >
//           <div
//           className={cn('small-8 large-7 columns pointer', {'medium-5': person.teamid > 0, 'medium-6': person.teamid === 0})}
//           id={list.name === 'My first list!' && 'listitem_table_hop'}
//           >
//             <Link to={`/tables/${list.id}`}><span>{list.name}</span></Link>
//             <div className='right'>
//             {list.publiclist &&
//               <Tag
//               hideDelete
//               color={teal50}
//               borderColor={teal200}
//               key='public-tag'
//               text='Public'
//               link='/public'
//               />}
//             {!this.state.open &&
//               <Tags hideDelete createLink={name => `/tags/${name}`} listId={list.id} />}
//             </div>
//           </div>
//           <div className={cn('large-3 small-12 columns', {'medium-4': person.teamid > 0, 'medium-3': person.teamid === 0})} >
//           </div>
//           <div className={cn('large-2 small-4 columns', {'medium-3': person.teamid > 0, 'medium-3': person.teamid === 0})} >
//             <div style={{padding: 3}} className='pointer' onClick={_ => this.setState({open: !this.state.open})}>
//               <FontIcon
//               style={{fontSize: '0.8em'}}
//               color={grey600}
//               hoverColor={grey700}
//               className={cn({'fa fa-minus': this.state.open, 'fa fa-plus': !this.state.open})}
//               />
//               <span style={{fontSize: '0.8em', color: grey600, margin: '0 8px', userSelect: 'none'}} >{this.state.open ? 'Minimize' : 'Expand'}</span>
//             </div>
//           </div>
//         </div>
//         <div className='row' style={{background: grey200, padding: '10px 0'}} >
//           <Collapse isOpened={this.state.open}>
//             <div className='large-12 medium-12 small-12 columns'>
//               <div style={{marginBottom: 5, marginLeft: 15, display: 'inline-block'}} >
//                 <div style={{color: grey700, fontSize: '0.7em'}} >Created</div>
//                 <span className='smalltext'>{moment(list.created).tz(moment.tz.guess()).format(FORMAT)} </span>
//               </div>
//               <div style={{marginBottom: 5, marginLeft: 15, display: 'inline-block'}} >
//                 <div style={{color: grey700, fontSize: '0.7em'}} >Updated</div>
//                 <span className='smalltext'>{moment(list.updated).tz(moment.tz.guess()).format(FORMAT)} </span>
//               </div>
//               <div style={{marginBottom: 5, marginLeft: 15, display: 'inline-block'}} >
//                 <div style={{color: grey700, fontSize: '0.7em', display: 'absolute', top: 0}} >Tags</div>
//                 <Tags hideDelete createLink={name => `/tags/${name}`} listId={list.id} />
//               </div>
//             </div>
//           </Collapse>
//         </div>
//       </div>
//       );
//   }
// }


function ListItem({list, onToggle, iconName, tooltip, router, nameString, person, isArchiving, extraIconButtons}) {
  const updatedDate = new Date(list.updated);
  const createdDate = new Date(list.created);
  const listClassName = person.teamid > 0 ? 'small-8 medium-5 large-7 columns pointer' : 'small-8 medium-6 large-7 columns pointer';
  return (
    <div key='parent' className='row align-middle hovergray' style={styles.parent}>
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
    person: state.personReducer.person,
    isArchiving: get(state, `isFetchingReducer.lists[${props.list.id}].isArchiving`, false),
  };
};

export default connect(mapStateToProps)(withRouter(ListItem));
