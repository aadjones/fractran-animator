import { ChapterMeta } from '../types';
import Chapter1Intro from './Chapter1Intro';
import Chapter2NumberGame from './Chapter2NumberGame';

export const CHAPTERS: ChapterMeta[] = [
  {
    id: 'intro',
    number: 1,
    title: 'What is FRACTRAN?',
    subtitle: 'A simple game with fractions',
    component: Chapter1Intro,
  },
  {
    id: 'number-game',
    number: 2,
    title: 'The Number Game',
    subtitle: 'Multiply by fractions, watch numbers bounce',
    component: Chapter2NumberGame,
  },
];
