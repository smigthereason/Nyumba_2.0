import { UpcomingProject } from '../types';

export const upcomingProjects: UpcomingProject[] = [
  {
    id: 'project-1',
    agencyId: 'agency-4',
    name: 'The Ridgeway Residences',
    description:
      'Gated maisonettes with clubhouse, pool, and 24/7 security, launching in phases in Runda.',
    county: 'Nairobi',
    estate: 'Runda',
    imageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&h=600&fit=crop',
    priceFromKes: 24_500_000,
    completionLabel: 'Completion Q4 2026',
    unitsLeft: 12,
    propertyType: 'maisonette',
  },
  {
    id: 'project-2',
    agencyId: 'agency-1',
    name: 'Kilimani Heights',
    description:
      'Modern one, two, and three-bedroom apartments minutes from Yaya Centre, with rooftop lounge.',
    county: 'Nairobi',
    estate: 'Kilimani',
    imageUrl:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&h=600&fit=crop',
    priceFromKes: 8_900_000,
    completionLabel: 'Completion Q2 2027',
    unitsLeft: 34,
    propertyType: 'apartment',
  },
  {
    id: 'project-3',
    agencyId: 'agency-2',
    name: 'Nyali Beachfront Villas',
    description:
      'Private beach access villas with private pools — limited units for early investors.',
    county: 'Mombasa',
    estate: 'Nyali',
    imageUrl:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&h=600&fit=crop',
    priceFromKes: 38_000_000,
    completionLabel: 'Completion Q1 2027',
    unitsLeft: 6,
    propertyType: 'house',
  },
  {
    id: 'project-4',
    agencyId: 'agency-3',
    name: 'Greenfields Ruiru Gardens',
    description:
      'Affordable bedsitters and one-bedroom units for first-time buyers, mortgage-friendly plans.',
    county: 'Kiambu',
    estate: 'Ruiru',
    imageUrl:
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=900&h=600&fit=crop',
    priceFromKes: 3_200_000,
    completionLabel: 'Completion Q3 2026',
    unitsLeft: 58,
    propertyType: 'bedsitter',
  },
];
