import { ChapterMeta } from '../types';
import Chapter1Intro from './Chapter1Intro';
import Chapter2NumberGame from './Chapter2NumberGame';
import Chapter3PrimeFactors from './Chapter3PrimeFactors';
import Chapter4Visualization from './Chapter4Visualization';
import Chapter5Puzzles from './Chapter5Puzzles';

export const CHAPTERS: ChapterMeta[] = [
  {
    id: 'intro',
    number: 1,
    title: 'The Game',
    subtitle: 'A simple game with fractions',
    component: Chapter1Intro,
  },
  {
    id: 'number-game',
    number: 2,
    title: 'Simple Rules',
    subtitle: 'One fraction at a time',
    component: Chapter2NumberGame,
  },
  {
    id: 'prime-factors',
    number: 3,
    title: 'A Different View',
    subtitle: 'What the numbers are hiding',
    component: Chapter3PrimeFactors,
  },
  {
    id: 'visualization',
    number: 4,
    title: 'Seeing the Pattern',
    subtitle: 'Dots and columns',
    component: Chapter4Visualization,
  },
  {
    id: 'puzzles',
    number: 5,
    title: 'Design Your Own',
    subtitle: 'Puzzles and challenges',
    component: Chapter5Puzzles,
  },
];
