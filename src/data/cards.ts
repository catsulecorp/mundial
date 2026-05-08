export interface Card {
  id: string;
  name: string;
  power: number; // For hierarchy comparison (RANK)
  env: number; // For Envido (ENV)
  image: string;
  country: string;
  club: string;
  stickerNumber: string;
}


export const CARDS: Card[] = [
  // Top Tier
  { id: 'messi', name: 'MESSI', power: 1, env: 10, country: 'Argentina', club: 'Inter Miami', image: '/stickers/argentina/figu-de-messi.png', stickerNumber: 'ARG 9' },
  { id: 'mbappe', name: 'MBAPPÉ', power: 2, env: 10, country: 'Francia', club: 'Real Madrid', image: '/stickers/france/figu-de-mbappe.png', stickerNumber: 'FRA 8' },
  { id: 'julian', name: 'JULIÁN Á.', power: 3, env: 9, country: 'Argentina', club: 'Atlético Madrid', image: '/stickers/argentina/figu-de-julian-alvarez.png', stickerNumber: 'ARG 8' },
  { id: 'lautaro', name: 'TORO M.', power: 4, env: 22, country: 'Argentina', club: 'Inter Milan', image: '/stickers/argentina/figu-del-toro-martinez.png', stickerNumber: 'ARG 11' },
  { id: 'dibu', name: 'DIBU MARTÍNEZ', power: 5, env: 23, country: 'Argentina', club: 'Aston Villa', image: '/stickers/argentina/figu-del-dibu.png', stickerNumber: 'ARG 1' },
  { id: 'dembele', name: 'DEMBÉLÉ', power: 6, env: 11, country: 'Francia', club: 'PSG', image: '/stickers/france/figu-de-dembele.png', stickerNumber: 'FRA 7' },
  { id: 'enzo', name: 'ENZO F.', power: 7, env: 24, country: 'Argentina', club: 'Chelsea', image: '/stickers/argentina/figu-de-enzo-fernandez.png', stickerNumber: 'ARG 5' },
  { id: 'depaul', name: 'DE PAUL', power: 8, env: 7, country: 'Argentina', club: 'Atlético Madrid', image: '/stickers/argentina/figu-de-de-paul.png', stickerNumber: 'ARG 7' },
  { id: 'macallister', name: 'MAC ALLISTER', power: 9, env: 20, country: 'Argentina', club: 'Liverpool', image: '/stickers/argentina/figu-de-mac-allister.png', stickerNumber: 'ARG 6' },
  { id: 'romero', name: 'CUTI ROMERO', power: 10, env: 13, country: 'Argentina', club: 'Tottenham', image: '/stickers/argentina/figu-del-cuti.png', stickerNumber: 'ARG 3' },
  { id: 'otamendi', name: 'OTAMENDI', power: 11, env: 19, country: 'Argentina', club: 'Benfica', image: '/stickers/argentina/figu-de-otamendi.png', stickerNumber: 'ARG 4' },
  { id: 'molina', name: 'NAHUEL M.', power: 12, env: 26, country: 'Argentina', club: 'Atlético Madrid', image: '/stickers/argentina/figu-de-nahuel-molina.png', stickerNumber: 'ARG 2' },
  { id: 'simeone', name: 'G. SIMEONE', power: 13, env: 18, country: 'Argentina', club: 'Atlético Madrid', image: '/stickers/argentina/figu-de-giuliano-simeone.png', stickerNumber: 'ARG 10' },
  { id: 'maignan', name: 'MIKE MAIGNAN', power: 14, env: 16, country: 'Francia', club: 'AC Milan', image: '/stickers/france/figu-de-maignan.png', stickerNumber: 'FRA 1' },
  { id: 'upamecano', name: 'UPAMECANO', power: 15, env: 18, country: 'Francia', club: 'Bayern Munich', image: '/stickers/france/figu-de-upamecano.png', stickerNumber: 'FRA 4' },
  { id: 'saliba', name: 'SALIBA', power: 16, env: 4, country: 'Francia', club: 'Arsenal', image: '/stickers/france/figu-de-saliba.png', stickerNumber: 'FRA 2' },
  { id: 'theo', name: 'HERNÁNDEZ', power: 17, env: 22, country: 'Francia', club: 'AC Milan', image: '/stickers/france/figu-de-hernandez.png', stickerNumber: 'FRA 4' },
  { id: 'tchouameni', name: 'TCHOUAMÉNI', power: 18, env: 18, country: 'Francia', club: 'Real Madrid', image: '/stickers/france/figu-de-tchouameni.png', stickerNumber: 'FRA 5' },
  { id: 'camavinga', name: 'CAMAVINGA', power: 19, env: 6, country: 'Francia', club: 'Real Madrid', image: '/stickers/france/figu-de-camavigna.png', stickerNumber: 'FRA 6' },
  { id: 'barcola', name: 'BARCOLA', power: 20, env: 25, country: 'Francia', club: 'PSG', image: '/stickers/france/figu-de-barcola.png', stickerNumber: 'FRA 9' },
  { id: 'doue', name: 'DÉSIRÉ DOUÉ', power: 21, env: 28, country: 'Francia', club: 'PSG', image: '/stickers/france/figu-de-doue.png', stickerNumber: 'FRA 10' },
  { id: 'ekitike', name: 'HUGO EKITIKÉ', power: 22, env: 16, country: 'Francia', club: 'Eintracht Frankfurt', image: '/stickers/france/figu-de-ekitike.png', stickerNumber: 'FRA 11' },
];
