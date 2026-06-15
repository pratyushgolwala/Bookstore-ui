/**
 * Curated category list used as a graceful fallback when the
 * categories API is unavailable. The `query` field maps to the
 * books search term so clicking a category surfaces relevant books.
 */
export const FALLBACK_CATEGORIES = [
  { id: 'fiction', name: 'Fiction', query: 'fiction', icon: 'BookOpen', description: 'Novels, short stories & literary works', accent: '#5c5c8f' },
  { id: 'mystery', name: 'Mystery & Thriller', query: 'mystery', icon: 'Search', description: 'Crime, suspense & detective stories', accent: '#4a4a7a' },
  { id: 'science-fiction', name: 'Science Fiction', query: 'science fiction', icon: 'Rocket', description: 'Futuristic & speculative worlds', accent: '#5c8f8f' },
  { id: 'fantasy', name: 'Fantasy', query: 'fantasy', icon: 'Sparkles', description: 'Magic, myth & epic adventures', accent: '#875c1f' },
  { id: 'romance', name: 'Romance', query: 'romance', icon: 'Heart', description: 'Love stories & relationships', accent: '#d48080' },
  { id: 'history', name: 'History', query: 'history', icon: 'Landmark', description: 'Past events, eras & civilizations', accent: '#b47a29' },
  { id: 'biography', name: 'Biography', query: 'biography', icon: 'UserRound', description: 'Lives of remarkable people', accent: '#6d6d9d' },
  { id: 'science', name: 'Science', query: 'science', icon: 'FlaskConical', description: 'Physics, biology, chemistry & more', accent: '#5c8f8f' },
  { id: 'technology', name: 'Technology', query: 'technology', icon: 'Cpu', description: 'Computing, engineering & innovation', accent: '#4a4a7a' },
  { id: 'philosophy', name: 'Philosophy', query: 'philosophy', icon: 'Brain', description: 'Ideas, ethics & the human mind', accent: '#7e7eab' },
  { id: 'poetry', name: 'Poetry', query: 'poetry', icon: 'Feather', description: 'Verse, rhyme & lyrical works', accent: '#d4933e' },
  { id: 'children', name: "Children's", query: 'children', icon: 'Baby', description: 'Picture books & young readers', accent: '#e6a657' },
  { id: 'business', name: 'Business', query: 'economics', icon: 'Briefcase', description: 'Economics, finance & management', accent: '#5c5c8f' },
  { id: 'art', name: 'Art & Design', query: 'art', icon: 'Palette', description: 'Visual arts, architecture & design', accent: '#d48080' },
  { id: 'cooking', name: 'Cooking', query: 'cooking', icon: 'ChefHat', description: 'Recipes, cuisine & food culture', accent: '#b47a29' },
  { id: 'travel', name: 'Travel', query: 'travel', icon: 'Plane', description: 'Destinations, guides & adventures', accent: '#5c8f8f' },
];

export default FALLBACK_CATEGORIES;
