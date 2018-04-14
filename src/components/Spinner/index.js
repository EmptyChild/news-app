import React from 'react';
import './index.css';

export default function Spinner(/*props*/) {
  return (
    <div className='spinner-container'>
      <span>Loading...</span>
      <div className='donut'></div>
    </div>
  );
}