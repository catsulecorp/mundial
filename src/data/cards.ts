export interface Card {
  id: string;
  name: string;
  power: number; // For hierarchy comparison (VAL)
  env: number; // For Envido (ENV)
  image: string;
  country: string;
}


export const CARDS: Card[] = [
  // Truco Hierarchy (Lower is better)
  { id: 'messi', name: 'LIONEL MESSI', power: 1, env: 10, country: 'Argentina', image: '/figu-de-messi.png' },
  { id: 'cr7', name: 'C. Ronaldo', power: 2, env: 7, country: 'Portugal', image: '/figu-de-cristiano.png' },
  { id: 'neymar', name: 'Neymar Jr', power: 5, env: 10, country: 'Brazil', image: '/figu-de-neymar.png' },
  { id: 'mbappe', name: 'K. Mbappé', power: 3, env: 10, country: 'France', image: '/figu-de-mbappe.png' },
  { id: 'haaland', name: 'E. Haaland', power: 6, env: 9, country: 'Norway', image: '/figu-de-haaland.png' },
  { id: 'yamal', name: 'L. Yamal', power: 4, env: 19, country: 'Spain', image: '/figu-de-yamal.png' },
];
