import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';

export const Navigation: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiano' },
  ];

  const navLinks = [
    { path: '/', label: t('navigation.home') },
    { path: '/apartment', label: t('navigation.apartment') },
    { path: '/area', label: t('navigation.area') },
    { path: '/blog', label: t('navigation.blog') },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen, isMobile]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsLanguageMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMenuOpen
          ? 'bg-primary text-secondary shadow-lg'
          : 'bg-transparent text-secondary'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="font-display text-2xl">
            Casa di Barbara
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors hover:text-accent ${
                  location.pathname === link.path ? 'text-accent' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center gap-1 hover:text-accent transition-colors"
              >
                <Globe className="w-5 h-5" />
                <span className="uppercase">{i18n.language.substring(0, 2)}</span>
              </button>

              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-secondary text-primary rounded-md shadow-lg overflow-hidden z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`block w-full text-left px-4 py-2 hover:bg-accent hover:text-secondary transition-colors ${
                        i18n.language.startsWith(lang.code) ? 'bg-accent/10' : ''
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-current"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-primary text-secondary min-h-screen">
          <nav className="container mx-auto px-4 py-8 flex flex-col space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-2xl font-display ${
                  location.pathname === link.path ? 'text-accent' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Language Options */}
            <div className="mt-8 border-t border-secondary/20 pt-8">
              <p className="text-lg mb-4 text-secondary/70">{t('navigation.language')}</p>
              <div className="grid grid-cols-2 gap-4">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`py-2 px-4 rounded-md transition-colors ${
                      i18n.language.startsWith(lang.code)
                        ? 'bg-accent text-secondary'
                        : 'bg-secondary/10 hover:bg-secondary/20'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
