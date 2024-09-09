// components/IconSVG.tsx
import React, { SVGProps } from 'react';
interface IconProps {
  className?: string;
}

export const ArrowDown: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width='15'
      height='15'
      viewBox='0 0 15 15'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
    >
      <path
        d='M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z'
        fill='currentColor'
        fillRule='evenodd'
        clipRule='evenodd'
      ></path>
    </svg>
  );
};

export const ArrowUp: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      width='15'
      height='15'
      viewBox='0 0 15 15'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
    >
      <path
        d='M3.13523 8.84197C3.3241 9.04343 3.64052 9.05363 3.84197 8.86477L7.5 5.43536L11.158 8.86477C11.3595 9.05363 11.6759 9.04343 11.8648 8.84197C12.0536 8.64051 12.0434 8.32409 11.842 8.13523L7.84197 4.38523C7.64964 4.20492 7.35036 4.20492 7.15803 4.38523L3.15803 8.13523C2.95657 8.32409 2.94637 8.64051 3.13523 8.84197Z'
        fill='currentColor'
        fillRule='evenodd'
        clipRule='evenodd'
      ></path>
    </svg>
  );
};

export const IconPersonFill: React.FC<IconProps> = ({ className }) => (
  <svg
    fill='currentColor'
    viewBox='0 0 16 16'
    height='1.2rem'
    width='1.2rem'
    className={className}
  >
    <path d='M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 100-6 3 3 0 000 6z' />
  </svg>
);

export const IconTelephoneFill: React.FC<IconProps> = ({ className }) => (
  <svg
    fill='currentColor'
    viewBox='0 0 16 16'
    height='1.2rem'
    width='1.2rem'
    className={className}
  >
    <path
      fillRule='evenodd'
      d='M1.885.511a1.745 1.745 0 012.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 00.178.643l2.457 2.457a.678.678 0 00.644.178l2.189-.547a1.745 1.745 0 011.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 01-7.01-4.42 18.634 18.634 0 01-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z'
    />
  </svg>
);

export const IconMapPin: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox='0 0 24 24'
    fill='currentColor'
    height='1.2rem'
    width='1.2rem'
    className={className}
  >
    <path d='M12 2a8 8 0 00-8 8c0 5.4 7.05 11.5 7.35 11.76a1 1 0 001.3 0C13 21.5 20 15.4 20 10a8 8 0 00-8-8zm0 17.65c-2.13-2-6-6.31-6-9.65a6 6 0 0112 0c0 3.34-3.87 7.66-6 9.65zM12 6a4 4 0 104 4 4 4 0 00-4-4zm0 6a2 2 0 112-2 2 2 0 01-2 2z' />
  </svg>
);

export const IconSearch: React.FC<IconProps> = ({ className }) => (
  <svg
    aria-hidden='true'
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 20 20'
    className={className}
  >
    <path
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z'
    />
  </svg>
);

export const IconGroup: React.FC<IconProps> = ({ className }) => (
  <svg
    height='1em'
    width='1em'
    viewBox='0 0 48 34'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <path
      d='M23.8739 0.539551C19.7401 0.539551 16.3891 4.45195 16.3891 9.27815C16.3891 11.8914 17.3716 14.2363 18.9288 15.8375C19.4837 16.408 19.4073 17.4452 18.6852 17.7798L17.6231 18.2721L10.3192 21.6596C9.61356 22.0124 9.2614 22.6107 9.2614 23.4575V31.5016C9.31944 32.5073 9.92288 33.4446 10.9012 33.4605H36.886C38.003 33.3634 38.568 32.4637 38.579 31.5016V23.4575C38.579 22.6107 38.2269 22.0124 37.5213 21.6596L30.4818 18.2721L29.1593 17.6455C28.4554 17.312 28.3738 16.3104 28.9079 15.7434C30.4133 14.1452 31.3587 11.8409 31.3587 9.27819C31.3587 4.45195 28.0076 0.539551 23.8739 0.539551ZM11.8009 3.61251C10.022 3.68007 8.61216 4.44983 7.54104 5.67635C6.35624 7.15307 5.77864 8.90635 5.76748 10.6505C5.82155 12.5673 6.47284 14.4081 7.6471 15.7514C8.17025 16.3499 8.092 17.3929 7.37114 17.7279L0.84652 20.7599C0.282 20.9716 0 21.4655 0 22.2417V28.6976C0.04408 29.5538 0.48864 30.2734 1.3222 30.2857H5.77356C6.32584 30.2857 6.77356 29.838 6.77356 29.2857V23.4575C6.86376 21.6319 7.72104 20.1563 9.2614 19.4362L14.7113 16.8436C14.9365 16.7122 15.1568 16.5556 15.3721 16.3742C15.7204 16.0806 15.7518 15.5725 15.5277 15.1758C13.7929 12.1045 13.4993 8.57546 14.5337 5.35751C14.6825 4.89449 14.5178 4.37234 14.0769 4.1672C13.3386 3.82373 12.5581 3.61701 11.8009 3.61251ZM36.1444 3.61251C35.2633 3.63096 34.4329 3.88116 33.6981 4.26431C33.2881 4.47811 33.1433 4.97374 33.2812 5.4151C34.2956 8.6623 33.9619 12.1925 32.3497 15.0878C32.1334 15.4762 32.1576 15.9692 32.4839 16.2712C32.7803 16.5456 33.0837 16.7713 33.3936 16.9484L38.6322 19.4362C40.2281 20.3115 41.051 21.8002 41.0669 23.4575V29.2858C41.0669 29.8381 41.5146 30.2858 42.0669 30.2858H46.6763C47.5988 30.2062 47.992 29.4703 48 28.6976V22.2417C48 21.5361 47.718 21.0422 47.1535 20.7599L40.5607 17.6132C39.8793 17.288 39.785 16.3389 40.2859 15.774C41.5685 14.3276 42.2151 12.5059 42.231 10.6505C42.1752 8.77003 41.6007 7.02395 40.4574 5.67635C39.2628 4.38039 37.781 3.62623 36.1444 3.61251Z'
      fill='currentColor'
    />
  </svg>
);

