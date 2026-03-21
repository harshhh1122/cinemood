import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Search, Clapperboard, Sparkles, TrendingUp, AlertCircle, Moon, Sun, Menu, X as CloseIcon, Star, Calendar, Clock, Globe, Info, Film, MousePointer2, Loader2 } from 'lucide-react';
import { Movie, fetchTrendingMovies, fetchMoviesByMood, searchMovies, MOOD_GENRES, getImageUrl, fetchMovieCredits, CastMember, fetchTopRatedMovies, fetchNewMovies } from './services/movieService';
import { identifyMovieFromDescription } from './services/geminiService';
import { MovieCard } from './components/MovieCard';
import { Chatbot } from './components/Chatbot';
import Spline from '@splinetool/react-spline';

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMagicSearchOpen, setIsMagicSearchOpen] = useState(false);
  const [magicQuery, setMagicQuery] = useState('');
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [magicResult, setMagicResult] = useState<{ movieName: string | null; explanation: string } | null>(null);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const loadMovies = async (type: 'trending' | 'mood' | 'search' | 'top_rated' | 'new', param?: string) => {
    setLoading(true);
    setError(null);
    try {
      let results: Movie[] = [];
      if (type === 'trending') {
        results = await fetchTrendingMovies();
      } else if (type === 'top_rated') {
        results = await fetchTopRatedMovies();
      } else if (type === 'new') {
        results = await fetchNewMovies();
      } else if (type === 'mood' && param) {
        results = await fetchMoviesByMood(param);
      } else if (type === 'search' && param) {
        results = await searchMovies(param);
      }
      
      if (results.length === 0 && !import.meta.env.VITE_TMDB_API_KEY) {
        setError("Please add your VITE_TMDB_API_KEY to the environment variables to see real movies.");
      }
      setMovies(results);
    } catch (err) {
      setError("Failed to fetch movies. Please check your connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies('trending');

    const handleOpenMagic = () => setIsMagicSearchOpen(true);
    window.addEventListener('open-magic-search', handleOpenMagic);
    return () => window.removeEventListener('open-magic-search', handleOpenMagic);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveMood(null);
      setIsMobileMenuOpen(false);
      loadMovies('search', searchQuery);
    }
  };

  const handleMoodClick = (mood: string) => {
    if (activeMood === mood) {
      setActiveMood(null);
      loadMovies('trending');
    } else {
      setActiveMood(mood);
      loadMovies('mood', mood);
    }
  };

  const handleViewDetails = async (movie: Movie) => {
    setSelectedMovie(movie);
    try {
      const cast = await fetchMovieCredits(movie.id);
      setSelectedMovie(prev => prev && prev.id === movie.id ? { ...prev, cast } : prev);
    } catch (err) {
      console.error("Failed to fetch cast:", err);
    }
  };

  const handleMagicSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicQuery.trim()) return;
    
    setIsMagicLoading(true);
    try {
      const result = await identifyMovieFromDescription(magicQuery);
      setMagicResult(result);
      if (result.movieName) {
        // Automatically search for the identified movie
        setSearchQuery(result.movieName);
        loadMovies('search', result.movieName);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMagicLoading(false);
    }
  };

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-500 overflow-y-auto h-screen scroll-smooth"
    >
      {/* Interactive Background */}
      <div className="fixed inset-0 z-0 pointer-events-auto opacity-80 dark:opacity-60 transition-all duration-1000 dark:invert-0 invert">
        <Suspense fallback={<div className="w-full h-full bg-zinc-950" />}>
          <Spline 
            scene="https://prod.spline.design/sLTac1l8a799vi4H/scene.splinecode" 
            className="w-full h-full"
          />
        </Suspense>
      </div>

      <div className="grain" />
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 pt-4 px-4 sm:px-6 pointer-events-none">
        <div className="max-w-7xl mx-auto h-16 sm:h-20 bg-white/10 dark:bg-white/5 backdrop-blur-3xl border border-white/40 dark:border-white/10 rounded-full flex items-center justify-between gap-4 px-6 sm:px-10 shadow-[inset_0_2px_10px_rgba(255,255,255,0.4),0_25px_50px_-12px_rgba(0,0,0,0.3)] pointer-events-auto transition-all duration-500">
          <div className="flex items-center gap-3 cursor-pointer shrink-0 group" onClick={() => window.location.reload()}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 rounded-full group-hover:rotate-12 transition-transform">
              <Clapperboard className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tighter uppercase font-parkinsans text-zinc-900 dark:text-white">CineMood</h1>
          </div>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-grow max-w-md mx-4 lg:mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies..."
                className="w-full py-2.5 pl-12 pr-12 bg-zinc-900/5 dark:bg-white/5 border-2 border-zinc-900/10 dark:border-white/10 text-sm focus:outline-none focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/10 transition-all text-zinc-900 dark:text-white rounded-full placeholder:text-zinc-500"
              />
              <button
                type="button"
                onClick={() => setIsMagicSearchOpen(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 rounded-full transition-colors group/magic"
                title="Magic Search (Describe a movie)"
              >
                <Sparkles className="w-4 h-4 group-hover/magic:scale-110 transition-transform" />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="relative w-14 h-8 bg-zinc-900/5 dark:bg-white/5 border-2 border-zinc-900/10 dark:border-white/10 cursor-pointer p-1 transition-all rounded-full hover:scale-105 active:scale-95"
              aria-label="Toggle theme"
            >
              <motion.div
                animate={{ x: isDarkMode ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-5 h-5 bg-zinc-900 dark:bg-white flex items-center justify-center rounded-full shadow-sm"
              >
                {isDarkMode ? <Moon className="w-3 h-3 text-white dark:text-zinc-900" /> : <Sun className="w-3 h-3 text-white dark:text-zinc-900" />}
              </motion.div>
            </button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMagicSearchOpen(true)}
              className="md:hidden p-2.5 bg-indigo-600/10 border-2 border-indigo-600/20 rounded-full text-indigo-600 dark:text-indigo-400"
              title="Magic Search"
            >
              <Sparkles className="w-5 h-5" />
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 bg-zinc-900/5 dark:bg-white/5 border-2 border-zinc-900/10 dark:border-white/10 rounded-full transition-all text-zinc-900 dark:text-white"
            >
              {isMobileMenuOpen ? <CloseIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-start text-center scroll-mt-0 relative overflow-hidden pt-32 sm:pt-48">
          {/* Background Decorative Elements */}
          <motion.div 
            className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-indigo-200/30 dark:border-indigo-800/20 rotate-12" 
          />
          <motion.div 
            style={{ rotate: -12 }}
            className="absolute bottom-1/4 right-1/4 w-48 h-48 border-2 border-zinc-200/30 dark:border-zinc-800/20" 
          />
          <motion.div 
            style={{ rotate: 45 }}
            className="absolute top-1/3 right-1/3 w-16 h-16 bg-indigo-100/10 dark:bg-indigo-900/5" 
          />

          <motion.div
            style={{ opacity: heroOpacity }}
            className="space-y-6 pt-10 relative z-10"
          >
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
              className="text-4xl sm:text-7xl font-parkinsans font-bold tracking-tighter mb-4 leading-[0.9] uppercase text-black dark:text-white drop-shadow-sm"
            >
              Find the film <br className="hidden sm:block" />
              for your <span className="text-indigo-600 dark:text-indigo-400">mood.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.2 }}
              className="text-sm sm:text-lg text-zinc-800 dark:text-zinc-300 max-w-xl mx-auto leading-relaxed font-bold dark:font-medium drop-shadow-sm"
            >
              A minimal movie browser designed for focus. <br className="hidden sm:block" />
              Spacious, confident, and powered by Gemini AI.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="pt-12"
            >
              <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-800 mx-auto" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mt-4">Scroll to explore</p>
            </motion.div>
          </motion.div>
        </section>

        {/* Browser & Movie Grid Section */}
        <section className="py-20 min-h-screen scroll-mt-0">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            {['All', 'Trending', 'New', 'Top Rated'].map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveMood(null);
                  setSearchQuery('');
                  if (cat === 'All' || cat === 'Trending') loadMovies('trending');
                  if (cat === 'New') loadMovies('new');
                  if (cat === 'Top Rated') loadMovies('top_rated');
                }}
                className={`px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] rounded-full border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 ${
                  ((cat === 'Trending' || cat === 'All') && !activeMood && !searchQuery) || 
                  (cat === 'New' && movies.length > 0 && !activeMood && !searchQuery) ||
                  (cat === 'Top Rated' && movies.length > 0 && !activeMood && !searchQuery)
                    ? 'ring-2 ring-indigo-500/50 border-indigo-500/50'
                    : ''
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>

          {/* Mood Selector */}
          <div className="mb-24">
            <div className="flex items-center gap-3 mb-8 justify-center">
              <div className="w-12 h-12 bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center rounded-full border border-indigo-600/20 backdrop-blur-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight uppercase font-parkinsans">How are you feeling?</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {Object.keys(MOOD_GENRES).map((mood) => (
                <motion.button
                  key={mood}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleMoodClick(mood)}
                  className={`py-10 px-4 text-sm font-bold uppercase tracking-[0.15em] transition-all duration-300 rounded-[2.5rem] border backdrop-blur-3xl shadow-[inset_0_2px_6px_rgba(255,255,255,0.6),inset_0_-2px_6px_rgba(0,0,0,0.05),0_15px_35px_-10px_rgba(0,0,0,0.15)] hover:shadow-[inset_0_4px_12px_rgba(255,255,255,0.8),0_25px_50px_-12px_rgba(0,0,0,0.25)] ${
                    activeMood === mood
                      ? 'bg-indigo-600/60 text-white border-indigo-400/50 shadow-indigo-500/40'
                      : 'bg-white/10 dark:bg-white/5 text-zinc-900 dark:text-white border-white/50 dark:border-white/20 hover:border-indigo-500/50'
                  }`}
                >
                  {mood}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Movie Grid Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-4 border-b border-zinc-900/10 dark:border-white/10 pb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-zinc-900/5 dark:bg-white/5 flex items-center justify-center text-zinc-900 dark:text-zinc-100 rounded-2xl border border-zinc-900/10 dark:border-white/10 backdrop-blur-sm">
                {activeMood ? <Sparkles className="w-7 h-7" /> : <TrendingUp className="w-7 h-7" />}
              </div>
              <h3 className="text-3xl sm:text-5xl font-bold tracking-tighter uppercase font-parkinsans">
                {activeMood ? `${activeMood}` : searchQuery ? `Search` : 'Trending'}
              </h3>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 dark:text-zinc-400 text-sm font-bold uppercase tracking-widest">{movies.length} FILMS</span>
            </div>
          </div>

          {error && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-8 flex items-start gap-6 mb-12">
              <AlertCircle className="w-8 h-8 text-amber-600 shrink-0 mt-1" />
              <div>
                <h4 className="text-xl font-bold text-amber-900 dark:text-amber-200 mb-2">API Key Required</h4>
                <p className="text-lg text-amber-800 dark:text-amber-300 leading-relaxed">
                  {error} To get an API key, visit <a href="https://www.themoviedb.org/settings/api" target="_blank" className="underline font-bold">TMDB</a>.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="bg-zinc-200 dark:bg-zinc-800 animate-pulse aspect-[2/3]" />
                ))
              ) : (
                movies.map((movie) => (
                  <MovieCard 
                    key={movie.id} 
                    movie={movie} 
                    onViewDetails={handleViewDetails}
                  />
                ))
              )}
            </AnimatePresence>
          </div>

          {!loading && movies.length === 0 && !error && (
            <div className="text-center py-32">
              <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-8 text-zinc-400">
                <Film className="w-12 h-12" />
              </div>
              <h4 className="text-2xl sm:text-3xl font-bold text-zinc-400">No movies found</h4>
              <p className="text-xl text-zinc-400 mt-4">Try a different search or mood.</p>
            </div>
          )}
        </section>
      </main>

      {/* Magic Search Modal */}
      <AnimatePresence>
        {isMagicSearchOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMagicSearchOpen(false)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white/10 dark:bg-white/5 backdrop-blur-3xl border border-white/40 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 sm:p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center rounded-2xl border border-indigo-600/30">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold font-parkinsans uppercase tracking-tighter">Magic Search</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-bold uppercase tracking-widest">Identify by dialogue or song</p>
                  </div>
                  <button 
                    onClick={() => setIsMagicSearchOpen(false)}
                    className="ml-auto p-3 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <CloseIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleMagicSearch} className="space-y-6">
                  <div className="relative">
                    <textarea
                      value={magicQuery}
                      onChange={(e) => setMagicQuery(e.target.value)}
                      placeholder="e.g. 'I'm gonna make him an offer he can't refuse' or 'The movie where they dance on top of cars in a traffic jam'"
                      className="w-full h-40 p-6 bg-white/10 dark:bg-black/20 border-2 border-white/20 dark:border-white/10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-lg resize-none placeholder:text-zinc-500"
                    />
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isMagicLoading || !magicQuery.trim()}
                    className="w-full py-5 bg-indigo-600 text-white font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/30 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isMagicLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Identify Movie
                      </>
                    )}
                  </motion.button>
                </form>

                {magicResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 bg-indigo-600/10 border border-indigo-600/20 rounded-2xl"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-indigo-600 text-white flex items-center justify-center rounded-xl shrink-0">
                        <Film className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                          {magicResult.movieName || "I'm not sure..."}
                        </h4>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {magicResult.explanation}
                        </p>
                        {magicResult.movieName && (
                          <button
                            onClick={() => setIsMagicSearchOpen(false)}
                            className="mt-4 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            View Results Below →
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Movie Details Modal */}
      <AnimatePresence>
        {selectedMovie && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMovie(null)}
              className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40, rotateX: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40, rotateX: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-4xl bg-white/10 dark:bg-white/5 backdrop-blur-3xl overflow-hidden border border-white/40 dark:border-white/10 flex flex-col md:flex-row max-h-[85vh] rounded-[3rem] shadow-[inset_0_2px_10px_rgba(255,255,255,0.4),0_25px_50px_-12px_rgba(0,0,0,0.5)]"
            >
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedMovie(null)}
                className="absolute top-6 right-6 z-10 p-3 bg-white/20 dark:bg-black/20 hover:bg-white/40 dark:hover:bg-black/40 backdrop-blur-2xl text-white rounded-full border border-white/40 dark:border-white/10 transition-all shadow-xl"
              >
                <CloseIcon className="w-6 h-6" />
              </motion.button>

              <div className="w-full md:w-2/5 aspect-[2/3] md:aspect-auto">
                <img
                  src={getImageUrl(selectedMovie.poster_path)}
                  alt={selectedMovie.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="w-full md:w-3/5 p-6 sm:p-8 overflow-y-auto">
                <div className="flex items-center gap-3 text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                  <Calendar className="w-3 h-3" />
                  {selectedMovie.release_date}
                  <span className="mx-1">•</span>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3 h-3 fill-current" />
                    {selectedMovie.vote_average.toFixed(1)}
                  </div>
                </div>

                <h2 className="text-2xl sm:text-4xl font-serif italic text-zinc-900 dark:text-zinc-100 mb-4 leading-tight">
                  {selectedMovie.title}
                </h2>

                <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">
                  {selectedMovie.overview}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-zinc-400 text-[9px] uppercase tracking-widest font-bold">
                      <TrendingUp className="w-3 h-3" />
                      Popularity
                    </div>
                    <div className="text-base font-bold">{Math.round(selectedMovie.vote_average * 10)}% Match</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-zinc-400 text-[9px] uppercase tracking-widest font-bold">
                      <Globe className="w-3 h-3" />
                      Language
                    </div>
                    <div className="text-base font-bold">English</div>
                  </div>
                </div>

                {selectedMovie.cast && selectedMovie.cast.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Top Cast</h4>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {selectedMovie.cast.map((member) => (
                        <div key={member.id} className="flex-shrink-0 w-20 text-center">
                          <div className="w-20 h-20 rounded-full overflow-hidden mb-2 border-2 border-zinc-100 dark:border-zinc-800">
                            <img
                              src={getImageUrl(member.profile_path)}
                              alt={member.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <p className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">{member.name}</p>
                          <p className="text-[9px] text-zinc-500 dark:text-zinc-400 line-clamp-1 italic">{member.character}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMovie(null)}
                  className="w-full py-5 bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold uppercase tracking-[0.2em] text-xs rounded-2xl border border-indigo-400/50 backdrop-blur-xl transition-all shadow-[0_10px_20px_-5px_rgba(79,70,229,0.4)]"
                >
                  Close Details
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="px-4 sm:px-6 pb-8 mt-32">
        <div className="max-w-7xl mx-auto bg-white/10 dark:bg-white/5 backdrop-blur-3xl border border-white/40 dark:border-white/10 rounded-[4rem] p-12 sm:p-20 shadow-[inset_0_2px_10px_rgba(255,255,255,0.4),0_25px_50px_-12px_rgba(0,0,0,0.3)]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 rounded-2xl">
                  <Film className="w-6 h-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter uppercase font-parkinsans">CineMood</h1>
              </div>
              <p className="text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md font-medium">
                A minimal movie browser designed for focus. Spacious, confident, and powered by Gemini AI.
              </p>
            </div>
            <div>
              <h5 className="text-xs font-bold mb-8 uppercase tracking-[0.3em] text-zinc-400">Platform</h5>
              <ul className="space-y-4 text-base font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Browse</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Trending</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Moods</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-bold mb-8 uppercase tracking-[0.3em] text-zinc-400">Company</h5>
              <ul className="space-y-4 text-base font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-24 pt-12 border-t border-zinc-900/10 dark:border-white/10 text-center text-zinc-400 text-sm font-bold uppercase tracking-widest">
            © 2026 CineMood. All rights reserved.
          </div>
        </div>
      </footer>

      <Chatbot mousePosition={mousePosition} />
    </div>
  );
}
