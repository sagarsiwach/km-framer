// import Icons, { ArrowBottomLeft, ArrowBottomRight, ArrowDown, ArrowLeft, ArrowRight, ArrowTopLeft, ArrowTopRight, ArrowUp, CheckIcon, CloseIcon, InfoIcon, MapPinIcon, MenuIcon, MinusIcon, MoreIcon, PlusIcon } from "https://framer.com/m/Icons-8dPD.js@E09MLXBSbfg0ovv5k1LZ"
// Icons.js - Reusable icon components for Kabira Mobility
import React from "react";
import Tokens from "https://framer.com/m/Design-tokens-UkAP.js@37USuBmz1zu5d0RNt78E";

// Base icon component that all others will extend
function Icon({
  size = 32,
  color = "#404040",
  viewBox = "0 0 32 32",
  children,
  ...props
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {children}
    </svg>
  );
}

// Direction arrows
export function ArrowRight({ size = 32, color = "#404040", ...props }) {
  return (
    <Icon size={size} {...props}>
      <g clipPath="url(#clip0_arrow_right)">
        <path
          d="M18 6L16.57 7.393L24.15 15H4V17H24.15L16.57 24.573L18 26L28 16L18 6Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_arrow_right">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </Icon>
  );
}

export function ArrowLeft({ size = 32, color = "#404040", ...props }) {
  return (
    <Icon size={size} {...props}>
      <g clipPath="url(#clip0_arrow_left)">
        <path
          d="M14 6L4 16L14 26L15.43 24.607L7.85 17H28V15H7.85L15.43 7.427L14 6Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_arrow_left">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </Icon>
  );
}

export function ArrowUp({ size = 32, color = "#404040", ...props }) {
  return (
    <Icon size={size} {...props}>
      <g clipPath="url(#clip0_arrow_up)">
        <path
          d="M16 4L6 14L7.4 15.43L15 7.85V28H17V7.85L24.6 15.43L26 14L16 4Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_arrow_up">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </Icon>
  );
}

export function ArrowDown({ size = 32, color = "#404040", ...props }) {
  return (
    <Icon size={size} {...props}>
      <g clipPath="url(#clip0_arrow_down)">
        <path
          d="M16 28L26 18L24.6 16.57L17 24.15V4H15V24.15L7.4 16.57L6 18L16 28Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_arrow_down">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </Icon>
  );
}

export function ArrowTopRight({ size = 32, color = "#404040", ...props }) {
  return (
    <Icon size={size} {...props}>
      <g clipPath="url(#clip0_arrow_topright)">
        <path
          d="M10 6V8H22.59L6 24.59L7.41 26L24 9.41V22H26V6H10Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_arrow_topright">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </Icon>
  );
}

export function ArrowTopLeft({ size = 32, color = "#404040", ...props }) {
  return (
    <Icon size={size} {...props}>
      <g clipPath="url(#clip0_arrow_topleft)">
        <path
          d="M22 6V8H9.41L26 24.59L24.59 26L8 9.41V22H6V6H22Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_arrow_topleft">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </Icon>
  );
}

export function ArrowBottomRight({ size = 32, color = "#404040", ...props }) {
  return (
    <Icon size={size} {...props}>
      <g clipPath="url(#clip0_arrow_bottomright)">
        <path
          d="M10 26V24H22.59L6 7.41L7.41 6L24 22.59V10H26V26H10Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_arrow_bottomright">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </Icon>
  );
}

export function ArrowBottomLeft({ size = 32, color = "#404040", ...props }) {
  return (
    <Icon size={size} {...props}>
      <g clipPath="url(#clip0_arrow_bottomleft)">
        <path
          d="M22 26V24H9.41L26 7.41L24.59 6L8 22.59V10H6V26H22Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_arrow_bottomleft">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </Icon>
  );
}