export const IconClipboard: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox='0 0 384 512'
    fill='currentColor'
    height='1em'
    width='1em'
    className={className}
  >
    <path d='M320 64h-49.61C262.1 27.48 230.7 0 192 0s-71 27.48-78.4 64H64C28.65 64 0 92.66 0 128v320c0 35.34 28.65 64 64 64h256c35.35 0 64-28.66 64-64V128c0-35.34-28.7-64-64-64zM192 48c13.23 0 24 10.77 24 24s-10.8 24-24 24-24-10.77-24-24 10.8-24 24-24zm144 400c0 8.82-7.178 16-16 16H64c-8.822 0-16-7.18-16-16V128c0-8.82 7.178-16 16-16h18.26c-1.33 5.1-2.26 10.4-2.26 16v16c0 8.8 7.16 16 16 16h192c8.836 0 16-7.164 16-16v-16c0-5.559-.932-10.86-2.264-16H320c8.822 0 16 7.18 16 16v320z' />
  </svg>
);

export const IconWrench: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox='0 0 512 512'
    fill='currentColor'
    height='1em'
    width='1em'
    className={className}
  >
    <path d='M78.6 5c-9.5-7.4-23-6.5-31.6 2L7 47c-8.5 8.5-9.4 22-2.1 31.6l80 104c4.5 5.9 11.6 9.4 19 9.4H158l109 109c-14.7 29-10 65.4 14.3 89.6l112 112c12.5 12.5 32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3l-112-112c-24.2-24.2-60.6-29-89.6-14.3L192 158v-54c0-7.5-3.5-14.5-9.4-19L78.6 5zM19.9 396.1C7.2 408.8 0 426.1 0 444.1 0 481.6 30.4 512 67.9 512c18 0 35.3-7.2 48-19.9l117.8-117.8c-7.8-20.9-9-43.6-3.6-65.1l-61.7-61.7L19.9 396.1zM512 144c0-10.5-1.1-20.7-3.2-30.5-2.4-11.2-16.1-14.1-24.2-6l-63.9 63.9c-3 3-7.1 4.7-11.3 4.7H352c-8.8 0-16-7.2-16-16v-57.5c0-4.2 1.7-8.3 4.7-11.3l63.9-63.9c8.1-8.1 5.2-21.8-6-24.2C388.7 1.1 378.5 0 368 0c-79.5 0-144 64.5-144 144v.8l85.3 85.3c36-9.1 75.8.5 104 28.7l15.7 15.7c49-23 83-72.8 83-130.5zM104 432c0 13.3-10.7 24-24 24s-24-10.7-24-24 10.7-24 24-24 24 10.7 24 24z' />
  </svg>
);

export const IconUsers: React.FC<IconProps> = ({ className }) => (
  <svg
    width='40'
    height='24'
    viewBox='0 0 40 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M12 12C10.4087 12 8.88258 11.3679 7.75736 10.2426C6.63214 9.11742 6 7.5913 6 6C6 4.4087 6.63214 2.88258 7.75736 1.75736C8.88258 0.632141 10.4087 0 12 0C13.5913 0 15.1174 0.632141 16.2426 1.75736C17.3679 2.88258 18 4.4087 18 6C18 7.5913 17.3679 9.11742 16.2426 10.2426C15.1174 11.3679 13.5913 12 12 12ZM28 12C26.4087 12 24.8826 11.3679 23.7574 10.2426C22.6321 9.11742 22 7.5913 22 6C22 4.4087 22.6321 2.88258 23.7574 1.75736C24.8826 0.632141 26.4087 0 28 0C29.5913 0 31.1174 0.632141 32.2426 1.75736C33.3679 2.88258 34 4.4087 34 6C34 7.5913 33.3679 9.11742 32.2426 10.2426C31.1174 11.3679 29.5913 12 28 12ZM12 16C14.2703 15.9973 16.5151 16.479 18.5845 17.413C20.6538 18.347 22.5001 19.7117 24 21.416V24H0V21.416C1.49991 19.7117 3.34617 18.347 5.41552 17.413C7.48486 16.479 9.72966 15.9973 12 16ZM28 24V19.904L27 18.77C26.2367 17.9044 25.4002 17.1061 24.5 16.384C25.6491 16.1281 26.8228 15.9993 28 16C30.2703 15.9973 32.5151 16.479 34.5845 17.413C36.6538 18.347 38.5001 19.7117 40 21.416V24H28Z'
      fill='currentColor'
    />
  </svg>
);

