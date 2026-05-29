import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, 
  Sun, 
  Moon, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Film, 
  HelpCircle, 
  TrendingUp, 
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { DailyBoxOffice, BoxOfficeResponse } from "./types";
import MovieCard from "./components/MovieCard";
import MovieDetailModal from "./components/MovieDetailModal";

// Helpers to handle date strings
const getYesterdayDate = (): Date => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
};

const formatDateToInputString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateKorean = (dateStr: string): string => {
  if (!dateStr || dateStr.length < 10) return dateStr;
  const [year, month, day] = dateStr.split("-");
  return `${year}년 ${month}월 ${day}일`;
};

export default function App() {
  const yesterdayStr = formatDateToInputString(getYesterdayDate());
  
  // States
  const [selectedDate, setSelectedDate] = useState<string>(yesterdayStr);
  const [movies, setMovies] = useState<DailyBoxOffice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovieCd, setSelectedMovieCd] = useState<string | null>(null);
  
  // Theme state with localStorage persistence
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "light"
  );

  // Apply dark class to document element on mount/theme change
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Support retry from sub-component event
  useEffect(() => {
    const handleRetry = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setSelectedMovieCd(customEvent.detail);
      }
    };
    window.addEventListener("retry-movie", handleRetry);
    return () => window.removeEventListener("retry-movie", handleRetry);
  }, []);

  // Fetch box office data
  const fetchBoxOffice = async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const apiDateString = date.replace(/-/g, ""); // "2026-05-28" -> "20260528"
      const url = `/api/boxoffice?date=${apiDateString}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("영진위 오픈 API로부터 데이터를 가져오지 못했습니다.");
      }
      
      const data: BoxOfficeResponse = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.boxOfficeResult?.dailyBoxOfficeList) {
        setMovies(data.boxOfficeResult.dailyBoxOfficeList);
      } else {
        setMovies([]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "서버 혹은 네트워크 통신 도중 에러가 일어났습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxOffice(selectedDate);
  }, [selectedDate]);

  // Toggle theme helper
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Navigating dates (prev day and next day)
  const handlePrevDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - 1);
    setSelectedDate(formatDateToInputString(current));
  };

  const handleNextDay = () => {
    const current = new Date(selectedDate);
    const maximum = getYesterdayDate();
    
    // Prevent selecting today or future dates (today이전만 선택하도록 가드)
    current.setDate(current.getDate() + 1);
    if (current > maximum) return; // Prevent going beyond yesterday
    
    setSelectedDate(formatDateToInputString(current));
  };

  // Check if Next Day navigation should be disabled
  const isNextDayDisabled = () => {
    const current = new Date(selectedDate);
    const maximum = getYesterdayDate();
    current.setDate(current.getDate() + 1);
    return current > maximum;
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
      
      {/* Navigation & Header */}
      <nav className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-indigo-600 p-2 text-white dark:bg-indigo-500 shadow-md shadow-indigo-500/10">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight sm:text-lg">일별 박스오피스</h1>
              <p className="hidden text-3xs font-medium text-zinc-400 dark:text-zinc-500 sm:block">KOBIS Movie Tracker</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="rounded-xl border border-zinc-200 p-2.5 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900 transition-all cursor-pointer"
              title={theme === "light" ? "다크 모드 전환" : "라이트 모드 전환"}
            >
              {theme === "light" ? (
                <Moon className="h-4.5 w-4.5 text-zinc-600" />
              ) : (
                <Sun className="h-4.5 w-4.5 text-amber-400" />
              )}
            </button>
          </div>

        </div>
      </nav>

      {/* Hero & Date Selector Section */}
      <header className="relative overflow-hidden bg-gradient-to-b from-indigo-50/20 via-transparent to-transparent py-10 dark:from-indigo-950/5">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 flex-row py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Sparkles className="h-3 w-3" />
              영화진흥위원회 매일 박스오피스 통계
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl md:text-5xl">
              어떤 영화가 가장 인기있을까요?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
              날짜를 선택하여 일별 영화 흥행 순위를 실시간으로 조회해 보세요. <br />
              궁금한 영화 카드를 클릭하시면 자세한 감독, 주연 등 제작 상세 정보를 보실 수 있습니다.
            </p>
          </motion.div>

          {/* Date Picker Dashboard Component */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-8 max-w-lg rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                <Calendar className="h-4.5 w-4.5 text-indigo-500" />
                <span className="text-sm font-bold">조회 날짜 선택</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                {/* Prev day */}
                <button
                  id="prev-day-btn"
                  onClick={handlePrevDay}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-1.5 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition"
                  title="이전 날짜"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>

                {/* Datepicker input */}
                <input
                  id="boxoffice-datepicker"
                  type="date"
                  value={selectedDate}
                  max={yesterdayStr} // Limits to dates before today
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedDate(e.target.value);
                    }
                  }}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
                />

                {/* Next day */}
                <button
                  id="next-day-btn"
                  onClick={handleNextDay}
                  disabled={isNextDayDisabled()}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-1.5 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition"
                  title="다음 날짜"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Sub-label showing formatted date */}
            <div className="mt-3.5 border-t border-zinc-100 pt-3 dark:border-zinc-800/40 flex items-center justify-between text-2xs text-zinc-400">
              <span>선택 중인 일자:</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-xs">
                {formatDateKorean(selectedDate)}
              </span>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Box Office Gallery Display */}
      <main className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        
        {/* Gallery Title Counter */}
        <div className="mb-6 flex items-baseline justify-between">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            <span>박스오피스 탑 10</span>
          </h3>
          <span className="text-xs font-semibold text-zinc-400 font-mono">
            {formatDateKorean(selectedDate)} 통계
          </span>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="space-y-3.5">
            {[...Array(6)].map((_, idx) => (
              <div 
                key={idx} 
                className="animate-pulse rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-850 dark:bg-zinc-900/20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
              >
                <div className="flex flex-1 items-center gap-4 sm:gap-6">
                  {/* Rank block skeleton */}
                  <div className="h-12 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg shrink-0" />
                  {/* Title and date text column skeleton */}
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                    <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                  </div>
                </div>
                {/* Numeric details row/col skeleton */}
                <div className="flex gap-4 sm:gap-6 shrink-0">
                  <div className="h-8 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                  <div className="h-8 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error Page Panel */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white py-16 px-4 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/20">
            <div className="rounded-full bg-red-50 p-3.5 text-red-500 dark:bg-red-950/20 dark:text-red-400">
              <AlertCircle className="h-6.5 w-6.5" />
            </div>
            <h4 className="mt-4 text-base font-bold text-zinc-900 dark:text-zinc-100">데이터를 불러오는 중 오류 발생</h4>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
              {error}
            </p>
            <button
              onClick={() => fetchBoxOffice(selectedDate)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/15 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              다시 불러오기
            </button>
          </div>
        ) : movies.length === 0 ? (
          /* EMPTY State Panel */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white py-16 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/20">
            <div className="rounded-full bg-zinc-100 p-3.5 text-zinc-400 dark:bg-zinc-850 dark:text-zinc-500">
              <HelpCircle className="h-6 w-6" />
            </div>
            <h4 className="mt-4 text-base font-bold text-zinc-900 dark:text-zinc-100">박스오피스 정보 없음</h4>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {formatDateKorean(selectedDate)}의 박스오피스 데이터가 존재하지 않거나 집계 중입니다.
            </p>
          </div>
        ) : (
          /* Vertical Column container */
          <div className="space-y-3.5">
            {movies.map((movie, index) => (
              <MovieCard
                key={movie.movieCd}
                movie={movie}
                index={index}
                onClick={(movieCd) => setSelectedMovieCd(movieCd)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Detail Overlay Drawer Modal */}
      <MovieDetailModal
        movieCd={selectedMovieCd}
        onClose={() => setSelectedMovieCd(null)}
      />
    </div>
  );
}
