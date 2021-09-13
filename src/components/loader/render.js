import React, { forwardRef } from 'react';

export default forwardRef(({ className }, ref) => (
  <p className={className} ref={ref}>
    Loading...
  </p>
));
