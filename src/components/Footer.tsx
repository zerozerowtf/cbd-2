import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-secondary">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-display mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-2 mt-1 flex-shrink-0" />
                <span>Via Roma 123, 18030 Airole (IM), Italy</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-2 flex-shrink-0" />
                <a href="tel:+393331234567" className="hover:text-accent transition-colors">
                  +39 333 123 4567
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-2 flex-shrink-0" />
                <a href="mailto:info@casadibarbara.com" className="hover:text-accent transition-colors">
                  info@casadibarbara.com
                </a>
              </li>
            </ul>
            
            <div className="mt-6 flex space-x-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary hover:text-accent transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary hover:text-accent transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-display mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-accent transition-colors">
                  {t('navigation.home')}
                </Link>
              </li>
              <li>
                <Link to="/apartment" className="hover:text-accent transition-colors">
                  {t('navigation.apartment')}
                </Link>
              </li>
              <li>
                <Link to="/area" className="hover:text-accent transition-colors">
                  {t('navigation.area')}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-accent transition-colors">
                  {t('navigation.blog')}
                </Link>
              </li>
              <li>
                <Link to="/booking" className="hover:text-accent transition-colors">
                  {t('navigation.booking')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-display mb-4">{t('footer.newsletter')}</h3>
            <p className="mb-4">{t('footer.newsletterText')}</p>
            <form className="flex">
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                className="px-4 py-2 rounded-l-md w-full focus:outline-none text-primary"
                required
              />
              <button
                type="submit"
                className="bg-accent text-secondary px-4 py-2 rounded-r-md hover:bg-accent/90 transition-colors"
              >
                {t('footer.subscribe')}
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-secondary/20 text-center text-sm text-secondary/70">
          <p>© {currentYear} Casa di Barbara. {t('footer.rightsReserved')}</p>
          <div className="mt-2 space-x-4">
            <Link to="/privacy" className="hover:text-accent transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link to="/terms" className="hover:text-accent transition-colors">
              {t('footer.terms')}
            </Link>
            <Link to="/cookies" className="hover:text-accent transition-colors">
              {t('footer.cookies')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