export const IconAddCircleOutline: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox='0 0 20 20'
    fill='currentColor'
    height='1em'
    width='1em'
    className={className}
  >
    <path d='M11 9h4v2h-4v4H9v-4H5V9h4V5h2v4zm-1 11a10 10 0 110-20 10 10 0 010 20zm0-2a8 8 0 100-16 8 8 0 000 16z' />
  </svg>
);

export const IconNoteText: React.FC<IconProps> = ({ className }) => (
  <svg
    height='1.3rem'
    width='1.3rem'
    viewBox='0 0 48 48'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M12 12C12 11.4696 12.2107 10.9609 12.5858 10.5858C12.9609 10.2107 13.4696 10 14 10H34C34.5304 10 35.0391 10.2107 35.4142 10.5858C35.7893 10.9609 36 11.4696 36 12C36 12.5304 35.7893 13.0391 35.4142 13.4142C35.0391 13.7893 34.5304 14 34 14H14C13.4696 14 12.9609 13.7893 12.5858 13.4142C12.2107 13.0391 12 12.5304 12 12Z'
      fill='currentColor'
    />
    <path
      d='M12 20C12 19.4696 12.2107 18.9609 12.5858 18.5858C12.9609 18.2107 13.4696 18 14 18H34C34.5304 18 35.0391 18.2107 35.4142 18.5858C35.7893 18.9609 36 19.4696 36 20C36 20.5304 35.7893 21.0391 35.4142 21.4142C35.0391 21.7893 34.5304 22 34 22H14C13.4696 22 12.9609 21.7893 12.5858 21.4142C12.2107 21.0391 12 20.5304 12 20Z'
      fill='currentColor'
    />
    <path
      d='M14 26C13.4696 26 12.9609 26.2107 12.5858 26.5858C12.2107 26.9609 12 27.4696 12 28C12 28.5304 12.2107 29.0391 12.5858 29.4142C12.9609 29.7893 13.4696 30 14 30H34C34.5304 30 35.0391 29.7893 35.4142 29.4142C35.7893 29.0391 36 28.5304 36 28C36 27.4696 35.7893 26.9609 35.4142 26.5858C35.0391 26.2107 34.5304 26 34 26H14Z'
      fill='currentColor'
    />
    <path
      d='M12 36C12 35.4696 12.2107 34.9609 12.5858 34.5858C12.9609 34.2107 13.4696 34 14 34H22C22.5304 34 23.0391 34.2107 23.4142 34.5858C23.7893 34.9609 24 35.4696 24 36C24 36.5304 23.7893 37.0391 23.4142 37.4142C23.0391 37.7893 22.5304 38 22 38H14C13.4696 38 12.9609 37.7893 12.5858 37.4142C12.2107 37.0391 12 36.5304 12 36Z'
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M4 8C4 6.4087 4.63214 4.88258 5.75736 3.75736C6.88258 2.63214 8.4087 2 10 2H38C39.5913 2 41.1174 2.63214 42.2426 3.75736C43.3679 4.88258 44 6.4087 44 8V40C44 41.5913 43.3679 43.1174 42.2426 44.2426C41.1174 45.3679 39.5913 46 38 46H10C8.4087 46 6.88258 45.3679 5.75736 44.2426C4.63214 43.1174 4 41.5913 4 40V8ZM10 6H38C38.5304 6 39.0391 6.21071 39.4142 6.58579C39.7893 6.96086 40 7.46957 40 8V40C40 40.5304 39.7893 41.0391 39.4142 41.4142C39.0391 41.7893 38.5304 42 38 42H10C9.46957 42 8.96086 41.7893 8.58579 41.4142C8.21071 41.0391 8 40.5304 8 40V8C8 7.46957 8.21071 6.96086 8.58579 6.58579C8.96086 6.21071 9.46957 6 10 6Z'
      fill='currentColor'
    />
  </svg>
);

