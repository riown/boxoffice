import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Minus, Sparkles, Calendar, ChevronRight } from "lucide-react";
import { DailyBoxOffice } from "../types";

interface MovieCardProps {
  movie: DailyBoxOffice;
  onClick: (movieCd: string) => void;
  index: number;
  key?: string | number;
}

// Helper to format numbers with commas
const formatNumber = (numStr: string): string => {
  const num = parseInt(numStr, 10);
  if (isNaN(num)) return numStr;
  return num.toLocaleString();
};

export default function MovieCard({ movie, onClick, index }: MovieCardProps) {
  const isNew = movie.rankOldAndNew === "NEW";
  const rankIntenNum = parseInt(movie.rankInten, 10);
  const isTopRank = parseInt(movie.rank, 10) <= 3;

  return (
    <motion.div
      id={`movie-list-item-${movie.movieCd}`}
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ x: 4 }}
      onClick={() => onClick(movie.movieCd)}
      className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden rounded-xl border border-zinc-200/80 bg-white p-5 shadow-xs cursor-pointer transition-all hover:border-indigo-500/40 hover:bg-zinc-50/50 dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:hover:border-indigo-400/30 dark:hover:bg-zinc-900/80"
    >
      {/* Decorative vertical ranking bar on the left for top rankers */}
      {isTopRank && (
        <span className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500" />
      )}

      {/* Main content grid */}
      <div className="flex flex-1 items-center gap-4 sm:gap-6">
        
        {/* 1. Rank & Trend status column */}
        <div className="flex flex-col items-center justify-center min-w-[3.5rem] text-center border-r border-zinc-100 dark:border-zinc-800/60 pr-4 sm:pr-6">
          <span className={`font-mono text-3xl font-black tracking-tight ${
            isTopRank 
              ? "text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400" 
              : "text-zinc-500 dark:text-zinc-400"
          }`}>
            {movie.rank.padStart(2, "0")}
          </span>
          
          <div className="mt-1">
            {isNew ? (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/30 dark:border-emerald-800/30 animate-pulse">
                <Sparkles className="h-2.5 w-2.5" />
                NEW
              </span>
            ) : rankIntenNum > 0 ? (
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-rose-500 dark:text-rose-400">
                <TrendingUp className="h-3 w-3" />
                {rankIntenNum}
              </span>
            ) : rankIntenNum < 0 ? (
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-blue-500 dark:text-blue-400">
                <TrendingDown className="h-3 w-3" />
                {Math.abs(rankIntenNum)}
              </span>
            ) : (
              <span className="inline-flex items-center text-zinc-300 dark:text-zinc-700">
                <Minus className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        </div>

        {/* 2. Movie Name and Basics column */}
        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400 transition-colors truncate">
              {movie.movieNm}
            </h3>
            {isTopRank && (
              <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                TOP
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 dark:text-zinc-500">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-zinc-400/80" />
              개봉일: <span className="font-medium text-zinc-600 dark:text-zinc-400">{movie.openDt || "정보 없음"}</span>
            </span>
            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-800">•</span>
            <span>
              매출 점유율 <span className="font-semibold text-zinc-600 dark:text-zinc-400 font-mono">{movie.salesShare}%</span>
            </span>
          </div>

          {/* Quick AI Review action pill button */}
          <div className="mt-3">
            <button
              id={`review-btn-${movie.movieCd}`}
              onClick={(e) => {
                e.stopPropagation();
                onClick(movie.movieCd);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1 text-2xs font-extrabold text-indigo-650 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 transition cursor-pointer"
            >
              <Sparkles className="h-3 w-3 text-indigo-500 animate-pulse" />
              감상평 작성
            </button>
          </div>
        </div>
      </div>

      {/* 3. Stats & Audience indicators column */}
      <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-zinc-100 pt-3 md:border-t-0 md:pt-0 dark:border-zinc-800/40">
        
        {/* Audience Stat Counts */}
        <div className="flex gap-4 sm:gap-6 text-right font-mono">
          <div className="text-left sm:text-right">
            <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">당일 관객</span>
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {formatNumber(movie.audiCnt)}명
            </span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">누적 관객</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {formatNumber(movie.audiAcc)}명
            </span>
          </div>
        </div>

        {/* View Details Click Indicator */}
        <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 text-zinc-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-zinc-800/40 dark:text-zinc-600 dark:group-hover:bg-indigo-950/50 dark:group-hover:text-indigo-400 transition-all">
          <ChevronRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

    </motion.div>
  );
}

