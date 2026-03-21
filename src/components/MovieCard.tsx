import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Star, Calendar, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Movie, getImageUrl } from '../services/movieService';

interface MovieCardProps {
  movie: Movie;
  onViewDetails: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onViewDetails }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion values for parallax effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring physics for the parallax
  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 30 });

  // Map mouse position to rotation
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ 
        scale: 1.05, 
        y: -12,
        boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.25)",
        borderColor: "rgba(99, 102, 241, 0.4)"
      }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        mass: 0.8
      }}
      onClick={() => onViewDetails(movie)}
      className="group relative bg-white/10 dark:bg-white/5 backdrop-blur-xl overflow-hidden border border-white/20 dark:border-white/10 rounded-3xl flex flex-col h-full cursor-pointer shadow-2xl hover:shadow-indigo-500/20"
    >
      <div className="aspect-[3/4] overflow-hidden relative">
        <motion.img
          src={getImageUrl(movie.poster_path)}
          alt={movie.title}
          transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-300"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold bg-white/20 dark:bg-black/20 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/30 dark:border-white/10">
            <Star className="w-3.5 h-3.5 fill-current" />
            {movie.vote_average.toFixed(1)}
          </div>
        </div>
      </div>
      
      <div className="p-5 sm:p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-2">
          <Calendar className="w-3 h-3" />
          {movie.release_date?.split('-')[0] || 'N/A'}
          <span className="mx-1">•</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {Math.round(movie.vote_average * 10)}% Match
          </div>
        </div>
        
        <h3 className="text-lg sm:text-xl font-serif italic text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {movie.title}
        </h3>
        
        <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed line-clamp-3">
          {movie.overview}
        </p>
      </div>
    </motion.div>
  );
};
