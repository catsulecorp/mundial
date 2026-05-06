export interface Card {
  id: string;
  name: string;
  power: number; // For hierarchy comparison (VAL)
  env: number; // For Envido (ENV)
  suit: 'espada' | 'basto' | 'oro' | 'copa' | 'figurita';
  cardNumber: number;
  image: string;
  country: string;
  isLegendary?: boolean;
}


export const CARDS: Card[] = [
  // Truco Hierarchy (Lower is better)
  { id: 'messi', name: 'LIONEL MESSI', power: 1, env: 1, suit: 'espada', cardNumber: 1, country: 'Argentina', isLegendary: true, image: '/figu-de-messi.png' },
  { id: 'cr7', name: 'C. Ronaldo', power: 2, env: 7, suit: 'basto', cardNumber: 1, country: 'Portugal', isLegendary: true, image: '/figu-de-cristiano.png' },
  { id: 'neymar', name: 'Neymar Jr', power: 5, env: 10, suit: 'oro', cardNumber: 10, country: 'Brazil', isLegendary: true, image: '/figu-de-neymar.png' },
  { id: 'mbappe', name: 'K. Mbappé', power: 3, env: 10, suit: 'espada', cardNumber: 7, country: 'France', isLegendary: true, image: '/figu-de-mbappe.png' },
  { id: 'haaland', name: 'E. Haaland', power: 6, env: 9, suit: 'figurita', cardNumber: 9, country: 'Norway', isLegendary: true, image: '/figu-de-haaland.png' },
  { id: 'yamal', name: 'L. Yamal', power: 4, env: 19, suit: 'figurita', cardNumber: 19, country: 'Spain', isLegendary: true, image: '/figu-de-yamal.png' },
];
