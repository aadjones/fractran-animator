import React from 'react';
import { useHash } from './hooks/useHash';
import { CHAPTERS } from './chapters/index';
import Landing from './pages/Landing';
import Sandbox from './pages/Sandbox';
import AdvancedPuzzles from './pages/AdvancedPuzzles';
import Explorer from './pages/Explorer';
import ChapterLayout from './components/ChapterLayout';

function App() {
  const [route, navigate] = useHash();

  // Landing page
  if (route === '/' || route === '') {
    return <Landing onNavigate={navigate} />;
  }

  // Sandbox (full simulator)
  if (route === '/sandbox') {
    return <Sandbox onNavigate={navigate} />;
  }

  // Advanced puzzles (fork path A)
  if (route === '/puzzles-advanced') {
    return <AdvancedPuzzles onNavigate={navigate} />;
  }

  // Explorer (fork path B)
  if (route === '/explorer') {
    return <Explorer onNavigate={navigate} />;
  }

  // Chapter routes
  const chapterMatch = route.match(/^\/chapter\/(\d+)$/);
  if (chapterMatch) {
    const num = parseInt(chapterMatch[1], 10);
    const chapterMeta = CHAPTERS[num - 1];
    if (chapterMeta) {
      const ChapterComponent = chapterMeta.component;
      return (
        <ChapterLayout chapterNum={num} onNavigate={navigate}>
          <ChapterComponent />
        </ChapterLayout>
      );
    }
  }

  // Fallback to landing
  return <Landing onNavigate={navigate} />;
}

export default App;
