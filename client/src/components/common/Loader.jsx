import React from 'react';
import Spinner from './Spinner';

export default function Loader({ fullScreen, message = 'Loading...' }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Spinner text={message} />
      </div>
    );
  }
  return <Spinner text={message} />;
}
