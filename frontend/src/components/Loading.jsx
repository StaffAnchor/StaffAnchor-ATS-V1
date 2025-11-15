import React from 'react';
import loader from '../assets/StaffAnchorLogoLowerHalf.png';

const Loading = ({ text = 'Loading...' }) => (
  <div className="loading">
    <img src={loader} alt="Loading animation" />
    <span>{text}</span>
  </div>
);

export default Loading;
