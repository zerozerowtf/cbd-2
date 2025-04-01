import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { format, isAfter, isBefore, startOfToday, addDays } from 'date-fns';
import { de, enUS, fr, it } from 'date-fns/locale';
import { 
  Calendar,
  Tag,
  MapPin,
  Filter,
  FileText,
  Clock,
  Search,
  ArrowRight,
  Star,
  CalendarDays,
  CalendarClock
} from 'lucide-react';
import { Section } from '../components/Section';
import { ScrollReveal } from '../components/ScrollReveal';
import { supabase } from '../lib/supabase';

interface Event {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  location: Record<string, string>;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  category: string;
  tags: string[];
  cover_image?: string;
}

interface BlogPost {
  id: string;
  slug: string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  cover_image: string;
  published_at: string;
}

type FeedItem = (Event | BlogPost) & { type: 'event' | 'post' };

export const News = () => {
  const { t, i18n } = useTranslation();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'events' | 'posts'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeedItems();
  }, [i18n.language]);

  const getLocale = () => {
    switch (i18n.language) {
      case 'de': return de;
      case 'fr': return fr;
      case 'it': return it;
      default: return enUS;
    }
  };

  const fetchFeedItems = async () => {
    try {
      const [eventsRes, postsRes] = await Promise.all([
        supabase
          .from('events')
          .select('*')
          .gte('end_date', new Date().toISOString().split('T')[0])
          .order('start_date', { ascending: true }),
        supabase
          .from('blog_posts')
          .select('*')
          .not('published_at', 'is', null)
          .order('published_at', { ascending: false })
      ]);

      if (eventsRes.error) throw eventsRes.error;
      if (postsRes.error) throw postsRes.error;

      const events = (eventsRes.data || []).map(event => ({
        ...event,
        type: 'event' as const
      }));

      const posts = (postsRes.data || []).map(post => ({
        ...post,
        type: 'post' as const
      }));

      setFeedItems([...events, ...posts]);
    } catch (err) {
      console.error('Error fetching feed items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = feedItems.filter(item => {
    if (filter !== 'all' && item.type !== filter.slice(0, -1)) return false;

    const searchLower = searchTerm.toLowerCase();
    const lang = i18n.language;

    if (item.type === 'event') {
      return (
        item.title[lang]?.toLowerCase().includes(searchLower) ||
        item.description[lang]?.toLowerCase().includes(searchLower) ||
        item.location[lang]?.toLowerCase().includes(searchLower) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    } else {
      return (
        item.title[lang]?.toLowerCase().includes(searchLower) ||
        item.excerpt[lang]?.toLowerCase().includes(searchLower)
      );
    }
  });

  // Group events by time period
  const today = startOfToday();
  const nextWeek = addDays(today, 7);
  const nextMonth = addDays(today, 30);

  const upcomingEvents = filteredItems
    .filter(item => item.type === 'event')
    .reduce((acc, event) => {
      const startDate = new Date(event.start_date);
      if (isBefore(startDate, nextWeek)) {
        acc.thisWeek.push(event);
      } else if (isBefore(startDate, nextMonth)) {
        acc.thisMonth.push(event);
      } else {
        acc.later.push(event);
      }
      return acc;
    }, {
      thisWeek: [] as Event[],
      thisMonth: [] as Event[],
      later: [] as Event[],
    });

  // Get latest blog posts
  const latestPosts = filteredItems
    .filter(item => item.type === 'post')
    .slice(0, 3);

  // Get remaining blog posts
  const morePosts = filteredItems
    .filter(item => item.type === 'post')
    .slice(3);

  return (
    <div className="min-h-screen py-12 md:py-24">
      <Section variant="secondary">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-display mb-4">
                Aktuelles aus Airole
              </h1>
              <p className="text-lg text-primary/80">
                Entdecken Sie die neuesten Ereignisse und Geschichten aus unserem 
                malerischen Dorf
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {/* Filter */}
              <div className="relative flex-1 sm:flex-initial">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as typeof filter)}
                  className="w-full sm:w-auto appearance-none bg-white pl-10 pr-4 py-2 
                           rounded-lg border border-gray-300 focus:border-accent 
                           focus:ring focus:ring-accent/20"
                >
                  <option value="all">Alle Beiträge</option>
                  <option value="events">Nur Veranstaltungen</option>
                  <option value="posts">Nur Blog</option>
                </select>
              </div>

              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Suchen..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 
                           focus:border-accent focus:ring focus:ring-accent/20"
                />
              </div>
            </div>
          </ScrollReveal>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent 
                           rounded-full animate-spin" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-primary/60">
              Keine Einträge gefunden
            </div>
          ) : (
            <div className="space-y-16">
              {/* Featured Section */}
              {latestPosts.length > 0 && (
                <ScrollReveal>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <Star className="w-6 h-6 text-accent" />
                      <h2 className="text-2xl font-display">Aktuelle Beiträge</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {latestPosts.map((post) => (
                        <Link
                          key={post.id}
                          to={`/news/${post.slug}`}
                          className="block bg-white rounded-xl shadow-lg overflow-hidden 
                                   hover:shadow-xl transition-shadow group"
                        >
                          {post.cover_image && (
                            <div className="relative h-48">
                              <img
                                src={post.cover_image}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover 
                                         transition-transform duration-500 
                                         group-hover:scale-105"
                              />
                            </div>
                          )}
                          <div className="p-6">
                            <div className="flex items-center gap-2 text-sm text-accent mb-2">
                              <FileText className="w-4 h-4" />
                              <span>
                                {format(new Date(post.published_at), 'dd. MMMM yyyy', {
                                  locale: getLocale()
                                })}
                              </span>
                            </div>

                            <h3 className="font-display text-xl mb-2 group-hover:text-accent 
                                         transition-colors">
                              {post.title[i18n.language]}
                            </h3>

                            <p className="text-primary/80 mb-4">
                              {post.excerpt[i18n.language]}
                            </p>

                            <div className="flex items-center gap-1 text-accent">
                              <span>Weiterlesen</span>
                              <ArrowRight className="w-4 h-4 transition-transform 
                                                   group-hover:translate-x-1" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* This Week's Events */}
              {upcomingEvents.thisWeek.length > 0 && (
                <ScrollReveal>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-accent" />
                      <h2 className="text-2xl font-display">Diese Woche</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {upcomingEvents.thisWeek.map((event) => (
                        <div
                          key={event.id}
                          className="bg-white rounded-xl shadow-lg overflow-hidden"
                        >
                          {event.cover_image && (
                            <div className="relative h-48">
                              <img
                                src={event.cover_image}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="p-6">
                            <div className="flex items-center gap-2 text-sm text-accent mb-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {format(new Date(event.start_date), 'dd. MMMM yyyy', {
                                  locale: getLocale()
                                })}
                                {event.start_date !== event.end_date && (
                                  <>
                                    {' – '}
                                    {format(new Date(event.end_date), 'dd. MMMM yyyy', {
                                      locale: getLocale()
                                    })}
                                  </>
                                )}
                              </span>
                            </div>

                            <h3 className="font-display text-xl mb-2">
                              {event.title[i18n.language]}
                            </h3>

                            <p className="text-primary/80 mb-4">
                              {event.description[i18n.language]}
                            </p>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-primary/60">
                                <MapPin className="w-4 h-4" />
                                <span>{event.location[i18n.language]}</span>
                              </div>
                              {event.start_time && (
                                <div className="flex items-center gap-2 text-sm text-primary/60">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {event.start_time}
                                    {event.end_time && ` – ${event.end_time}`}
                                  </span>
                                </div>
                              )}
                              {event.tags && event.tags.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-primary/60">
                                  <Tag className="w-4 h-4" />
                                  <div className="flex flex-wrap gap-1">
                                    {event.tags.map(tag => (
                                      <span
                                        key={tag}
                                        className="px-2 py-0.5 bg-accent/10 rounded-full"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* This Month's Events */}
              {upcomingEvents.thisMonth.length > 0 && (
                <ScrollReveal>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-6 h-6 text-accent" />
                      <h2 className="text-2xl font-display">Diesen Monat</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {upcomingEvents.thisMonth.map((event) => (
                        <div
                          key={event.id}
                          className="bg-white rounded-xl shadow-lg overflow-hidden"
                        >
                          <div className="p-6">
                            <div className="flex items-center gap-2 text-sm text-accent mb-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {format(new Date(event.start_date), 'dd. MMMM yyyy', {
                                  locale: getLocale()
                                })}
                              </span>
                            </div>

                            <h3 className="font-display text-lg mb-2">
                              {event.title[i18n.language]}
                            </h3>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-primary/60">
                                <MapPin className="w-4 h-4" />
                                <span>{event.location[i18n.language]}</span>
                              </div>
                              {event.start_time && (
                                <div className="flex items-center gap-2 text-sm text-primary/60">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {event.start_time}
                                    {event.end_time && ` – ${event.end_time}`}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* Future Events */}
              {upcomingEvents.later.length > 0 && (
                <ScrollReveal>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="w-6 h-6 text-accent" />
                      <h2 className="text-2xl font-display">Weitere Termine</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {upcomingEvents.later.map((event) => (
                        <div
                          key={event.id}
                          className="bg-white rounded-xl shadow-lg overflow-hidden"
                        >
                          <div className="p-4">
                            <div className="flex items-center gap-2 text-sm text-accent mb-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {format(new Date(event.start_date), 'dd. MMMM yyyy', {
                                  locale: getLocale()
                                })}
                              </span>
                            </div>

                            <h3 className="font-display text-base mb-2">
                              {event.title[i18n.language]}
                            </h3>

                            <div className="flex items-center gap-2 text-sm text-primary/60">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location[i18n.language]}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* More Blog Posts */}
              {morePosts.length > 0 && (
                <ScrollReveal>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <FileText className="w-6 h-6 text-accent" />
                      <h2 className="text-2xl font-display">Weitere Beiträge</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {morePosts.map((post) => (
                        <Link
                          key={post.id}
                          to={`/news/${post.slug}`}
                          className="block bg-white rounded-xl shadow-lg overflow-hidden 
                                   hover:shadow-xl transition-shadow group"
                        >
                          <div className="p-6">
                            <div className="flex items-center gap-2 text-sm text-accent mb-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {format(new Date(post.published_at), 'dd. MMMM yyyy', {
                                  locale: getLocale()
                                })}
                              </span>
                            </div>

                            <h3 className="font-display text-lg mb-2 group-hover:text-accent 
                                         transition-colors">
                              {post.title[i18n.language]}
                            </h3>

                            <p className="text-primary/80 line-clamp-2">
                              {post.excerpt[i18n.language]}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
};
