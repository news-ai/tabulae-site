import React, {PropTypes} from 'react';
import {grey400, grey50} from 'material-ui/styles/colors';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import FontIcon from 'material-ui/FontIcon';

const defaultStyle = {
  paddingTop: 10,
  paddingBottom: 10,
  marginTop: 10,
  marginBottom: 10,
  border: `dotted 1px ${grey400}`,
  borderRadius: '0.4em'
};

let imgContainerStyle = {
  marginBottom: 20,
  marginTop: 20,
  backgroundColor: grey50,
  width: 500,
  height: 500
};

const InstagramItem = ({
  screenWidth,
  style,
  text,
  createdat,
  instagramcomments,
  instagramid,
  instagramheight,
  instagramwidth,
  instagramlikes,
  instagramimage,
  instagramlink,
  instagramusername,
  instagramvideo,
}) => {
  const containerStyle = style ? Object.assign({}, defaultStyle, style) : defaultStyle;
  const date = new Date(createdat);
  if (screenWidth && screenWidth < imgContainerStyle.width) imgContainerStyle.width = screenWidth;

  return (
    <div className='row' style={containerStyle}>
      <div className='large-12 medium-12 small-12 columns'><span style={{fontSize: '0.8em', color: grey400}}>from Instagram</span></div>
      <div className='large-12 medium-2 small-12 columns'>
        <a target='_blank' style={{float: 'left'}} href={instagramlink}>{text ? text : instagramlink}</a>
        <span style={{float: 'right'}}>
          {instagramusername ? <a target='_blank' href={`https://instagram.com/${instagramusername}`}>{instagramusername}</a> : instagramusername}
        </span>
      </div>
      <div className='large-12 medium-12 small-12 columns' style={{fontSize: '0.8em'}}>
        <span>{date.toDateString()}</span><span style={{marginLeft: 8}}>{date.toTimeString()}</span>
      </div>
      {!instagramvideo && <div className='large-12 medium-12 small-12 columns horizontal-center' style={imgContainerStyle}>
        <img style={{maxHeight: '100%', maxWidth: '100%'}} src={instagramimage} />
      </div>}
      {instagramvideo && <div className='large-12 medium-12 small-12 columns horizontal-center' style={imgContainerStyle}>
        <video src={instagramvideo} controls>
        Your browser does not support the <code>video</code> element.
        </video>
      </div>}
      <div className='large-12 medium-12 small-12 columns vertical-center horizontal-center' style={{marginBottom: 10}}>
        <Chip style={{margin: 5, float: 'right'}}>
          <Avatar size={30} icon={<FontIcon className='fa fa-heart' />} />
          {instagramlikes}
        </Chip>
        <Chip style={{margin: 5, float: 'right'}}>
          <Avatar size={30} icon={<FontIcon className='fa fa-comment' />} />
          {instagramcomments}
        </Chip>
      </div>
    </div>);
};

export default InstagramItem;
