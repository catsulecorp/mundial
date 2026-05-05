export interface Card {
  id: string;
  name: string;
  power: number; // For hierarchy comparison
  value: number; // For Envido
  env?: number; // Custom Envido value
  suit: 'espada' | 'basto' | 'oro' | 'copa' | 'figurita';
  cardNumber: number;
  image: string;
  country: string;
  isLegendary?: boolean;
}


export const CARDS: Card[] = [
  // High Power Cards
  { id: 'messi', name: 'LIONEL MESSI', power: 14, value: 1, suit: 'espada', cardNumber: 1, country: 'Argentina', isLegendary: true, image: '/figu-de-messi.png' },
  { id: 'cr7', name: 'C. Ronaldo', power: 13, value: 2, env: 7, suit: 'basto', cardNumber: 1, country: 'Portugal', isLegendary: true, image: '/figu-de-cristiano.png' },
  { id: 'mbappe', name: 'K. Mbappé', power: 12, value: 3, env: 10, suit: 'espada', cardNumber: 7, country: 'France', isLegendary: true, image: '/figu-de-mbappe.png' },
  { id: 'neymar', name: 'Neymar Jr', power: 11, value: 7, env: 10, suit: 'oro', cardNumber: 10, country: 'Brazil', isLegendary: true, image: '/figu-de-neymar.png' },
  { id: 'haaland', name: 'E. Haaland', power: 10, value: 7, env: 9, suit: 'figurita', cardNumber: 9, country: 'Norway', isLegendary: true, image: '/figu-de-haaland.png' },
  { id: 'yamal', name: 'L. Yamal', power: 9, value: 7, env: 19, suit: 'figurita', cardNumber: 19, country: 'Spain', isLegendary: true, image: '/figu-de-yamal.png' },
  
  // High Power Cards continued
  { id: 'modric', name: 'L. Modrić', power: 8, value: 3, suit: 'figurita', cardNumber: 3, country: 'Croatia', image: '' },
  { id: 'debruyne', name: 'K. De Bruyne', power: 10, value: 3, suit: 'figurita', cardNumber: 3, country: 'Belgium', image: '' },
  
  // 2s
  { id: 'lewandowski', name: 'R. Lewandowski', power: 9, value: 2, suit: 'figurita', cardNumber: 2, country: 'Poland', image: '' },
  { id: 'vinicius', name: 'Vinícius Jr', power: 9, value: 2, suit: 'figurita', cardNumber: 2, country: 'Brazil', image: '' },
  
  // 1s (Copa/Oro)
  { id: 'enzo', name: 'Enzo F.', power: 8, value: 1, suit: 'copa', cardNumber: 1, country: 'Argentina', image: '' },
  { id: 'gavi', name: 'Gavi', power: 8, value: 1, suit: 'oro', cardNumber: 1, country: 'Spain', image: '' },
  
  // Figures (12, 11, 10)
  { id: 'dibu', name: 'Dibu M.', power: 7, value: 0, suit: 'figurita', cardNumber: 12, country: 'Argentina', image: '' },
  { id: 'bellingham', name: 'J. Bellingham', power: 6, value: 0, suit: 'figurita', cardNumber: 11, country: 'England', image: '' },
  { id: 'pedri', name: 'Pedri', power: 5, value: 0, suit: 'figurita', cardNumber: 10, country: 'Spain', image: '' },
  
  // Low cards
  { id: 'common1', name: 'F. Muslera', power: 1, value: 4, suit: 'figurita', cardNumber: 4, country: 'Uruguay', image: '' },
  { id: 'common2', name: 'H. Maguire', power: 2, value: 5, suit: 'figurita', cardNumber: 5, country: 'England', image: '' },
  { id: 'common3', name: 'G. Ochoa', power: 3, value: 6, suit: 'figurita', cardNumber: 6, country: 'Mexico', image: '' },
];
