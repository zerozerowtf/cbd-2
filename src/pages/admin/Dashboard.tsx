import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  Users, 
  Mail, 
  Phone, 
  Globe2, 
  Calendar,
  Download,
  Search,
  AlertCircle,
  Plus,
  Clock,
  Ban,
  Euro,
  CheckCircle,
  XCircle,
  ArrowRight,
  MessageSquare,
  Edit2,
  Percent
} from 'lucide-react';
import { Section } from '../../components/Section';
import { ScrollReveal } from '../../components/ScrollReveal';
import { supabase } from '../../lib/supabase';

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  upcomingArrivals: number;
  upcomingDepartures: number;
  unreadMessages: number;
  totalRevenue: number;
  averageStay: number;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'message' | 'payment' | 'booking_update';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  amount?: number;
  reference?: string;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    upcomingArrivals: 0,
    upcomingDepartures: 0,
    unreadMessages: 0,
    totalRevenue: 0,
    averageStay: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats and activity in parallel
      const [bookingsRes, messagesRes, paymentsRes] = await Promise.all([
        supabase
          .from('booking_details')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('messages')
          .select('*')
          .eq('is_read', false)
          .order('created_at', { ascending: false }),
        supabase
          .from('booking_details')
          .select('*')
          .in('status', ['confirmed'])
          .order('created_at', { ascending: false })
      ]);

      if (bookingsRes.error) throw bookingsRes.error;
      if (messagesRes.error) throw messagesRes.error;
      if (paymentsRes.error) throw paymentsRes.error;

      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Calculate stats
      const stats: DashboardStats = {
        totalBookings: bookingsRes.data?.length || 0,
        pendingBookings: bookingsRes.data?.filter(b => b.status === 'pending').length || 0,
        upcomingArrivals: bookingsRes.data?.filter(b => 
          new Date(b.start_date) >= now && 
          new Date(b.start_date) <= nextWeek &&
          b.status === 'confirmed'
        ).length || 0,
        upcomingDepartures: bookingsRes.data?.filter(b => 
          new Date(b.end_date) >= now && 
          new Date(b.end_date) <= nextWeek &&
          b.status === 'confirmed'
        ).length || 0,
        unreadMessages: messagesRes.data?.length || 0,
        totalRevenue: paymentsRes.data?.reduce((sum, b) => sum + b.total_price, 0) || 0,
        averageStay: paymentsRes.data?.reduce((sum, b) => {
          const nights = Math.ceil(
            (new Date(b.end_date).getTime() - new Date(b.start_date).getTime()) / 
            (1000 * 60 * 60 * 24)
          );
          return sum + nights;
        }, 0) / (paymentsRes.data?.length || 1) || 0,
      };

      // Combine recent activity
      const activity: RecentActivity[] = [
        // Recent bookings
        ...(bookingsRes.data?.slice(0, 5).map(booking => ({
          id: booking.id,
          type: 'booking' as const,
          title: booking.status === 'pending' ? 'Neue Buchungsanfrage' : 'Buchung bestätigt',
          description: `${booking.first_name} ${booking.last_name}, ${format(new Date(booking.start_date), 'dd.MM.')} - ${format(new Date(booking.end_date), 'dd.MM.yyyy')}`,
          timestamp: booking.created_at,
          status: booking.status,
          reference: booking.reference
        })) || []),

        // Recent messages
        ...(messagesRes.data?.slice(0, 5).map(message => ({
          id: message.id,
          type: 'message' as const,
          title: 'Neue Nachricht',
          description: `Von ${message.name}: ${message.subject}`,
          timestamp: message.created_at
        })) || []),

        // Recent payments
        ...(paymentsRes.data?.filter(b => b.deposit_paid || b.remaining_paid)
          .slice(0, 5)
          .map(booking => ({
            id: booking.id,
            type: 'payment' as const,
            title: booking.deposit_paid ? 'Anzahlung eingegangen' : 'Restzahlung eingegangen',
            description: `${booking.first_name} ${booking.last_name}, ${booking.reference}`,
            timestamp: booking.deposit_paid ? booking.deposit_paid_at : booking.remaining_paid_at,
            amount: booking.deposit_paid ? booking.deposit_amount : booking.remaining_amount
          })) || []),

        // Recent booking updates
        ...(bookingsRes.data?.filter(b => b.updated_at !== b.created_at)
          .slice(0, 5)
          .map(booking => {
            const changes: { field: string; oldValue: string; newValue: string; }[] = [];
            
            // Track price changes
            if (booking.total_price !== booking.total_price) {
              changes.push({
                field: 'Preis',
                oldValue: `${booking.total_price} €`,
                newValue: `${booking.total_price} €`
              });
            }

            // Track manual discount changes
            if (booking.manual_discount_percentage > 0) {
              changes.push({
                field: 'Rabatt',
                oldValue: '0%',
                newValue: `${booking.manual_discount_percentage}%`
              });
            }

            return {
              id: booking.id,
              type: 'booking_update' as const,
              title: 'Buchung bearbeitet',
              description: `${booking.first_name} ${booking.last_name}, ${booking.reference}`,
              timestamp: booking.updated_at,
              changes
            };
          }) || [])
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
       .slice(0, 10);

      setStats(stats);
      setRecentActivity(activity);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Fehler beim Laden der Dashboard-Daten');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent 
                     rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-4">
      <Section variant="secondary">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <h1 className="text-2xl md:text-3xl font-display mb-6">Dashboard</h1>
          </ScrollReveal>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <ScrollReveal>
              <button
                onClick={() => navigate('/admin/bookings?status=pending')}
                className="bg-white p-4 rounded-xl shadow hover:shadow-lg 
                         transition-all duration-300 transform hover:scale-105 
                         group w-full h-full"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-amber-100 p-2 rounded-lg text-amber-800">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-semibold">{stats.pendingBookings}</span>
                </div>
                <h3 className="text-sm text-primary/80 group-hover:text-primary 
                             transition-colors">
                  Offene Anfragen
                </h3>
              </button>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <button
                onClick={() => navigate('/admin/bookings')}
                className="bg-white p-4 rounded-xl shadow hover:shadow-lg 
                         transition-all duration-300 transform hover:scale-105 
                         group w-full h-full"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-800">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-semibold">{stats.upcomingArrivals}</span>
                </div>
                <h3 className="text-sm text-primary/80 group-hover:text-primary 
                             transition-colors">
                  Anreisen diese Woche
                </h3>
              </button>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <button
                onClick={() => navigate('/admin/messages')}
                className="bg-white p-4 rounded-xl shadow hover:shadow-lg 
                         transition-all duration-300 transform hover:scale-105 
                         group w-full h-full"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-800">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-semibold">{stats.unreadMessages}</span>
                </div>
                <h3 className="text-sm text-primary/80 group-hover:text-primary 
                             transition-colors">
                  Ungelesene Nachrichten
                </h3>
              </button>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-accent/10 p-2 rounded-lg">
                    <Euro className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-2xl font-semibold">
                    {new Intl.NumberFormat('de-DE').format(stats.totalRevenue)} €
                  </span>
                </div>
                <h3 className="text-sm text-primary/80">
                  Gesamtumsatz
                </h3>
              </div>
            </ScrollReveal>
          </div>

          {/* Recent Activity */}
          <ScrollReveal>
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-display mb-6">Letzte Aktivitäten</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div 
                    key={`${activity.type}-${activity.id}-${index}`}
                    className="flex flex-col sm:flex-row items-start gap-3 p-3 
                             bg-secondary/50 rounded-lg"
                  >
                    <div className={`p-2 rounded-lg text-white flex-shrink-0 ${
                      activity.type === 'booking' 
                        ? activity.status === 'pending' ? 'bg-amber-500' : 'bg-emerald-500'
                        : activity.type === 'message' ? 'bg-blue-500'
                        : activity.type === 'payment' ? 'bg-accent'
                        : 'bg-purple-500'
                    }`}>
                      {activity.type === 'booking' ? <Calendar className="w-5 h-5" /> :
                       activity.type === 'message' ? <MessageSquare className="w-5 h-5" /> :
                       activity.type === 'payment' ? <Euro className="w-5 h-5" /> :
                       <Edit2 className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0 flex-grow">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <p className="font-medium truncate">{activity.title}</p>
                        <p className="text-sm text-primary/60">
                          {format(new Date(activity.timestamp), 'dd.MM.yyyy HH:mm', { locale: de })}
                        </p>
                      </div>
                      <p className="text-sm text-primary/80 mt-1 break-words">
                        {activity.description}
                      </p>
                      {activity.amount && (
                        <p className="text-sm font-medium text-emerald-600 mt-1">
                          + {activity.amount} €
                        </p>
                      )}
                      {activity.changes && activity.changes.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {activity.changes.map((change, i) => (
                            <div key={i} className="text-sm">
                              <span className="text-primary/60">{change.field}:</span>{' '}
                              <span className="line-through text-red-600">{change.oldValue}</span>{' '}
                              <span className="text-emerald-600">{change.newValue}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (activity.type === 'booking' || activity.type === 'booking_update') {
                          navigate(`/admin/bookings?id=${activity.id}`);
                        } else if (activity.type === 'message') {
                          navigate(`/admin/messages?id=${activity.id}`);
                        }
                      }}
                      className="sm:self-center p-2 hover:bg-primary/5 rounded-lg 
                               transition-colors"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                {recentActivity.length === 0 && (
                  <div className="text-center py-4 text-primary/60">
                    Keine aktuellen Aktivitäten
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <ScrollReveal>
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-display mb-6">Buchungsstatistik</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-primary/80">Durchschnittliche Aufenthaltsdauer</span>
                    <span className="font-medium">
                      {Math.round(stats.averageStay * 10) / 10} Nächte
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-primary/80">Bestätigungsquote</span>
                    <span className="font-medium">
                      {Math.round((stats.totalBookings - stats.pendingBookings) / stats.totalBookings * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-primary/80">Durchschnittlicher Umsatz pro Buchung</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('de-DE').format(
                        Math.round(stats.totalRevenue / stats.totalBookings)
                      )} €
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-display mb-6">Auslastung</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-primary/80">Aktuelle Woche</span>
                    <span className="font-medium">
                      {stats.upcomingArrivals} Anreisen, {stats.upcomingDepartures} Abreisen
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-primary/80">Offene Anfragen</span>
                    <span className="font-medium">{stats.pendingBookings}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-primary/80">Ungelesene Nachrichten</span>
                    <span className="font-medium">{stats.unreadMessages}</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </Section>
    </div>
  );
};
