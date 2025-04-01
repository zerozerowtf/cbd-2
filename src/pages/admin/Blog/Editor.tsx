import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  ArrowLeft, 
  Save, 
  Globe2, 
  Wand2,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  Languages,
  Eye,
  EyeOff
} from 'lucide-react';
import { Section } from '../../../components/Section';
import { ScrollReveal } from '../../../components/ScrollReveal';
import { Dialog } from '../../../components/Dialog';
import { supabase } from '../../../lib/supabase';

interface BlogPost {
  id: string;
  slug: string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  content: Record<string, string>;
  cover_image: string | null;
  published_at: string | null;
}

const languages = [
  { code: 'de', name: 'Deutsch' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
];

export const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState('de');
  const [showPreview, setShowPreview] = useState(false);
  const [post, setPost] = useState<BlogPost>({
    id: '',
    slug: '',
    title: {},
    excerpt: {},
    content: {},
    cover_image: null,
    published_at: null,
  });

  useEffect(() => {
    if (id) {
      fetchPost();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setPost(data);
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Fehler beim Laden des Beitrags');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Generate slug if not set
      if (!post.slug) {
        const baseSlug = post.title.de
          ?.toLowerCase()
          .replace(/[äöüß]/g, (match) => {
            const chars: Record<string, string> = {
              'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss'
            };
            return chars[match] || match;
          })
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'post';

        // Check if slug exists
        const { data: existingPost } = await supabase
          .from('blog_posts')
          .select('id')
          .eq('slug', baseSlug)
          .single();

        post.slug = existingPost ? `${baseSlug}-${Date.now()}` : baseSlug;
      }

      if (id) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update({
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            cover_image: post.cover_image,
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        // Create new post
        const { error } = await supabase
          .from('blog_posts')
          .insert({
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            cover_image: post.cover_image,
          });

        if (error) throw error;
      }

      navigate('/admin/blog');
    } catch (err) {
      console.error('Error saving post:', err);
      setError('Fehler beim Speichern des Beitrags');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const { error } = await supabase
        .from('blog_posts')
        .update({
          published_at: post.published_at ? null : new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      setPost(prev => ({
        ...prev,
        published_at: prev.published_at ? null : new Date().toISOString(),
      }));
    } catch (err) {
      console.error('Error toggling publish status:', err);
      setError('Fehler beim Ändern des Veröffentlichungsstatus');
    } finally {
      setIsSaving(false);
    }
  };

  const generateContent = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // This is where we would integrate with an AI service
      // For now, we'll just simulate the delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Example generated content
      const generated = {
        title: 'Neuer KI-generierter Titel',
        excerpt: 'Automatisch generierter Auszug für den Blog-Beitrag.',
        content: 'Hier steht der vollständige, KI-generierte Inhalt des Blog-Beitrags...',
      };

      setPost(prev => ({
        ...prev,
        title: { ...prev.title, [activeLanguage]: generated.title },
        excerpt: { ...prev.excerpt, [activeLanguage]: generated.excerpt },
        content: { ...prev.content, [activeLanguage]: generated.content },
      }));
    } catch (err) {
      console.error('Error generating content:', err);
      setError('Fehler bei der KI-Generierung');
    } finally {
      setIsGenerating(false);
    }
  };

  const translateContent = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // This is where we would integrate with a translation service
      // For now, we'll just simulate the delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Example translation (just append language code for demo)
      const sourceLang = 'de';
      const targetLangs = languages.map(l => l.code).filter(l => l !== sourceLang);

      const translated = targetLangs.reduce((acc, lang) => ({
        title: { 
          ...acc.title, 
          [lang]: post.title[sourceLang] + ` (${lang})`
        },
        excerpt: { 
          ...acc.excerpt, 
          [lang]: post.excerpt[sourceLang] + ` (${lang})`
        },
        content: { 
          ...acc.content, 
          [lang]: post.content[sourceLang] + ` (${lang})`
        },
      }), {
        title: { ...post.title },
        excerpt: { ...post.excerpt },
        content: { ...post.content },
      });

      setPost(prev => ({
        ...prev,
        title: translated.title,
        excerpt: translated.excerpt,
        content: translated.content,
      }));
    } catch (err) {
      console.error('Error translating content:', err);
      setError('Fehler bei der Übersetzung');
    } finally {
      setIsGenerating(false);
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

  return (
    <div className="py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/blog')}
                className="p-2 rounded-lg hover:bg-primary/5 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl md:text-3xl font-display">
                {id ? 'Beitrag bearbeiten' : 'Neuer Beitrag'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {id && (
                <button
                  onClick={handlePublishToggle}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg 
                           transition-colors ${
                             post.published_at
                               ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                               : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                           }`}
                >
                  {post.published_at ? (
                    <>
                      <EyeOff className="w-5 h-5" />
                      <span>Zurückziehen</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5" />
                      <span>Veröffentlichen</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-accent text-secondary px-4 py-2 
                         rounded-lg hover:bg-accent/90 transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>Speichern</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 p-4 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Language Selector */}
          <div className="flex items-center gap-4">
            <Globe2 className="w-5 h-5 text-primary/60" />
            <div className="flex gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setActiveLanguage(lang.code)}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    activeLanguage === lang.code
                      ? 'bg-accent text-secondary'
                      : 'hover:bg-primary/5'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={generateContent}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/5 
                         hover:bg-primary/10 transition-colors"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Wand2 className="w-5 h-5" />
                )}
                <span>KI-Generierung</span>
              </button>

              <button
                onClick={translateContent}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/5 
                         hover:bg-primary/10 transition-colors"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Languages className="w-5 h-5" />
                )}
                <span>Übersetzen</span>
              </button>
            </div>
          </div>

          {/* Editor Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                URL-Slug
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={post.slug}
                  onChange={(e) => setPost(prev => ({
                    ...prev,
                    slug: e.target.value,
                  }))}
                  className="flex-1 rounded-lg border-gray-300 focus:border-accent 
                           focus:ring focus:ring-accent/20"
                  placeholder="url-freundlicher-titel"
                />
                <button
                  onClick={() => {
                    // Copy URL to clipboard
                    const url = `${window.location.origin}/blog/${post.slug}`;
                    navigator.clipboard.writeText(url);
                  }}
                  className="px-4 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 
                           transition-colors"
                >
                  <LinkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Titelbild URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={post.cover_image || ''}
                  onChange={(e) => setPost(prev => ({
                    ...prev,
                    cover_image: e.target.value,
                  }))}
                  className="flex-1 rounded-lg border-gray-300 focus:border-accent 
                           focus:ring focus:ring-accent/20"
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  onClick={() => {
                    // Open image preview
                    if (post.cover_image) {
                      window.open(post.cover_image, '_blank');
                    }
                  }}
                  disabled={!post.cover_image}
                  className="px-4 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 
                           transition-colors disabled:opacity-50"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Titel
              </label>
              <input
                type="text"
                value={post.title[activeLanguage] || ''}
                onChange={(e) => setPost(prev => ({
                  ...prev,
                  title: {
                    ...prev.title,
                    [activeLanguage]: e.target.value,
                  },
                }))}
                className="w-full rounded-lg border-gray-300 focus:border-accent 
                         focus:ring focus:ring-accent/20"
                placeholder="Titel des Beitrags"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Auszug
              </label>
              <textarea
                value={post.excerpt[activeLanguage] || ''}
                onChange={(e) => setPost(prev => ({
                  ...prev,
                  excerpt: {
                    ...prev.excerpt,
                    [activeLanguage]: e.target.value,
                  },
                }))}
                className="w-full rounded-lg border-gray-300 focus:border-accent 
                         focus:ring focus:ring-accent/20"
                rows={3}
                placeholder="Kurze Beschreibung des Beitrags"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Inhalt
              </label>
              <textarea
                value={post.content[activeLanguage] || ''}
                onChange={(e) => setPost(prev => ({
                  ...prev,
                  content: {
                    ...prev.content,
                    [activeLanguage]: e.target.value,
                  },
                }))}
                className="w-full rounded-lg border-gray-300 focus:border-accent 
                         focus:ring focus:ring-accent/20 font-mono"
                rows={20}
                placeholder="Inhalt des Beitrags (Markdown unterstützt)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
