import { SVGProps } from 'react';

export function PersonalIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-max w-max"
      {...props}
    >
      <path d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
      <path d="M8.5 20a8.5 8.5 0 0 1 7 0" />
    </svg>
  );
}
