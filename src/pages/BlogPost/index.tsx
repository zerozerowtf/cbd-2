import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { de, enUS, fr, it } from 'date-fns/locale';

export const BlogPost = () => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();

  const getLocale = () => {
    switch (i18n.language) {
      case 'de':
        return de;
      case 'fr':
        return fr;
      case 'it':
        return it;
      default:
        return enUS;
    }
  };

  // This will be replaced with actual data from Supabase
  const post = {
    id: 1,
    slug: 'spring-in-airole',
    title: 'Frühling in Airole',
    content: `
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1522931698295-e7b4d3e4428f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
    publishedAt: new Date('2024-03-15'),
    author: 'Barbara',
    category: 'Aktivitäten',
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        to="/blog"
        className="inline-flex items-center text-accent hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft size={20} className="mr-2" />
        {t('blog.backToOverview')}
      </Link>

      <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
        <img
          src={post.coverImage}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      <header className="mb-8">
        <h1 className="font-display text-4xl md:text-6xl text-primary mb-4">
          {post.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-primary/80">
          <div className="flex items-center">
            <Calendar size={16} className="mr-2" />
            {format(post.publishedAt, 'PPP', { locale: getLocale() })}
          </div>
          <div className="flex items-center">
            <User size={16} className="mr-2" />
            {post.author}
          </div>
          <div className="flex items-center">
            <Tag size={16} className="mr-2" />
            {post.category}
          </div>
        </div>
      </header>

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
};
