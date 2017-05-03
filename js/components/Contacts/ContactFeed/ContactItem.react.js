import React from 'react';
import Paper from 'material-ui/Paper';
import Link from 'react-router/lib/Link';
import {blue800, indigo50, indigo200, grey50, grey300, grey700, grey800, grey500} from 'material-ui/styles/colors';
// import ContactItem from 'components/Search/ContactItem.react';
import Tags from 'components/Tags/Tags.react';
// import {Tooltip} from 'react-lightweight-tooltip';

const spanStyle = {color: grey700};

const PublicationSpan = ({name, id}) => (
  <Link className='hoverGray' to={`/publications/${id}`}>
    <span className='bold text'>{name}</span>
  </Link>
  );

const defaultFieldStyles = {
  value: {color: grey800},
  label: {
    color: blue800,
    marginRight: 5,
  },
  container: {
    marginLeft: 10
  }
};

const DefaultField = ({label, value}) => {
  return value ?
    <div className='large-12 medium-12 small-12 columns' style={defaultFieldStyles.container} >
      <span className='bold smalltext' style={defaultFieldStyles.label}>{label}</span>
      <span className='text' style={defaultFieldStyles.value}>{value}</span>
    </div> : null;
};

const styles = {
  checkbox: {
    container: {
      borderRight: `1px solid ${grey300}`,
      padding: 5,
      backgroundColor: grey50
    }
  }
};

const span = {
  fontSize: '0.8em',
  color: grey800,
  verticalAlign: 'text-top'
};

const ContactItem = ({
  onCheck, checked,
  id, firstname, lastname, email, employers, publications, listname, listid, tags, customfields,
  location, phonenumber, twitter, instagram, website, linkedin, notes}) => {
  const onSelect = _ => onCheck(id);
  return (
    <Paper className='row' zDepth={1} style={{margin: 5}}>
      <div onClick={onSelect} className='large-1 medium-1 small-2 columns vertical-center horizontal-center pointer' style={styles.checkbox.container}>
        <input type='checkbox' checked={checked} onChange={onSelect}/>
      </div>
      <div className='large-11 medium-11 small-10 columns' style={{padding: '10px 10px 10px 20px'}}>
        <div className='row'>
          <div className='large-10 medium-8 small-12 columns vertical-center'>
            <Link to={`/tables/${listid}/${id}`}>
              <span style={{fontSize: '1.1em'}}>{firstname} {lastname}</span>
            </Link>
            <span style={{margin: '0 10px', color: grey500}}>-</span>
            <span className='text'>{email}</span>
          </div>
          <div className='large-2 medium-4 small-12 columns smalltext'>
            <Link to={`/tables/${listid}`}>List: {listname}</Link>
          </div>
        {publications.length > 0 &&
          <div className='large-12 columns' style={{marginBottom: 10}}>
            {publications.reduce((acc, pub, i) => {
              // separator
              acc.push(<PublicationSpan key={i} {...pub}/>);
              if (i !== publications.length - 1) acc.push(<span key={`span-${i}`} style={spanStyle}>, </span>);
              return acc;
            }, [])}
          </div>}
          <DefaultField label='Phone #' value={phonenumber}/>
          <DefaultField label='Location' value={location}/>
          <DefaultField label='Twitter' value={twitter}/>
          <DefaultField label='Instagram' value={instagram}/>
          <DefaultField label='LinkedIn' value={linkedin}/>
          <DefaultField label='Website' value={website}/>
          <DefaultField label='Notes' value={notes}/>
        {customfields !== null && customfields.map((field, i) =>
          <DefaultField key={`${field.name}-${i}`} label={field.name} value={field.value} />)}
          <div className='large-12 medium-12 small-12 columns align-middle' style={{marginTop: 15}}>
            <span className='smalltext'>Tags:</span>
          {tags !== null &&
            <Tags hideDelete color={indigo50} borderColor={indigo200} tags={tags} createLink={name => `/contacts?tag=${name}`}/>}
          </div>
        </div>
      </div>
    </Paper>
    );
};

export default ContactItem;
