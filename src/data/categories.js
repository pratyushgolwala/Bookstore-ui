/**
 * Curated category list used as a graceful fallback when the
 * categories API is unavailable. The `query` field maps to the
 * books search term so clicking a category surfaces relevant books.
 *
 * Accent colors are drawn from the warm vintage palette
 * (brown / caramel / olive / cream / copper) for a cohesive theme.
 */
export const FALLBACK_CATEGORIES = [
  { id: 'fiction', name: 'Fiction', query: 'fiction', icon: 'BookOpen', description: 'Novels, short stories & literary works', accent: '#995F2F' },
  { id: 'mystery', name: 'Mystery & Thriller', query: 'mystery', icon: 'Search', description: 'Crime, suspense & detective stories', accent: '#622B14' },
  { id: 'science-fiction', name: 'Science Fiction', query: 'science fiction', icon: 'Rocket', description: 'Futuristic & speculative worlds', accent: '#978F66' },
  { id: 'fantasy', name: 'Fantasy', query: 'fantasy', icon: 'Sparkles', description: 'Magic, myth & epic adventures', accent: '#b0764a' },
  { id: 'romance', name: 'Romance', query: 'romance', icon: 'Heart', description: 'Love stories & relationships', accent: '#c2562f' },
  { id: 'history', name: 'History', query: 'history', icon: 'Landmark', description: 'Past events, eras & civilizations', accent: '#622B14' },
  { id: 'biography', name: 'Biography', query: 'biography', icon: 'UserRound', description: 'Lives of remarkable people', accent: '#995F2F' },
  { id: 'science', name: 'Science', query: 'science', icon: 'FlaskConical', description: 'Physics, biology, chemistry & more', accent: '#978F66' },
  { id: 'technology', name: 'Technology', query: 'technology', icon: 'Cpu', description: 'Computing, engineering & innovation', accent: '#6b6444' },
  { id: 'philosophy', name: 'Philosophy', query: 'philosophy', icon: 'Brain', description: 'Ideas, ethics & the human mind', accent: '#978F66' },
  { id: 'poetry', name: 'Poetry', query: 'poetry', icon: 'Feather', description: 'Verse, rhyme & lyrical works', accent: '#c9b984' },
  { id: 'children', name: "Children's", query: 'children', icon: 'Baby', description: 'Picture books & young readers', accent: '#E4D6A9' },
  { id: 'business', name: 'Business', query: 'economics', icon: 'Briefcase', description: 'Economics, finance & management', accent: '#995F2F' },
  { id: 'art', name: 'Art & Design', query: 'art', icon: 'Palette', description: 'Visual arts, architecture & design', accent: '#c2562f' },
  { id: 'cooking', name: 'Cooking', query: 'cooking', icon: 'ChefHat', description: 'Recipes, cuisine & food culture', accent: '#b0764a' },
  { id: 'travel', name: 'Travel', query: 'travel', icon: 'Plane', description: 'Destinations, guides & adventures', accent: '#978F66' },
];

export default FALLBACK_CATEGORIES;
