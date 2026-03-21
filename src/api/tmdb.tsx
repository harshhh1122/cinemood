import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// 🔥 Image helper
export const getImageUrl = (path: string | null) => {
  if (!path) return "https://via.placeholder.com/500x750?text=No+Image";
  return `https://image.tmdb.org/t/p/w500${path}`;
};

// 🎬 Types
export type CastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
};

export type Movie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  cast?: CastMember[];
};

// 🎭 Mood → Genre mapping
export const MOOD_GENRES: Record<string, number[]> = {
  Happy: [35, 10751],
  Sad: [18],
  Excited: [28, 12],
  Romantic: [10749],
  Scary: [27],
  Chill: [16, 14],
};

// 🔥 Trending movies
export const fetchTrendingMovies = async (): Promise<Movie[]> => {
  const res = await axios.get(
    `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`
  );
  return res.data.results;
};

// 🔍 Search movies
export const searchMovies = async (query: string): Promise<Movie[]> => {
  const res = await axios.get(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`
  );
  return res.data.results;
};

// 🎭 Movies by mood (genre)
export const fetchMoviesByMood = async (mood: string): Promise<Movie[]> => {
  const genres = MOOD_GENRES[mood];
  if (!genres) return [];

  const res = await axios.get(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genres.join(
      ","
    )}`
  );

  return res.data.results;
};

// 🎭 Fetch cast
export const fetchMovieCredits = async (
  movieId: number
): Promise<CastMember[]> => {
  const res = await axios.get(
    `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`
  );

  return res.data.cast.slice(0, 6); // top 6 cast
};