export const IconSetting: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox='0 0 1024 1024'
    fill='currentColor'
    height='1em'
    width='1em'
    className={className}
  >
    <path d='M512.5 390.6c-29.9 0-57.9 11.6-79.1 32.8-21.1 21.2-32.8 49.2-32.8 79.1 0 29.9 11.7 57.9 32.8 79.1 21.2 21.1 49.2 32.8 79.1 32.8 29.9 0 57.9-11.7 79.1-32.8 21.1-21.2 32.8-49.2 32.8-79.1 0-29.9-11.7-57.9-32.8-79.1a110.96 110.96 0 00-79.1-32.8zm412.3 235.5l-65.4-55.9c3.1-19 4.7-38.4 4.7-57.7s-1.6-38.8-4.7-57.7l65.4-55.9a32.03 32.03 0 009.3-35.2l-.9-2.6a442.5 442.5 0 00-79.6-137.7l-1.8-2.1a32.12 32.12 0 00-35.1-9.5l-81.2 28.9c-30-24.6-63.4-44-99.6-57.5l-15.7-84.9a32.05 32.05 0 00-25.8-25.7l-2.7-.5c-52-9.4-106.8-9.4-158.8 0l-2.7.5a32.05 32.05 0 00-25.8 25.7l-15.8 85.3a353.44 353.44 0 00-98.9 57.3l-81.8-29.1a32 32 0 00-35.1 9.5l-1.8 2.1a445.93 445.93 0 00-79.6 137.7l-.9 2.6c-4.5 12.5-.8 26.5 9.3 35.2l66.2 56.5c-3.1 18.8-4.6 38-4.6 57 0 19.2 1.5 38.4 4.6 57l-66 56.5a32.03 32.03 0 00-9.3 35.2l.9 2.6c18.1 50.3 44.8 96.8 79.6 137.7l1.8 2.1a32.12 32.12 0 0035.1 9.5l81.8-29.1c29.8 24.5 63 43.9 98.9 57.3l15.8 85.3a32.05 32.05 0 0025.8 25.7l2.7.5a448.27 448.27 0 00158.8 0l2.7-.5a32.05 32.05 0 0025.8-25.7l15.7-84.9c36.2-13.6 69.6-32.9 99.6-57.5l81.2 28.9a32 32 0 0035.1-9.5l1.8-2.1c34.8-41.1 61.5-87.4 79.6-137.7l.9-2.6c4.3-12.4.6-26.3-9.5-35zm-412.3 52.2c-97.1 0-175.8-78.7-175.8-175.8s78.7-175.8 175.8-175.8 175.8 78.7 175.8 175.8-78.7 175.8-175.8 175.8z' />
  </svg>
);

export const IconBxErrorCircle: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox='0 0 24 24'
    fill='currentColor'
    height='1em'
    width='1em'
    className={className}
  >
    <path d='M11.953 2C6.465 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.493 2 11.953 2zM12 20c-4.411 0-8-3.589-8-8s3.567-8 7.953-8C16.391 4 20 7.589 20 12s-3.589 8-8 8z' />
    <path d='M11 7h2v7h-2zm0 8h2v2h-2z' />
  </svg>
);

export const IconQuestionCircle: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox='0 0 1024 1024'
    fill='currentColor'
    height='1em'
    width='1em'
    className={className}
  >
    <path d='M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z' />
    <path d='M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z' />
  </svg>
);

export const IconCopy: React.FC<IconProps> = ({ className }) => (
  <svg
    fill='none'
    viewBox='0 0 24 24'
    height='1em'
    width='1em'
    className={className}
  >
    <path
      fill='currentColor'
      d='M13 7H7V5h6v2zM13 11H7V9h6v2zM7 15h6v-2H7v2z'
    />
    <path
      fill='currentColor'
      fillRule='evenodd'
      d='M3 19V1h14v4h4v18H7v-4H3zm12-2V3H5v14h10zm2-10v12H9v2h10V7h-2z'
      clipRule='evenodd'
    />
  </svg>
);

export const IconLogOut: React.FC<IconProps> = ({ className }) => (
  <svg
    fill='none'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth={2}
    viewBox='0 0 24 24'
    height='1em'
    width='1em'
    className={className}
  >
    <path d='M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9' />
  </svg>
);

export const IconLogIn: React.FC<IconProps> = ({ className }) => (
  <svg
    fill='none'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth={2}
    viewBox='0 0 24 24'
    height='1em'
    width='1em'
    className={className}
  >
    <path d='M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9' />
  </svg>
);

export const IconAddLine: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox='0 0 24 24'
    fill='currentColor'
    height='1em'
    width='1em'
    className={className}
  >
    <path fill='none' d='M0 0h24v24H0z' />
    <path d='M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z' />
  </svg>
);

export const IconDownload: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox='0 0 1000 1000'
    fill='currentColor'
    height='1em'
    width='1em'
    className={className}
  >
    <path d='M967.75 652c12 6.667 21 17.333 27 32 6 14.667 7 28 3 40l-28 154c-2.667 13.333-10 24.333-22 33-12 8.667-25.333 13-40 13h-816c-14.667 0-28-4.333-40-13s-19.333-19.667-22-33l-28-154c-6.667-32 4-56 32-72l158-108h98l-170 130h178c5.333 0 9.333 2.667 12 8l40 110h300l40-110c5.333-5.333 9.333-8 12-8h178l-170-130h98l160 108m-208-322l-260 244-260-244h166V74h190v256h164' />
  </svg>
);

