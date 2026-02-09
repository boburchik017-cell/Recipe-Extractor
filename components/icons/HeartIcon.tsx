
import React from 'react';

interface HeartIconProps extends React.SVGProps<SVGSVGElement> {
  isLiked: boolean;
}

export const HeartIcon: React.FC<HeartIconProps> = ({ isLiked, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={isLiked ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M19.5 12.572l-7.5 7.428-7.5-7.428a5 5 0 1 1 7.5-6.566 5 5 0 1 1 7.5 6.572" />
  </svg>
);
