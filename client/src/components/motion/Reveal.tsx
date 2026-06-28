import type { HTMLAttributes } from "react";

type RevealProps = HTMLAttributes<HTMLDivElement>;

export default function Reveal({ children, ...props }: RevealProps) {
  return (
    <div data-reveal {...props}>
      {children}
    </div>
  );
}