export const IconEdit: React.FC<IconProps> = ({ className }) => (
  <svg
    fill='none'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth={2}
    viewBox='0 0 24 24'
    height='1em'
    width='1em'
    className={className}
  >
    <path d='M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7' />
    <path d='M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' />
  </svg>
);

export const IconHome: React.FC<IconProps> = ({ className }) => (
  <svg
    aria-hidden='true'
    xmlns='http://www.w3.org/2000/svg'
    fill='currentColor'
    viewBox='0 0 20 20'
    className={className}
    height='1em'
    width='1em'
  >
    <path d='m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z' />
  </svg>
);

export const IconRightArror: React.FC<IconProps> = ({ className }) => (
  <svg
    className={className}
    aria-hidden='true'
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 6 10'
  >
    <path
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='m1 9 4-4-4-4'
    />
  </svg>
);

export const IconLoading: React.FC<IconProps> = ({ className }) => (
  <div role='status'>
    <svg
      aria-hidden='true'
      role='status'
      className={`inline animate-spin text-white ${className}`}
      viewBox='0 0 100 101'
      fill='none'
      height='1em'
      width='1em'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
        fill='#E5E7EB'
      />
      <path
        d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
        fill='currentColor'
      />
    </svg>
  </div>
);

export const IconMinus: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox='0 0 580 1000'
    fill='currentColor'
    height='1em'
    width='1em'
    className={className}
  >
    <path d='M550 450c20 0 30 16.667 30 50s-10 50-30 50H30c-20 0-30-16.667-30-50s10-50 30-50h520' />
  </svg>
);

export const IconCircleCheck: React.FC<IconProps> = ({ className }) => (
  <svg
    viewBox='0 0 512 512'
    fill='currentColor'
    height='1em'
    width='1em'
    className={className}
  >
    <path d='M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0 0 114.6 0 256s114.6 256 256 256zm113-303L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z' />
  </svg>
);

export const IconCirclePause: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      viewBox='0 0 512 512'
      fill='currentColor'
      height='1em'
      width='1em'
      className={className}
    >
      <path d='M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0 0 114.6 0 256s114.6 256 256 256zm-32-320v128c0 17.7-14.3 32-32 32s-32-14.3-32-32V192c0-17.7 14.3-32 32-32s32 14.3 32 32zm128 0v128c0 17.7-14.3 32-32 32s-32-14.3-32-32V192c0-17.7 14.3-32 32-32s32 14.3 32 32z' />
    </svg>
  );
};

export const IconPlayCircle: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      viewBox='0 0 1024 1024'
      fill='currentColor'
      height='1em'
      width='1em'
      className={className}
    >
      <path d='M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm144.1 454.9L437.7 677.8a8.02 8.02 0 01-12.7-6.5V353.7a8 8 0 0112.7-6.5L656.1 506a7.9 7.9 0 010 12.9z' />
    </svg>
  );
};

export const IconCalendarDays: React.FC<IconProps> = (props) => {
  return (
    <svg
      viewBox='0 0 448 512'
      fill='currentColor'
      height='1em'
      width='1em'
      {...props}
    >
      <path d='M128 0c17.7 0 32 14.3 32 32v32h128V32c0-17.7 14.3-32 32-32s32 14.3 32 32v32h48c26.5 0 48 21.5 48 48v48H0v-48c0-26.5 21.5-48 48-48h48V32c0-17.7 14.3-32 32-32zM0 192h448v272c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 80v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm128 0v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16h-32zM64 400v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16h-32zm112 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16z' />
    </svg>
  );
};

export const IconBxTransferAlt: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='currentColor'
      height='1em'
      width='1em'
      className={className}
    >
      <path d='M19.924 10.383a1 1 0 00-.217-1.09l-5-5-1.414 1.414L16.586 9H4v2h15a1 1 0 00.924-.617zM4.076 13.617a1 1 0 00.217 1.09l5 5 1.414-1.414L7.414 15H20v-2H5a.999.999 0 00-.924.617z' />
    </svg>
  );
};

export const IconDatabaseBackup: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      viewBox='0 0 24 24'
      height='1em'
      width='1em'
      className={className}
    >
      <path d='M21 5 A9 3 0 0 1 12 8 A9 3 0 0 1 3 5 A9 3 0 0 1 21 5 z' />
      <path d='M3 5v14c0 1.4 3 2.7 7 3M3 12c0 1.2 2 2.5 5 3M21 5v4M13 20a5 5 0 009-3 4.5 4.5 0 00-4.5-4.5c-1.33 0-2.54.54-3.41 1.41L12 16' />
      <path d='M12 12v4h4' />
    </svg>
  );
};

