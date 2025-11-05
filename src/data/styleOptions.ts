import type { ConsultationStyle } from '../types';

interface StyleOption {
  id: ConsultationStyle;
  name: string;
  description: string;
  icon: string;
  accentColor: string;
}

export const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'classic',
    name: 'Klasický',
    description: 'Nadčasová elegancia a rafinovaná krása.',
    icon: '/assets/icons/style-classic.svg',
    accentColor: '#C9A961'
  },
  {
    id: 'trendy',
    name: 'Trendový',
    description: 'Moderný, odvážny a v súlade s módou.',
    icon: '/assets/icons/style-trendy.svg',
    accentColor: '#00D4FF'
  },
  {
    id: 'bold',
    name: 'Odvážny',
    description: 'Dramatický, výrazný a nezabudnuteľný.',
    icon: '/assets/icons/style-bold.svg',
    accentColor: '#DC143C'
  },
  {
    id: 'lowMaintenance',
    name: 'Nenáročný',
    description: 'Prirodzená ladnosť s minimálnou údržbou.',
    icon: '/assets/icons/style-low-maintenance.svg',
    accentColor: '#87A96B'
  },
  {
    id: 'glamorous',
    name: 'Očarujúci',
    description: 'Luxusný, uhladený a podmanivý.',
    icon: '/assets/icons/style-glamorous.svg',
    accentColor: '#E8B4B8'
  },
  {
    id: 'bohemian',
    name: 'Bohémsky',
    description: 'Slobodomyseľný, zemitý, s dotykom romantiky.',
    icon: '/assets/icons/style-bohemian.svg',
    accentColor: '#CD853F'
  },
  {
    id: 'artDeco',
    name: 'Art Deco',
    description: 'Geometrická precíznosť sa stretáva s opulentným pôvabom.',
    icon: '/assets/icons/style-art-deco.svg',
    accentColor: '#F7E7CE'
  },
  {
    id: 'futuristic',
    name: 'Futuristický',
    description: 'Elegantný, avantgardný a predbehajúci svoju dobu.',
    icon: '/assets/icons/style-futuristic.svg',
    accentColor: '#8A2BE2'
  }
];