// UI Control icons
export function MenuIcon({ size = 32, color = "#404040", ...props }) {
  return (
    <Icon size={size} {...props}>
      <path
        d="M4 24V21.3333H28V24H4ZM4 17.3333V14.6667H28V17.3333H4ZM4 10.6667V8H28V10.6667H4Z"
        fill={color}
      />
    </Icon>
  );
}

export function CloseIcon({ size = 32, color = "#404040", ...props }) {
  return (
    <Icon size={size} {...props}>
      <g clipPath="url(#clip0_close)">
        <path
          d="M17.4141 16L24 9.4141L22.5859 8L16 14.5859L9.4143 8L8 9.4141L14.5859 16L8 22.5859L9.4143 24L16 17.4141L22.5859 24L24 22.5859L17.4141 16Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_close">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </Icon>
  );
}

// Additional common icons you might need
export function PlusIcon({ size = 32, color = "#404040", ...props }) {
  return (
    <Icon size={size} {...props}>
      <path d="M17 7V15H25V17H17V25H15V17H7V15H15V7H17Z" fill={color} />
    </Icon>
  );
}

export function MinusIcon({ size = 32, color = "#404040", ...props }) {
  return (
    <Icon size={size} {...props}>
      <path d="M7 15V17H25V15H7Z" fill={color} />
    </Icon>
  );
}

export function CheckIcon({ size = 32, color = "#404040", ...props }) {
  return (
    <Icon size={size} {...props}>
      <path
        d="M13 21.2L7 15.2L8.4 13.8L13 18.4L23.6 7.8L25 9.2L13 21.2Z"
        fill={color}
      />
    </Icon>
  );
}

export function InfoIcon({ size = 32, color = "#404040", ...props }) {
  return (
    <Icon size={size} {...props}>
      <path
        d="M16 4C9.4 4 4 9.4 4 16C4 22.6 9.4 28 16 28C22.6 28 28 22.6 28 16C28 9.4 22.6 4 16 4ZM16 6C21.5 6 26 10.5 26 16C26 21.5 21.5 26 16 26C10.5 26 6 21.5 6 16C6 10.5 10.5 6 16 6ZM15 10V12H17V10H15ZM15 14V22H17V14H15Z"
        fill={color}
      />
    </Icon>
  );
}

export function MapPinIcon({ size = 32, color = "#404040", ...props }) {
  return (
    <Icon size={size} {...props}>
      <path
        d="M16 4C11.6 4 8 7.6 8 12C8 18 16 26 16 26C16 26 24 18 24 12C24 7.6 20.4 4 16 4ZM16 14C14.9 14 14 13.1 14 12C14 10.9 14.9 10 16 10C17.1 10 18 10.9 18 12C18 13.1 17.1 14 16 14Z"
        fill={color}
      />
    </Icon>
  );
}

export function MoreIcon({ size = 32, color = "#404040", ...props }) {
  return (
    <Icon size={size} {...props}>
      <g clipPath="url(#clip0_more)">
        <path
          d="M8 18C9.10457 18 10 17.1046 10 16C10 14.8954 9.10457 14 8 14C6.89543 14 6 14.8954 6 16C6 17.1046 6.89543 18 8 18Z"
          fill={color}
        />
        <path
          d="M16 18C17.1046 18 18 17.1046 18 16C18 14.8954 17.1046 14 16 14C14.8954 14 14 14.8954 14 16C14 17.1046 14.8954 18 16 18Z"
          fill={color}
        />
        <path
          d="M24 18C25.1046 18 26 17.1046 26 16C26 14.8954 25.1046 14 24 14C22.8954 14 22 14.8954 22 16C22 17.1046 22.8954 18 24 18Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_more">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </Icon>
  );
}

export default {
  ArrowRight,
  ArrowLeft,
  MoreIcon,
  ArrowUp,
  ArrowDown,
  ArrowTopRight,
  ArrowTopLeft,
  ArrowBottomRight,
  ArrowBottomLeft,
  MenuIcon,
  CloseIcon,
  PlusIcon,
  MinusIcon,
  CheckIcon,
  InfoIcon,
  MapPinIcon,
};