export const IconStar: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      viewBox='0 0 1024 1024'
      fill='currentColor'
      height='1em'
      width='1em'
      className={className}
    >
      <path d='M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 00.6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0046.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3z' />
    </svg>
  );
};

export const IconPencil: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='currentColor'
      height='1em'
      width='1em'
      className={className}
    >
      <path d='M8.707 19.707L18 10.414 13.586 6l-9.293 9.293a1.003 1.003 0 00-.263.464L3 21l5.242-1.03c.176-.044.337-.135.465-.263zM21 7.414a2 2 0 000-2.828L19.414 3a2 2 0 00-2.828 0L15 4.586 19.414 9 21 7.414z' />
    </svg>
  );
};

export const IconDeleteBinLine: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='currentColor'
      height='1em'
      width='1em'
      className={className}
    >
      <path fill='none' d='M0 0h24v24H0z' />
      <path d='M17 6h5v2h-2v13a1 1 0 01-1 1H5a1 1 0 01-1-1V8H2V6h5V3a1 1 0 011-1h8a1 1 0 011 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z' />
    </svg>
  );
};

export const IconExternalLink: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='currentColor'
      height='1em'
      width='1em'
      className={className}
    >
      <path d='M19 6.41L8.7 16.71a1 1 0 11-1.4-1.42L17.58 5H14a1 1 0 010-2h6a1 1 0 011 1v6a1 1 0 01-2 0V6.41zM17 14a1 1 0 012 0v5a2 2 0 01-2 2H5a2 2 0 01-2-2V7c0-1.1.9-2 2-2h5a1 1 0 010 2H5v12h12v-5z' />
    </svg>
  );
};

export const IIcon201Upload3: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      viewBox='0 0 16 16'
      fill='currentColor'
      height='1em'
      width='1em'
      className={className}
    >
      <path
        fill='currentColor'
        d='M7.5 11H0v4h15v-4H7.5zm6.5 2h-2v-1h2v1zM3.5 5l4-4 4 4H9v5H6V5z'
      />
    </svg>
  );
};

export const Icon200Download3: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      viewBox='0 0 16 16'
      fill='currentColor'
      height='1em'
      width='1em'
      className={className}
    >
      <path
        fill='currentColor'
        d='M11.5 7l-4 4-4-4H6V1h3v6zm-4 4H0v4h15v-4H7.5zm6.5 2h-2v-1h2v1z'
      />
    </svg>
  );
};

export const IconClockTimeThreeOutline: React.FC<IconProps> = ({
  className,
}) => {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='currentColor'
      height='1em'
      width='1em'
      className={className}
    >
      <path d='M12 20c4.4 0 8-3.6 8-8s-3.6-8-8-8-8 3.6-8 8 3.6 8 8 8m0-18c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2m5 9.5V13h-6V7h1.5v4.5H17z' />
    </svg>
  );
};

export const IconClose: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      fill='none'
      viewBox='0 0 24 24'
      height='1em'
      width='1em'
      className={className}
    >
      <path
        fill='currentColor'
        d='M6.225 4.811a1 1 0 00-1.414 1.414L10.586 12 4.81 17.775a1 1 0 101.414 1.414L12 13.414l5.775 5.775a1 1 0 001.414-1.414L13.414 12l5.775-5.775a1 1 0 00-1.414-1.414L12 10.586 6.225 4.81z'
      />
    </svg>
  );
};

export const IconCheck: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      fill='currentColor'
      viewBox='0 0 16 16'
      height='1em'
      width='1em'
      className={className}
    >
      <path d='M10.97 4.97a.75.75 0 011.07 1.05l-3.99 4.99a.75.75 0 01-1.08.02L4.324 8.384a.75.75 0 111.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 01.02-.022z' />
    </svg>
  );
};

export const TriangleAlertIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      className={className}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3' />
      <path d='M12 9v4' />
      <path d='M12 17h.01' />
    </svg>
  );
};

export const IconRefresh: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg fill='none' viewBox='0 0 15 15' height='1em' width='1em'>
    <path
      fill='currentColor'
      fillRule='evenodd'
      d='M4.854 2.146a.5.5 0 010 .708L3.707 4H9a4.5 4.5 0 110 9H5a.5.5 0 010-1h4a3.5 3.5 0 100-7H3.707l1.147 1.146a.5.5 0 11-.708.708l-2-2a.5.5 0 010-.708l2-2a.5.5 0 01.708 0z'
      clipRule='evenodd'
    />
  </svg>
);

