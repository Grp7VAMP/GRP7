interface TooltipProps {
  children: React.ReactNode;
  content: string;
}

export function Tooltip({ children, content }: TooltipProps) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute right-0 top-full mt-2 w-auto p-2 bg-zinc-800 text-white text-sm rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
        {content}
      </div>
    </div>
  );
}

