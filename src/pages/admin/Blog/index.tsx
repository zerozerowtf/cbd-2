import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  FileText, 
  Plus, 
  Globe2, 
  Calendar,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  Search
} from 'lucide-react';
import { Section } from '../../../components/Section';
import { ScrollReveal } from '../../../components/ScrollReveal';
import { supabase } from '../../../lib/supabase';

interface BlogPost {
  id: string;
  slug: string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  content: Record<string, string>;
  cover_image: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const languageLabels = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
};

export const Blog = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'published') {
        query = query.not('published_at', 'is', null);
      } else if (filter === 'draft') {
        query = query.is('published_at', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError('Fehler beim Laden der Blog-Beiträge');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Möchten Sie diesen Beitrag wirklich löschen?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchPosts();
    } catch (err) {
      console.error('Error deleting blog post:', err);
      setError('Fehler beim Löschen des Beitrags');
    }
  };

  const handlePublishToggle = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          published_at: post.published_at ? null : new Date().toISOString(),
        })
        .eq('id', post.id);

      if (error) throw error;
      await fetchPosts();
    } catch (err) {
      console.error('Error toggling post publish status:', err);
      setError('Fehler beim Ändern des Veröffentlichungsstatus');
    }
  };

  const filteredPosts = posts.filter(post => {
    const searchLower = searchTerm.toLowerCase();
    return (
      post.title.de?.toLowerCase().includes(searchLower) ||
      post.excerpt.de?.toLowerCase().includes(searchLower) ||
      post.slug.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-display">Blog</h1>
              <p className="text-primary/60 mt-1">
                {posts.length} Beiträge insgesamt
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Filter */}
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as typeof filter)}
                  className="w-full sm:w-auto appearance-none bg-white pl-10 pr-4 py-2 rounded-lg 
                           border border-gray-300 focus:border-accent focus:ring 
                           focus:ring-accent/20 text-sm"
                >
                  <option value="all">Alle Beiträge</option>
                  <option value="published">Veröffentlicht</option>
                  <option value="draft">Entwürfe</option>
                </select>
                <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
              </div>

              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Beiträge durchsuchen..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 
                           focus:border-accent focus:ring focus:ring-accent/20"
                />
              </div>

              {/* New Post Button */}
              <button
                onClick={() => navigate('/admin/blog/new')}
                className="flex items-center justify-center gap-2 bg-accent text-secondary 
                         px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors 
                         whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                <span>Neuer Beitrag</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 p-4 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Blog Posts List */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-10 h-10 border-4 border-accent border-t-transparent 
                           rounded-full animate-spin" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12 text-primary/60">
              Keine Blog-Beiträge gefunden
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <ScrollReveal key={post.id}>
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-6">
                      {/* Cover Image */}
                      {post.cover_image && (
                        <div className="w-full sm:w-48 h-32 flex-shrink-0">
                          <img
                            src={post.cover_image}
                            alt=""
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-grow min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="font-medium truncate">
                            {post.title.de || 'Ohne Titel'}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            post.published_at
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {post.published_at ? 'Veröffentlicht' : 'Entwurf'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-primary/60 mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            {post.published_at
                              ? format(new Date(post.published_at), 'dd.MM.yyyy HH:mm', {
                                  locale: de,
                                })
                              : 'Nicht veröffentlicht'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Globe2 size={16} />
                            {Object.keys(post.title).length} Sprachen
                          </div>
                        </div>

                        <p className="text-primary/80 line-clamp-2 mb-4">
                          {post.excerpt.de}
                        </p>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => navigate(`/admin/blog/${post.id}`)}
                            className="flex items-center gap-2 text-accent hover:text-accent/80
                                     transition-colors"
                          >
                            <Edit2 size={18} />
                            <span>Bearbeiten</span>
                          </button>

                          <button
                            onClick={() => handlePublishToggle(post)}
                            className={`flex items-center gap-2 transition-colors ${
                              post.published_at
                                ? 'text-amber-600 hover:text-amber-700'
                                : 'text-emerald-600 hover:text-emerald-700'
                            }`}
                          >
                            <Eye size={18} />
                            <span>
                              {post.published_at ? 'Zurückziehen' : 'Veröffentlichen'}
                            </span>
                          </button>

                          <button
                            onClick={() => handleDelete(post.id)}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700
                                     transition-colors"
                          >
                            <Trash2 size={18} />
                            <span>Löschen</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
