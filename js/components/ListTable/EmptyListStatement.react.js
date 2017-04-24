import React from 'react';

const EmptyListStatement = ({className, style}) => (
  <div className={className} style={style}>
    <div>
      <p>You haven't added any contacts. You will see a master sheet of them here after you added some.</p>
      <ul>
        <li>"Add Contact" icon on top to add ONE contact</li>
        <li>Go back to Home and "Upload from Existing" Excel sheet</li>
      </ul>
    </div>
  </div>);

export default EmptyListStatement;
