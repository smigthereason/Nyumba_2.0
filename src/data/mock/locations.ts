import { County } from '../types';

export const counties: County[] = [
  {
    id: 'nairobi',
    name: 'Nairobi',
    estates: [
      'Westlands',
      'Kilimani',
      'Lavington',
      'Karen',
      'Kileleshwa',
      'Parklands',
      'South B',
      'South C',
      'Upper Hill',
      'Runda',
    ],
    lat: -1.2921,
    lng: 36.8219,
  },
  {
    id: 'kiambu',
    name: 'Kiambu',
    estates: ['Ruiru', 'Thika', 'Juja', 'Kiambu Town', 'Runda Mumwe', 'Ridgeways'],
    lat: -1.1714,
    lng: 36.8356,
  },
  {
    id: 'kajiado',
    name: 'Kajiado',
    estates: ['Kitengela', 'Ngong', 'Ongata Rongai'],
    lat: -1.85,
    lng: 36.78,
  },
  {
    id: 'machakos',
    name: 'Machakos',
    estates: ['Syokimau', 'Athi River', 'Mlolongo', 'Machakos Town'],
    lat: -1.5177,
    lng: 37.2634,
  },
  {
    id: 'mombasa',
    name: 'Mombasa',
    estates: ['Nyali', 'Bamburi', 'Shanzu', 'Nyali Beach', 'Mtwapa', 'Tudor'],
    lat: -4.0435,
    lng: 39.6682,
  },
  {
    id: 'kisumu',
    name: 'Kisumu',
    estates: ['Milimani', 'Kondele', 'Nyalenda', 'Tom Mboya', 'Riat'],
    lat: -0.0917,
    lng: 34.768,
  },
  {
    id: 'nakuru',
    name: 'Nakuru',
    estates: ['Milimani', 'Section 58', 'Lanet', 'Pipeline', 'Naka'],
    lat: -0.3031,
    lng: 36.08,
  },
];

export const defaultCounty = 'Nairobi';
