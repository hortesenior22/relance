import { CATEGORY_CONFIG } from "./searchConfig";
import type { SearchResult } from "./useGlobalSearch";

const COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  teal: "bg-teal-500/15 text-teal-400 border-teal-500/20",
  purple: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  amber: "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

const AVATAR_COLOR: Record<string, string> = {
  blue: "bg-blue-500/20 text-blue-300",
  teal: "bg-teal-500/20 text-teal-300",
  purple: "bg-purple-500/20 text-purple-300",
  amber: "bg-amber-500/20 text-amber-300",
};

interface Props {
  result: SearchResult;
  highlight?: string;
  onClick: (result: SearchResult) => void;
  isActive?: boolean;
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <mark className="bg-brand/30 text-white rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </span>
  );
}

export default function SearchResultItem({ result, highlight = "", onClick, isActive }: Props) {
  const cfg = CATEGORY_CONFIG[result.category];
  const colorCls = COLOR_MAP[cfg.color] ?? COLOR_MAP.blue;
  const avatarCls = AVATAR_COLOR[cfg.color] ?? AVATAR_COLOR.blue;
  const initials = result.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <button
      type="button"
      onClick={() => onClick(result)}
      className={`
        w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left
        transition-all duration-100 group
        ${isActive
          ? "bg-white/10 shadow-inner"
          : "hover:bg-white/6 active:bg-white/10"
        }
      `}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-lg overflow-hidden ${avatarCls} flex items-center justify-center text-xs font-semibold`}>
        {result.avatar ? (
          <img src={result.avatar} alt={result.name} className="w-full h-full object-cover" />
        ) : (
          <span>{initials || "?"}</span>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate leading-tight">
          {highlightMatch(result.name, highlight)}
        </p>
        {result.secondary && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{result.secondary}</p>
        )}
      </div>

      {/* Category badge */}
      <span className={`flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border ${colorCls}`}>
        {cfg.label}
      </span>

      {/* Arrow on hover */}
      <svg
        className="flex-shrink-0 w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}