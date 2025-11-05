
import type { HairColorTrend, HairstyleTrend } from '../types';

export const hairColorTrends: HairColorTrend[] = [
  {
    name: 'Cowboy Copper',
    description: 'A sophisticated blend of deep auburn, rich leather, and subtle gold highlights. Warm, inviting, and surprisingly versatile.',
    imageUrl: '/assets/images/trend-cowboy-copper.webp'
  },
  {
    name: 'Expensive Brunette',
    description: 'Elevating natural brunette hair with subtle, masterfully placed highlights and lowlights for a multi-tonal, luxurious effect.',
    imageUrl: '/assets/images/trend-expensive-brunette.webp'
  },
  {
    name: 'Buttercream Blonde',
    description: 'A warmer, more golden take on blonde that feels soft and inviting, featuring creamy, buttery tones with delicate vanilla highlights.',
    imageUrl: '/assets/images/trend-buttercream-blonde.webp'
  },
  {
    name: 'Cherry Cola',
    description: 'A deep, rich red with violet and mahogany undertones, creating a dramatic and eye-catching effect that exudes confidence.',
    imageUrl: '/assets/images/trend-cherry-cola.webp'
  }
];

export const hairstyleTrends: HairstyleTrend[] = [
  {
    name: 'The Shag Mullet',
    description: 'A modern, edgy fusion of the shag and mullet hairstyles, featuring heavy texture, layers, and a shorter front with longer back.',
    gender: 'Female',
    imageUrl: '/assets/images/trend-shag-mullet.webp'
  },
  {
    name: 'Curtain Bangs',
    description: 'A versatile, face-framing fringe that is parted down the middle, sweeping to each side. It softly accentuates the cheekbones.',
    gender: 'Female',
    imageUrl: '/assets/images/trend-curtain-bangs.webp'
  },
  {
    name: 'The Modern Pompadour',
    description: 'A contemporary take on the classic pompadour, often with faded or undercut sides and textured volume on top.',
    gender: 'Male',
    imageUrl: '/assets/images/trend-modern-pompadour.webp'
  },
  {
    name: 'Textured Crop',
    description: 'A short, versatile men\'s haircut with a defined fringe and lots of texture on top for a messy yet controlled look.',
    gender: 'Male',
    imageUrl: '/assets/images/trend-textured-crop.webp'
  }
];