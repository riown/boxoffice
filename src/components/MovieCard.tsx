import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Minus, Sparkles, Film, Users, Calendar } from "lucide-react";
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

  return (
    <motion.div
      id={`movie-card-${movie.movieCd}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6, scale: 1.01 }}
      onClick={() => onClick(movie.movieCd)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm cursor-pointer transition-all hover:border-indigo-500/30 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-indigo-400/30 dark:hover:shadow-indigo-950/10"
    >
      {/* Decorative accent for top rankers */}
      {parseInt(movie.rank, 10) <= 3 && (
        <span className="absolute top-0 right-0 h-2 w-24 bg-gradient-to-l from-indigo-500 via-purple-500 to-transparent opacity-80" />
      )}

      <div>
        {/* Header: Rank indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              {movie.rank}
            </span>
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              위
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isNew ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 flex-row py-0.5 text-2xs font-bold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 animate-pulse">
                <Sparkles className="h-3 w-3" />
                NEW
              </span>
            ) : rankIntenNum > 0 ? (
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-rose-500 dark:text-rose-400">
                <TrendingUp className="h-4 w-4" />
                {rankIntenNum}
              </span>
            ) : rankIntenNum < 0 ? (
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-blue-500 dark:text-blue-400">
                <TrendingDown className="h-4 w-4" />
                {Math.abs(rankIntenNum)}
              </span>
            ) : (
              <span className="inline-flex items-center text-zinc-400 dark:text-zinc-600">
                <Minus className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 min-h-[3.5rem] flex items-center mb-4 leading-snug">
          {movie.movieNm}
        </h3>

        {/* Info Grid */}
        <div className="space-y-2.5 text-sm border-t border-zinc-100 pt-4 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5 text-zinc-500 dark:text-zinc-400">
            <Calendar className="h-4 w-4 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
            <span>개봉일: <span className="font-medium text-zinc-800 dark:text-zinc-200">{movie.openDt || "정보 없음"}</span></span>
          </div>

          <div className="flex items-center gap-2.5 text-zinc-500 dark:text-zinc-400">
            <Users className="h-4 w-4 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
            <div>
              <span>당일 관객: </span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {formatNumber(movie.audiCnt)}명
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer statistics */}
      <div className="mt-5 pt-3 border-t border-zinc-50 flex items-center justify-between text-2xs text-zinc-400 dark:border-zinc-800/40 dark:text-zinc-500">
        <div>
          <span>누적 관객 </span>
          <span className="font-mono font-medium text-zinc-600 dark:text-zinc-300">
            {formatNumber(movie.audiAcc)}명
          </span>
        </div>
        <div className="rounded bg-zinc-100/80 px-2 py-0.5 font-mono text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          점유율 {movie.salesShare}%
        </div>
      </div>
    </motion.div>
  );
}
