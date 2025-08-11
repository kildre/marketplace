import React from 'react';

// Test component to verify image loading
const ImageTest: React.FC = () => {
  return (
    <div style={{ padding: '20px', border: '1px solid red' }}>
      <h3>Image Test</h3>
      <div>
        <img src="/assets/images/AdvanaDarkTheme.png" alt="Advana Dark" style={{ width: '100px' }} />
        <img src="/assets/images/DOD_color.png" alt="DOD Logo" style={{ width: '50px' }} />
        <img src="/assets/images/cdao_Logo.png" alt="CDAO Logo" style={{ width: '50px' }} />
      </div>
    </div>
  );
};

export default ImageTest;
