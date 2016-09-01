import React from 'react';

function Navigation({children}) {
  return (
    <div>
      <div className='u-full-width row' style={{
        position: 'fixed',
        height: '50px',
        backgroundColor: 'white',
        // border: '1px dotted black',
        boxShadow: '0px 0px 5px 3px rgba(0, 0, 0, 0.1)',
        top: 0,
        display: 'flex',
        alignItems: 'center',
        padding: '5px'
      }}>
        {children}
      </div>
      <div style={{height: '60px'}}></div>
    </div>
    );
}

export default Navigation;
