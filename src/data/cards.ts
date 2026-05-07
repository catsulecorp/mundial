export interface Card {
  id: string;
  name: string;
  power: number; // For hierarchy comparison (RANK)
  env: number; // For Envido (ENV)
  image: string;
  country: string;
  club: string;
}


export const CARDS: Card[] = [
  // Truco Hierarchy (Lower is better)
  { id: 'messi', name: 'LIONEL MESSI', power: 1, env: 10, country: 'Argentina', club: 'Inter Miami', image: '/figu-de-messi.png' },
  { id: 'cr7', name: 'C. Ronaldo', power: 2, env: 7, country: 'Portugal', club: 'Al Nassr', image: '/figu-de-cristiano.png' },
  { id: 'neymar', name: 'Neymar Jr', power: 5, env: 10, country: 'Brasil', club: 'Al Hilal', image: '/figu-de-neymar.png' },
  { id: 'mbappe', name: 'K. Mbappé', power: 3, env: 10, country: 'Francia', club: 'Real Madrid', image: '/figu-de-mbappe.png' },
  { id: 'haaland', name: 'E. Haaland', power: 6, env: 9, country: 'Noruega', club: 'Man City', image: '/figu-de-haaland.png' },
  { id: 'yamal', name: 'L. Yamal', power: 4, env: 19, country: 'España', club: 'FC Barcelona', image: '/figu-de-yamal.png' },
  { id: 'dibu', name: 'D. Martínez', power: 7, env: 11, country: 'Argentina', club: 'Aston Villa', image: '/figu-de-messi.png' },
  { id: 'vini', name: 'Vinícius Jr', power: 8, env: 12, country: 'Brasil', club: 'Real Madrid', image: '/figu-de-neymar.png' },
  { id: 'modric', name: 'L. Modric', power: 9, env: 10, country: 'Croacia', club: 'Real Madrid', image: '/figu-de-cristiano.png' },
  { id: 'kdb', name: 'K. De Bruyne', power: 10, env: 11, country: 'Bélgica', club: 'Man City', image: '/figu-de-haaland.png' },
  { id: 'lewa', name: 'R. Lewandowski', power: 11, env: 12, country: 'Polonia', club: 'FC Barcelona', image: '/figu-de-mbappe.png' },
  { id: 'dimaria', name: 'A. Di María', power: 12, env: 10, country: 'Argentina', club: 'Benfica', image: '/figu-de-messi.png' },
];
