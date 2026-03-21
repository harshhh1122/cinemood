const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  cast?: CastMember[];
}

export const MOOD_GENRES: Record<string, number[]> = {
  'Happy': [35, 10751], // Comedy, Family
  'Adventurous': [12, 28], // Adventure, Action
  'Thoughtful': [99, 18, 9648], // Documentary, Drama, Mystery
  'Scared': [27, 53], // Horror, Thriller
  'Excited': [28, 878], // Action, Sci-Fi
  'Romantic': [10749], // Romance
};

export async function fetchTrendingMovies(): Promise<Movie[]> {
  if (!TMDB_API_KEY) return [];
  const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
  const data = await response.json();
  return data.results || [];
}

export async function fetchMoviesByMood(mood: string): Promise<Movie[]> {
  if (!TMDB_API_KEY) return [];
  const genres = MOOD_GENRES[mood] || [];
  const genreString = genres.join(',');
  const response = await fetch(
    `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreString}&sort_by=popularity.desc`
  );
  const data = await response.json();
  return data.results || [];
}

export async function fetchTopRatedMovies(): Promise<Movie[]> {
  if (!TMDB_API_KEY) return [];
  const response = await fetch(`${BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}`);
  const data = await response.json();
  return data.results || [];
}

export async function fetchNewMovies(): Promise<Movie[]> {
  if (!TMDB_API_KEY) return [];
  const response = await fetch(`${BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}`);
  const data = await response.json();
  return data.results || [];
}

export async function searchMovies(query: string): Promise<Movie[]> {
  if (!TMDB_API_KEY) return [];
  const response = await fetch(
    `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
  );
  const data = await response.json();
  return data.results || [];
}

export async function fetchMovieCredits(movieId: number): Promise<CastMember[]> {
  if (!TMDB_API_KEY) return [];
  const response = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`);
  const data = await response.json();
  return data.cast?.slice(0, 10) || []; // Get top 10 cast members
}

export function getImageUrl(path: string | null): string {
  if (!path) return 'https://picsum.photos/seed/movie/500/750';
  return `${IMAGE_BASE_URL}${path}`;
}
