/**
 * Mock data store for the Interactive Bookshelf feature.
 * Contains 25 book objects across 5 categories.
 * Used until Django backend integration is complete.
 *
 * @typedef {Object} Book
 * @property {string} id           - Unique identifier
 * @property {string} title        - Book title
 * @property {string} author       - Author full name
 * @property {number} price        - Price in INR
 * @property {string} coverImageUrl - Placeholder cover image URL
 * @property {string} category     - Category name
 * @property {number} pageCount    - Number of pages (used for spine thickness)
 */

export const BOOK_CATEGORIES = [
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Non-Fiction',
  'Classic Literature',
];

export const MOCK_BOOKS = [
  // Science Fiction (5 books)
  {
    id: 'b1',
    title: 'Dune',
    author: 'Frank Herbert',
    price: 14.99,
    coverImageUrl: 'https://picsum.photos/seed/dune/200/300',
    category: 'Science Fiction',
    pageCount: 412,
  },
  {
    id: 'b2',
    title: 'Neuromancer',
    author: 'William Gibson',
    price: 11.99,
    coverImageUrl: 'https://picsum.photos/seed/neuromancer/200/300',
    category: 'Science Fiction',
    pageCount: 271,
  },
  {
    id: 'b3',
    title: 'Foundation',
    author: 'Isaac Asimov',
    price: 12.99,
    coverImageUrl: 'https://picsum.photos/seed/foundation/200/300',
    category: 'Science Fiction',
    pageCount: 244,
  },
  {
    id: 'b4',
    title: 'The Left Hand of Darkness',
    author: 'Ursula K. Le Guin',
    price: 13.99,
    coverImageUrl: 'https://picsum.photos/seed/the-left-hand-of-darkness/200/300',
    category: 'Science Fiction',
    pageCount: 304,
  },
  {
    id: 'b5',
    title: 'Snow Crash',
    author: 'Neal Stephenson',
    price: 15.99,
    coverImageUrl: 'https://picsum.photos/seed/snow-crash/200/300',
    category: 'Science Fiction',
    pageCount: 480,
  },

  // Fantasy (5 books)
  {
    id: 'b6',
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    price: 16.99,
    coverImageUrl: 'https://picsum.photos/seed/the-name-of-the-wind/200/300',
    category: 'Fantasy',
    pageCount: 662,
  },
  {
    id: 'b7',
    title: 'A Wizard of Earthsea',
    author: 'Ursula K. Le Guin',
    price: 10.99,
    coverImageUrl: 'https://picsum.photos/seed/a-wizard-of-earthsea/200/300',
    category: 'Fantasy',
    pageCount: 183,
  },
  {
    id: 'b8',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    price: 12.99,
    coverImageUrl: 'https://picsum.photos/seed/the-hobbit/200/300',
    category: 'Fantasy',
    pageCount: 310,
  },
  {
    id: 'b9',
    title: 'The Way of Kings',
    author: 'Brandon Sanderson',
    price: 19.99,
    coverImageUrl: 'https://picsum.photos/seed/the-way-of-kings/200/300',
    category: 'Fantasy',
    pageCount: 1007,
  },
  {
    id: 'b10',
    title: 'Good Omens',
    author: 'Terry Pratchett & Neil Gaiman',
    price: 13.99,
    coverImageUrl: 'https://picsum.photos/seed/good-omens/200/300',
    category: 'Fantasy',
    pageCount: 288,
  },

  // Mystery (5 books)
  {
    id: 'b11',
    title: 'The Big Sleep',
    author: 'Raymond Chandler',
    price: 9.99,
    coverImageUrl: 'https://picsum.photos/seed/the-big-sleep/200/300',
    category: 'Mystery',
    pageCount: 231,
  },
  {
    id: 'b12',
    title: 'Gone Girl',
    author: 'Gillian Flynn',
    price: 14.99,
    coverImageUrl: 'https://picsum.photos/seed/gone-girl/200/300',
    category: 'Mystery',
    pageCount: 432,
  },
  {
    id: 'b13',
    title: 'The Girl with the Dragon Tattoo',
    author: 'Stieg Larsson',
    price: 15.99,
    coverImageUrl: 'https://picsum.photos/seed/the-girl-with-the-dragon-tattoo/200/300',
    category: 'Mystery',
    pageCount: 672,
  },
  {
    id: 'b14',
    title: 'In the Woods',
    author: 'Tana French',
    price: 13.99,
    coverImageUrl: 'https://picsum.photos/seed/in-the-woods/200/300',
    category: 'Mystery',
    pageCount: 429,
  },
  {
    id: 'b15',
    title: 'The Hound of the Baskervilles',
    author: 'Arthur Conan Doyle',
    price: 9.99,
    coverImageUrl: 'https://picsum.photos/seed/the-hound-of-the-baskervilles/200/300',
    category: 'Mystery',
    pageCount: 256,
  },

  // Non-Fiction (5 books)
  {
    id: 'b16',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    price: 18.99,
    coverImageUrl: 'https://picsum.photos/seed/sapiens/200/300',
    category: 'Non-Fiction',
    pageCount: 498,
  },
  {
    id: 'b17',
    title: 'Thinking Fast and Slow',
    author: 'Daniel Kahneman',
    price: 16.99,
    coverImageUrl: 'https://picsum.photos/seed/thinking-fast-and-slow/200/300',
    category: 'Non-Fiction',
    pageCount: 499,
  },
  {
    id: 'b18',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    price: 14.99,
    coverImageUrl: 'https://picsum.photos/seed/a-brief-history-of-time/200/300',
    category: 'Non-Fiction',
    pageCount: 212,
  },
  {
    id: 'b19',
    title: 'The Immortal Life of Henrietta Lacks',
    author: 'Rebecca Skloot',
    price: 15.99,
    coverImageUrl: 'https://picsum.photos/seed/the-immortal-life-of-henrietta-lacks/200/300',
    category: 'Non-Fiction',
    pageCount: 381,
  },
  {
    id: 'b20',
    title: 'Educated',
    author: 'Tara Westover',
    price: 14.99,
    coverImageUrl: 'https://picsum.photos/seed/educated/200/300',
    category: 'Non-Fiction',
    pageCount: 334,
  },

  // Classic Literature (5 books)
  {
    id: 'b21',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    price: 9.99,
    coverImageUrl: 'https://picsum.photos/seed/pride-and-prejudice/200/300',
    category: 'Classic Literature',
    pageCount: 279,
  },
  {
    id: 'b22',
    title: 'Crime and Punishment',
    author: 'Fyodor Dostoevsky',
    price: 12.99,
    coverImageUrl: 'https://picsum.photos/seed/crime-and-punishment/200/300',
    category: 'Classic Literature',
    pageCount: 671,
  },
  {
    id: 'b23',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    price: 11.99,
    coverImageUrl: 'https://picsum.photos/seed/to-kill-a-mockingbird/200/300',
    category: 'Classic Literature',
    pageCount: 281,
  },
  {
    id: 'b24',
    title: 'One Hundred Years of Solitude',
    author: 'Gabriel Garcia Marquez',
    price: 14.99,
    coverImageUrl: 'https://picsum.photos/seed/one-hundred-years-of-solitude/200/300',
    category: 'Classic Literature',
    pageCount: 417,
  },
  {
    id: 'b25',
    title: 'Moby Dick',
    author: 'Herman Melville',
    price: 10.99,
    coverImageUrl: 'https://picsum.photos/seed/moby-dick/200/300',
    category: 'Classic Literature',
    pageCount: 720,
  },
];
