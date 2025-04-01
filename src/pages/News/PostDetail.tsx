import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { de, enUS, fr, it } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  ArrowLeft,
  Share2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Section } from '../../components/Section';
import { ScrollReveal } from '../../components/ScrollReveal';
import { supabase } from '../../lib/supabase';

interface BlogPost {
  id: string;
  slug: string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  content: Record<string, string>;
  cover_image: string | null;
  published_at: string;
}

export const PostDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug, i18n.language]);

  const getLocale = () => {
    switch (i18n.language) {
      case 'de': return de;
      case 'fr': return fr;
      case 'it': return it;
      default: return enUS;
    }
  };

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Post not found');

      setPost(data);

      // Fetch related posts
      const { data: relatedData, error: relatedError } = await supabase
        .from('blog_posts')
        .select('*')
        .neq('id', data.id)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(3);

      if (relatedError) throw relatedError;
      setRelatedPosts(relatedData || []);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Der Beitrag konnte nicht geladen werden');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title[i18n.language] || '',
        text: post?.excerpt[i18n.language] || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent 
                     rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen py-12">
        <Section variant="secondary">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center gap-2 bg-red-50 text-red-700 p-4 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error || 'Beitrag nicht gefunden'}</p>
            </div>
            <Link
              to="/news"
              className="inline-flex items-center gap-2 mt-4 text-accent 
                       hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Zurück zur Übersicht</span>
            </Link>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-primary overflow-hidden">
        {post.cover_image && (
          <>
            <img
              src={post.cover_image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
          </>
        )}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <ScrollReveal>
              <h1 className="text-4xl md:text-6xl font-display text-secondary mb-6">
                {post.title[i18n.language]}
              </h1>
              <div className="flex items-center gap-4 text-secondary/80">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {format(new Date(post.published_at), 'dd. MMMM yyyy', {
                    locale: getLocale(),
                  })}
                </div>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 hover:text-secondary transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  Teilen
                </button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <Section variant="secondary" className="py-12 md:py-24">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="prose prose-lg max-w-none">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: post.content[i18n.language].replace(/\n/g, '<br />') 
                }} 
              />
            </div>
          </ScrollReveal>
        </div>
      </Section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <Section variant="accent" className="py-12 md:py-24">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <h2 className="text-3xl font-display text-center mb-12">
                Weitere Beiträge
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <ScrollReveal key={relatedPost.id}>
                  <Link
                    to={`/news/${relatedPost.slug}`}
                    className="block bg-white rounded-xl shadow-lg overflow-hidden 
                             hover:shadow-xl transition-shadow"
                  >
                    {relatedPost.cover_image && (
                      <div className="relative h-48">
                        <img
                          src={relatedPost.cover_image}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-accent mb-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(relatedPost.published_at), 'dd. MMMM yyyy', {
                          locale: getLocale(),
                        })}
                      </div>
                      <h3 className="font-display text-xl mb-2">
                        {relatedPost.title[i18n.language]}
                      </h3>
                      <p className="text-primary/80">
                        {relatedPost.excerpt[i18n.language]}
                      </p>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Navigation */}
      <Section variant="secondary" className="py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between">
            <Link
              to="/news"
              className="flex items-center gap-2 text-accent hover:text-primary 
                       transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Alle Beiträge</span>
            </Link>
            {relatedPosts.length > 0 && (
              <Link
                to={`/news/${relatedPosts[0].slug}`}
                className="flex items-center gap-2 text-accent hover:text-primary 
                         transition-colors"
              >
                <span>Nächster Beitrag</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
};
