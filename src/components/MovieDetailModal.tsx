import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Clock, 
  Video, 
  Award, 
  Film, 
  Users, 
  Languages, 
  MapPin, 
  Building, 
  Activity, 
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  MessageSquare
} from "lucide-react";
import { MovieInfo, MovieDetailResponse } from "../types";

interface MovieDetailModalProps {
  movieCd: string | null;
  onClose: () => void;
}

export default function MovieDetailModal({ movieCd, onClose }: MovieDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [movieInfo, setMovieInfo] = useState<MovieInfo | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // AI Review States
  const [kw1, setKw1] = useState("");
  const [kw2, setKw2] = useState("");
  const [kw3, setKw3] = useState("");
  const [reviewResult, setReviewResult] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Reset AI review states on movieCd changes
    setKw1("");
    setKw2("");
    setKw3("");
    setReviewResult("");
    setReviewLoading(false);
    setReviewError(null);
    setCopied(false);

    if (!movieCd) {
      setMovieInfo(null);
      return;
    }

    const fetchMovieDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/movie?movieCd=${movieCd}`);
        if (!response.ok) {
          throw new Error("상세 정보를 가져오는 데 실패했습니다.");
        }
        const data: MovieDetailResponse = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        if (data.movieInfoResult?.movieInfo) {
          setMovieInfo(data.movieInfoResult.movieInfo);
        } else {
          throw new Error("영화 상세 정보가 없습니다.");
        }
      } catch (err: any) {
        console.error("Error fetching detail:", err);
        setError(err.message || "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetail();
  }, [movieCd]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleGenerateReview = async () => {
    if (!movieInfo) return;
    if (!kw1.trim() && !kw2.trim() && !kw3.trim()) {
      setReviewError("최소 하나의 핵심 키워드를 입력해 주세요.");
      return;
    }

    setReviewLoading(true);
    setReviewError(null);
    setReviewResult("");
    setCopied(false);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieNm: movieInfo.movieNm,
          keywords: [kw1, kw2, kw3].filter(k => k.trim() !== ""),
          director: movieInfo.directors?.[0]?.peopleNm,
          actors: movieInfo.actors?.slice(0, 3).map(a => a.peopleNm).join(", "),
          genre: movieInfo.genres?.map(g => g.genreNm).join(", ")
        })
      });

      if (!response.ok) {
        throw new Error("AI 평론 작성을 시작하는 데 실패했습니다.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setReviewResult(data.review || "감상평 결과가 비어 있습니다.");
    } catch (err: any) {
      console.error(err);
      setReviewError(err.message || "평론 생성 중 서버 통신 에러가 발생했습니다.");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!reviewResult) return;
    try {
      await navigator.clipboard.writeText(reviewResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("클립보드 복사 실패:", err);
    }
  };

  if (!movieCd) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
        {/* Backdrop overlay */}
        <motion.div
          id="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
        />

        {/* Modal Window Container */}
        <motion.div
          id="modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.5 }}
          ref={modalRef}
          className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
        >
          {/* Header row */}
          <div className="flex items-center justify-between border-b border-zinc-100 p-5 dark:border-zinc-800/80">
            <div className="flex items-center gap-2 text-indigo-500">
              <Film className="h-5 w-5" />
              <span className="text-xs font-bold tracking-wider uppercase font-mono">영화 상세정보</span>
            </div>
            <button
              id="close-modal-btn"
              onClick={onClose}
              className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal body scrollable content */}
          <div className="max-h-[75vh] overflow-y-auto p-6 md:p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" />
                <p className="mt-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">영진위 API에서 상세 정보를 불러오는 중입니다...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-red-50 p-3 text-red-500 dark:bg-red-950/20 dark:text-red-400">
                  <Activity className="h-6 w-6" />
                </div>
                <h4 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">조회 실패</h4>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-md">{error}</p>
                <button
                  onClick={() => {
                    // Retry fetch
                    const cd = movieCd;
                    onClose();
                    setTimeout(() => window.dispatchEvent(new CustomEvent("retry-movie", { detail: cd })), 10);
                  }}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-4 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition"
                >
                  <RotateCcw className="h-4.5 w-4.5" />
                  다시 시도
                </button>
              </div>
            ) : movieInfo ? (
              <div className="space-y-8 animate-fade-in">
                {/* Titles and Basics */}
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 leading-tight">
                    {movieInfo.movieNm}
                  </h2>
                  {movieInfo.movieNmEn && (
                    <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500 font-mono italic">
                      {movieInfo.movieNmEn}
                    </p>
                  )}

                  {/* Highlights Bar */}
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {movieInfo.genres.map((g, i) => (
                      <span key={i} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {g.genreNm}
                      </span>
                    ))}
                    {movieInfo.showTm && (
                      <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/85 px-3 py-1 rounded-full">
                        <Clock className="h-3.5 w-3.5 text-zinc-400" />
                        {movieInfo.showTm}분
                      </span>
                    )}
                    {movieInfo.audits?.[0]?.watchGradeNm && (
                      <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/85 px-3 py-1 rounded-full font-semibold">
                        <Award className="h-3.5 w-3.5 text-zinc-400" />
                        {movieInfo.audits[0].watchGradeNm}
                      </span>
                    )}
                  </div>
                </div>

                {/* AI Review Generator Section */}
                <div className="rounded-2xl border border-indigo-100/50 bg-indigo-50/5 p-5 dark:border-indigo-950/20 dark:bg-indigo-950/5">
                  <div className="flex items-center gap-2 text-indigo-650 dark:text-indigo-400 mb-3">
                    <Sparkles className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
                    <span className="text-sm font-bold tracking-tight">✨ AI 감상평 평론기</span>
                  </div>
                  
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3.5 leading-relaxed">
                    세 개의 핵심 키워드를 입력해 보세요! 영화의 세부 맥락과 입력된 단어들을 정교한 흐름으로 조합하여 Gemini가 깊이 있는 통찰이 담긴 평론을 지어 드립니다.
                  </p>

                  {/* 3 Side-by-Side Inputs */}
                  <div className="grid grid-cols-3 gap-2.5 mb-3.5">
                    <div>
                      <input
                        id="kw1"
                        type="text"
                        value={kw1}
                        onChange={(e) => setKw1(e.target.value)}
                        placeholder="키워드 1 (예: 전율)"
                        className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
                      />
                    </div>
                    <div>
                      <input
                        id="kw2"
                        type="text"
                        value={kw2}
                        onChange={(e) => setKw2(e.target.value)}
                        placeholder="키워드 2 (예: 눈부신 영상미)"
                        className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
                      />
                    </div>
                    <div>
                      <input
                        id="kw3"
                        type="text"
                        value={kw3}
                        onChange={(e) => setKw3(e.target.value)}
                        placeholder="키워드 3 (예: 여운)"
                        className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
                      />
                    </div>
                  </div>

                  {/* Button + Error Row */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      {reviewError && (
                        <p className="text-2xs font-semibold text-rose-550 dark:text-rose-400">
                          {reviewError}
                        </p>
                      )}
                    </div>
                    <button
                      id="generate-review-btn"
                      onClick={handleGenerateReview}
                      disabled={reviewLoading}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-2xs font-bold text-white cursor-pointer transition"
                    >
                      {reviewLoading ? (
                        <>
                          <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                          <span>AI 평론 작성 중...</span>
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>감상평 쓰기</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* AI Generated Review Showcase */}
                  <AnimatePresence>
                    {reviewResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/30 p-4 dark:border-indigo-900/30 dark:bg-indigo-950/20 relative"
                      >
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed pr-8">
                          "{reviewResult}"
                        </p>
                        
                        <button
                          id="copy-review-btn"
                          onClick={handleCopyToClipboard}
                          className="absolute right-3.5 top-3.5 rounded-md p-1 text-zinc-400 hover:bg-zinc-200 dark:text-zinc-500 dark:hover:bg-zinc-800 transition"
                          title="감상평 클립보드 복사"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200" />
                          )}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Main Details Grid */}
                <div className="grid gap-6 border-t border-zinc-100 pt-6 sm:grid-cols-2 dark:border-zinc-800/80">
                  {/* Production specifications */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">기본 제작 정보</h3>
                    
                    <div className="space-y-3">
                      <div className="flex gap-3 text-sm">
                        <Video className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="block font-medium text-zinc-500 dark:text-zinc-400 text-2xs uppercase tracking-wider">영화 유형</span>
                          <span className="text-zinc-800 dark:text-zinc-200">{movieInfo.typeNm || "정보 없음"}</span>
                        </div>
                      </div>

                      <div className="flex gap-3 text-sm">
                        <MapPin className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="block font-medium text-zinc-500 dark:text-zinc-400 text-2xs uppercase tracking-wider">제작 국가</span>
                          <span className="text-zinc-800 dark:text-zinc-200">
                            {movieInfo.nations.map(n => n.nationNm).join(", ") || "정보 없음"}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-3 text-sm">
                        <Languages className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="block font-medium text-zinc-500 dark:text-zinc-400 text-2xs uppercase tracking-wider">개봉일</span>
                          <span className="text-zinc-800 dark:text-zinc-200">
                            {movieInfo.openDt ? `${movieInfo.openDt.substring(0,4)}-${movieInfo.openDt.substring(4,6)}-${movieInfo.openDt.substring(6,8)}` : "정보 없음"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Production Companies */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">참여 회사</h3>
                    <div className="space-y-3">
                      {movieInfo.companys && movieInfo.companys.length > 0 ? (
                        <div className="flex gap-3 text-sm">
                          <Building className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0 mt-0.5" />
                          <div className="space-y-2">
                            {movieInfo.companys.slice(0, 3).map((comp, idx) => (
                              <div key={idx} className="leading-tight">
                                <span className="text-zinc-800 dark:text-zinc-200 font-medium block">{comp.companyNm}</span>
                                <span className="text-2xs text-indigo-500 dark:text-indigo-400 uppercase font-semibold font-mono tracking-wider">{comp.companyPartNm}</span>
                              </div>
                            ))}
                            {movieInfo.companys.length > 3 && (
                              <span className="text-xs text-zinc-400">외 {movieInfo.companys.length - 3}개 사</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-500">등록된 참여 회사 정보가 없습니다.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Directors Section */}
                <div className="border-t border-zinc-100 pt-6 dark:border-zinc-800/80">
                  <h3 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono mb-4">감독</h3>
                  {movieInfo.directors && movieInfo.directors.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {movieInfo.directors.map((dir, idx) => (
                        <div key={idx} className="rounded-xl bg-zinc-50 p-4 border border-zinc-100 dark:bg-zinc-800/30 dark:border-zinc-800/60">
                          <span className="block font-bold text-zinc-800 dark:text-zinc-200 text-sm">{dir.peopleNm}</span>
                          {dir.peopleNmEn && (
                            <span className="block text-2xs text-zinc-400 font-mono mt-0.5">{dir.peopleNmEn}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">등록된 감독 정보가 없습니다.</p>
                  )}
                </div>

                {/* Cast / Actors Section */}
                <div className="border-t border-zinc-100 pt-6 dark:border-zinc-800/80">
                  <h3 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono mb-4">출연 배우</h3>
                  {movieInfo.actors && movieInfo.actors.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 max-h-60 overflow-y-auto pr-1">
                      {movieInfo.actors.map((actor, idx) => (
                        <div key={idx} className="rounded-xl border border-zinc-100/80 bg-zinc-50/50 p-4 dark:border-zinc-800/50 dark:bg-zinc-800/10">
                          <span className="block font-bold text-zinc-800 dark:text-zinc-200 text-sm">{actor.peopleNm}</span>
                          {actor.cast && (
                            <span className="block text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-semibold">
                              역: {actor.cast}
                            </span>
                          )}
                          {actor.peopleNmEn && (
                            <span className="block text-3xs text-zinc-400 font-mono mt-0.5">{actor.peopleNmEn}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">배우 정보가 제공되지 않거나 조연 정보만 포함되어 있습니다.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