export const IconAlarm: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    fill='currentColor'
    viewBox='0 0 16 16'
    height='1em'
    width='1em'
    className={className}
  >
    <path d='M8.5 5.5a.5.5 0 00-1 0v3.362l-1.429 2.38a.5.5 0 10.858.515l1.5-2.5A.5.5 0 008.5 9V5.5z' />
    <path d='M6.5 0a.5.5 0 000 1H7v1.07a7.001 7.001 0 00-3.273 12.474l-.602.602a.5.5 0 00.707.708l.746-.746A6.97 6.97 0 008 16a6.97 6.97 0 003.422-.892l.746.746a.5.5 0 00.707-.708l-.601-.602A7.001 7.001 0 009 2.07V1h.5a.5.5 0 000-1h-3zm1.038 3.018a6.093 6.093 0 01.924 0 6 6 0 11-.924 0zM0 3.5c0 .753.333 1.429.86 1.887A8.035 8.035 0 014.387 1.86 2.5 2.5 0 000 3.5zM13.5 1c-.753 0-1.429.333-1.887.86a8.035 8.035 0 013.527 3.527A2.5 2.5 0 0013.5 1z' />
  </svg>
);

export const IconChecklist: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    viewBox='0 0 16 16'
    fill='currentColor'
    height='1em'
    width='1em'
    className={className}
  >
    <path
      fillRule='evenodd'
      d='M2.5 1.75a.25.25 0 01.25-.25h8.5a.25.25 0 01.25.25v7.736a.75.75 0 101.5 0V1.75A1.75 1.75 0 0011.25 0h-8.5A1.75 1.75 0 001 1.75v11.5c0 .966.784 1.75 1.75 1.75h3.17a.75.75 0 000-1.5H2.75a.25.25 0 01-.25-.25V1.75zM4.75 4a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5zM4 7.75A.75.75 0 014.75 7h2a.75.75 0 010 1.5h-2A.75.75 0 014 7.75zm11.774 3.537a.75.75 0 00-1.048-1.074L10.7 14.145 9.281 12.72a.75.75 0 00-1.062 1.058l1.943 1.95a.75.75 0 001.055.008l4.557-4.45z'
    />
  </svg>
);

export const IconEvent: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    enable-background='new 0 0 48 48'
    height='48px'
    id='Layer_4'
    version='1.1'
    viewBox='0 0 48 48'
    width='48px'
    xmlns='http://www.w3.org/2000/svg'
    className={className}
    fill='currentColor'
  >
    <g>
      <polygon
        fill='currentColor'
        points='25.916,8 25.916,23.359 32.992,30.434 30.164,33.262 21.9,25 21.916,24.983 21.916,8  '
      />
      <path
        d='M2.216,34.138H0v4.747h2.216c0.271,1.058,0.711,2.051,1.306,2.934l-1.521,1.522l2.693,2.691l1.544-1.543   c0.852,0.554,1.797,0.972,2.808,1.231v2.216h4.761v-2.216c1.033-0.267,2.002-0.695,2.867-1.269l1.486,1.484l2.692-2.691   l-1.485-1.484c0.572-0.864,1-1.831,1.268-2.862h2.218v-4.776h-2.218c-0.262-1.007-0.677-1.951-1.23-2.8l1.448-1.449l-2.692-2.692   l-1.426,1.425c-0.879-0.591-1.865-1.029-2.918-1.302v-2.22h-4.78v2.22c-1.03,0.268-1.994,0.694-2.858,1.267l-1.483-1.486   l-2.693,2.694l1.484,1.484C2.909,32.131,2.481,33.103,2.216,34.138z M7.51,36.511c0-2.163,1.754-3.917,3.916-3.917   c2.164,0,3.918,1.754,3.918,3.917s-1.754,3.917-3.918,3.917C9.264,40.428,7.51,38.674,7.51,36.511z'
        fill='currentColor'
      />
      <path
        d='M0.025,22.997v2.007C0.012,24.67,0,24.336,0,24S0.012,23.33,0.025,22.997z'
        fill='currentColor'
      />
      <path
        d='M30.083,9.958L31.041,9H31l2.555-2.555C30.715,4.893,27.465,4,24,4C13.322,4,4.624,12.375,4.055,22.911   H0.027C0.598,10.162,11.11,0,24,0c4.576,0,8.845,1.293,12.483,3.517L39,1v0.042L40.041,0v9.715l-0.243,0.243H30.083z'
        fill='currentColor'
      />
      <path
        d='M44,24c0-2.868-0.618-5.585-1.709-8.048l2.998-2.998C47.014,16.261,48,20.012,48,24   c0,13.255-10.745,24-24,24v-4C35.046,44,44,35.046,44,24z'
        fill='currentColor'
      />
    </g>
  </svg>
);

