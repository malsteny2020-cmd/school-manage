
import React from 'react';

const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor" {...props}>
    <path d="M50 10 a 5 5 0 0 1 0 10 a 5 5 0 0 1 0 -10 M40 25 a 15 15 0 0 1 20 0 L 50 80 z M30 40 a 20 20 0 0 1 40 0 L 50 80 z M20 55 a 25 25 0 0 1 60 0 L 50 80 z M48 80 L 48 90 M 52 80 L 52 90 M 20 85 q 30 -20 60 0 M 15 80 q 35 -25 70 0"/>
  </svg>
);

export default LogoIcon;
