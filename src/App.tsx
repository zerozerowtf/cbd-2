import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { ScrollProgress } from './components/ScrollProgress';
import { BackToTop } from './components/BackToTop';
import AppRoutes from './routes';
import './i18n';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ScrollProgress />
      <div className="min-h-screen bg-secondary flex flex-col">
        <Navigation />
        <main className="flex-grow">
          <AppRoutes />
        </main>
        <Footer />
      </div>
      <BackToTop />
    </Router>
  );
}

export default App;
