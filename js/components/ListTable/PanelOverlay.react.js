import React from 'react';
import MixedFeed from '../ContactProfile/MixedFeed/MixedFeed.react';
import {grey500, grey300} from 'material-ui/styles/colors';

const PanelOverlay = ({
  profileY,
  profileX,
  onMouseEnter,
  onMouseLeave,
  contactId,
  listId,
}) => {
  return (
      <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        top: profileY,
        left: profileX + 8,
        zIndex: 200,
        width: 505,
        height: 305,
        border: `1px solid ${grey300}`,
        borderRadius: '0.2em',
        position: 'fixed',
        backgroundColor: 'white',
        boxShadow: `0 0 30px -10px ${grey500}`
      }}>
        <MixedFeed
        containerWidth={500}
        containerHeight={300}
        contactId={contactId}
        listId={listId}
        hideLoadMore
        />
      </div>);
};

export default PanelOverlay;