export const IconDashboard: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    viewBox='0 0 1024 1024'
    fill='currentColor'
    height='1em'
    width='1em'
    className={className}
  >
    <path d='M924.8 385.6a446.7 446.7 0 00-96-142.4 446.7 446.7 0 00-142.4-96C631.1 123.8 572.5 112 512 112s-119.1 11.8-174.4 35.2a446.7 446.7 0 00-142.4 96 446.7 446.7 0 00-96 142.4C75.8 440.9 64 499.5 64 560c0 132.7 58.3 257.7 159.9 343.1l1.7 1.4c5.8 4.8 13.1 7.5 20.6 7.5h531.7c7.5 0 14.8-2.7 20.6-7.5l1.7-1.4C901.7 817.7 960 692.7 960 560c0-60.5-11.9-119.1-35.2-174.4zM761.4 836H262.6A371.12 371.12 0 01140 560c0-99.4 38.7-192.8 109-263 70.3-70.3 163.7-109 263-109 99.4 0 192.8 38.7 263 109 70.3 70.3 109 163.7 109 263 0 105.6-44.5 205.5-122.6 276zM623.5 421.5a8.03 8.03 0 00-11.3 0L527.7 506c-18.7-5-39.4-.2-54.1 14.5a55.95 55.95 0 000 79.2 55.95 55.95 0 0079.2 0 55.87 55.87 0 0014.5-54.1l84.5-84.5c3.1-3.1 3.1-8.2 0-11.3l-28.3-28.3zM490 320h44c4.4 0 8-3.6 8-8v-80c0-4.4-3.6-8-8-8h-44c-4.4 0-8 3.6-8 8v80c0 4.4 3.6 8 8 8zm260 218v44c0 4.4 3.6 8 8 8h80c4.4 0 8-3.6 8-8v-44c0-4.4-3.6-8-8-8h-80c-4.4 0-8 3.6-8 8zm12.7-197.2l-31.1-31.1a8.03 8.03 0 00-11.3 0l-56.6 56.6a8.03 8.03 0 000 11.3l31.1 31.1c3.1 3.1 8.2 3.1 11.3 0l56.6-56.6c3.1-3.1 3.1-8.2 0-11.3zm-458.6-31.1a8.03 8.03 0 00-11.3 0l-31.1 31.1a8.03 8.03 0 000 11.3l56.6 56.6c3.1 3.1 8.2 3.1 11.3 0l31.1-31.1c3.1-3.1 3.1-8.2 0-11.3l-56.6-56.6zM262 530h-80c-4.4 0-8 3.6-8 8v44c0 4.4 3.6 8 8 8h80c4.4 0 8-3.6 8-8v-44c0-4.4-3.6-8-8-8z' />
  </svg>
);

export const IconUserAdd: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    viewBox='0 0 1000 1000'
    fill='currentColor'
    height='1em'
    width='1em'
    className={className}
  >
    <path d='M620 722c120 42.667 180 83.333 180 122v106H0V748c24-9.333 51.333-18 82-26 62.667-22.667 105.667-45.667 129-69s35-55 35-95c0-14.667-7.667-30.667-23-48s-25.667-42-31-74c-1.333-8-9-16.333-23-25-14-8.667-22.333-29-25-61 0-10.667 1.667-19.333 5-26 3.333-6.667 6.333-10.667 9-12l4-4c-5.333-33.333-9.333-62.667-12-88-4-36 9.333-73.333 40-112s84-58 160-58 129.333 19.333 160 58 44.667 76 42 112l-14 88c12 5.333 18 19.333 18 42-1.333 18.667-4.333 33-9 43s-9.333 15.667-14 17c-4.667 1.333-9.333 4-14 8s-7.667 10-9 18c-6.667 30.667-17.667 55-33 73-15.333 18-23 34.333-23 49 0 40 12 71.667 36 95s67.333 46.333 130 69m230-272h150v100H850v150H750V550H600V450h150V300h100v150' />
  </svg>
);

export const IconImport: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    fill='none'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth={2}
    viewBox='0 0 24 24'
    height='1em'
    width='1em'
    className={className}
  >
    <path d='M12 3v12M8 11l4 4 4-4' />
    <path d='M8 5H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2h-4' />
  </svg>
);

export const IconAccountArrowDown: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    viewBox='0 0 24 24'
    fill='currentColor'
    height='1em'
    width='1em'
    className={className}
  >
    <path d='M19 18v-4h-2v4h-2l3 3 3-3h-2M11 4C8.8 4 7 5.8 7 8s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4m0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m0 7c-2.7 0-8 1.3-8 4v3h9.5c-.3-.6-.4-1.2-.5-1.9H4.9V17c0-.6 3.1-2.1 6.1-2.1.5 0 1 .1 1.5.1.3-.6.6-1.2 1.1-1.7-1-.2-1.9-.3-2.6-.3' />
  </svg>
);

export const IconCalendarPreviousDate: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    viewBox='0 0 24 24'
    fill='currentColor'
    height='1em'
    width='1em'
    className={className}
  >
    <path d='M2 3h17a2 2 0 012 2v4h-2V5H2v14h17v-4h2v4a2 2 0 01-2 2H2a2 2 0 01-2-2V5a2 2 0 012-2m15 12v-2h7v-2h-7V9l-4 3 4 3M4 13h7v-2H4v2m0-4h7V7H4v2m0 8h4v-2H4v2z' />
  </svg>
);
