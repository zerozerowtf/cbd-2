import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { de, enUS, fr, it } from 'date-fns/locale';

export const Blog = () => {
  const { t, i18n } = useTranslation();

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
  const posts = [
    {
      id: 1,
      slug: 'spring-in-airole',
      title: 'Frühling in Airole',
      excerpt: 'Die schönsten Wanderungen und Ausflüge in der Umgebung während der Frühlingszeit.',
      coverImage: 'https://images.unsplash.com/photo-1522931698295-e7b4d3e4428f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      publishedAt: new Date('2024-03-15'),
      author: 'Barbara',
      category: 'Aktivitäten',
    },
    // More posts will be added
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="text-center mb-16">
        <h1 className="font-display text-4xl md:text-6xl text-primary mb-4">
          {t('blog.title')}
        </h1>
        <p className="text-xl text-primary/80">
          {t('blog.subtitle')}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48">
              <img
                src={post.coverImage}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center text-sm text-accent mb-2">
                <Calendar size={16} className="mr-2" />
                {format(post.publishedAt, 'PPP', { locale: getLocale() })}
              </div>
              <h2 className="font-display text-xl text-primary mb-2">
                {post.title}
              </h2>
              <p className="text-primary/80 mb-4">
                {post.excerpt}
              </p>
              <Link
                to={`/blog/${post.slug}`}
                className="inline-block text-accent hover:text-primary transition-colors"
              >
                {t('blog.readMore')} →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
