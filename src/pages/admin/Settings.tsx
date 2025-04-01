import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Key, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertCircle,
  Loader2,
  User,
  Euro,
  Globe2,
  Settings as SettingsIcon
} from 'lucide-react';
import { Section } from '../../components/Section';
import { ScrollReveal } from '../../components/ScrollReveal';
import { Dialog } from '../../components/Dialog';
import { PaymentSettings } from '../../components/admin/settings/PaymentSettings';
import { supabase } from '../../lib/supabase';

interface AdminUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: string;
}

interface AdminFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export const Settings = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminFormData, setAdminFormData] = useState<AdminFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin');

      if (error) throw error;
      setAdmins(data || []);
    } catch (err) {
      console.error('Error fetching admins:', err);
      setError('Die Administratoren konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form data
      if (!adminFormData.email || !adminFormData.password || !adminFormData.firstName || !adminFormData.lastName) {
        throw new Error('Bitte füllen Sie alle Pflichtfelder aus.');
      }

      if (adminFormData.password.length < 8) {
        throw new Error('Das Passwort muss mindestens 8 Zeichen lang sein.');
      }

      if (adminFormData.password !== adminFormData.confirmPassword) {
        throw new Error('Die Passwörter stimmen nicht überein.');
      }

      // Create auth user with admin role
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminFormData.email,
        password: adminFormData.password,
        options: {
          data: {
            role: 'admin',
            first_name: adminFormData.firstName,
            last_name: adminFormData.lastName,
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error('Diese E-Mail-Adresse wird bereits verwendet.');
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Der Administrator konnte nicht erstellt werden.');
      }

      // Add user to users table
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: authData.user.email,
          first_name: adminFormData.firstName,
          last_name: adminFormData.lastName,
          role: 'admin',
          is_active: true
        }]);

      if (userError) {
        // Rollback auth user creation
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw userError;
      }

      // Update user metadata and claims
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        authData.user.id,
        {
          user_metadata: {
            role: 'admin',
            first_name: adminFormData.firstName,
            last_name: adminFormData.lastName,
          },
          app_metadata: {
            role: 'admin',
            claims: {
              role: 'admin'
            }
          }
        }
      );

      if (updateError) {
        console.error('Error updating user metadata:', updateError);
      }

      await fetchAdmins();
      setShowAdminForm(false);
      setAdminFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
      });
    } catch (err) {
      console.error('Error creating admin:', err);
      setError(err instanceof Error ? err.message : 'Der Administrator konnte nicht erstellt werden.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Möchten Sie diesen Administrator wirklich löschen?')) {
      return;
    }

    try {
      setError(null);

      // Delete from users table first
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (userError) throw userError;

      // Then delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(id);
      if (authError) throw authError;

      await fetchAdmins();
    } catch (err) {
      console.error('Error deleting admin:', err);
      setError('Der Administrator konnte nicht gelöscht werden. Bitte versuchen Sie es später erneut.');
    }
  };

  return (
    <div className="py-16 sm:py-24">
      <Section variant="secondary">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-accent/10 p-3 rounded-lg">
                <SettingsIcon className="w-6 h-6 text-accent" />
              </div>
              <h1 className="text-2xl md:text-3xl font-display">Einstellungen</h1>
            </div>
          </ScrollReveal>

          {/* Payment Settings */}
          <ScrollReveal>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <Euro className="w-6 h-6 text-accent" />
                </div>
                <h2 className="text-xl font-display">Zahlungseinstellungen</h2>
              </div>

              <PaymentSettings />
            </div>
          </ScrollReveal>

          {/* Admin Users */}
          <ScrollReveal>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-accent/10 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <h2 className="text-xl font-display">Administratoren</h2>
                </div>
                <button
                  onClick={() => setShowAdminForm(true)}
                  className="flex items-center gap-2 bg-accent text-secondary px-4 py-2 
                           rounded-lg hover:bg-accent/90 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Administrator hinzufügen</span>
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-12 h-12 border-4 border-accent border-t-transparent 
                               rounded-full animate-spin" />
                </div>
              ) : admins.length === 0 ? (
                <div className="text-center py-12 text-primary/60">
                  Keine Administratoren gefunden
                </div>
              ) : (
                <div className="space-y-4">
                  {admins.map((admin) => (
                    <div 
                      key={admin.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-accent/10 p-2 rounded-lg">
                          <User className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {admin.first_name} {admin.last_name}
                            </span>
                            <span className="px-2 py-0.5 text-xs rounded-full bg-accent/10">
                              Administrator
                            </span>
                          </div>
                          <div className="text-sm text-primary/60 mt-1">
                            {admin.email}
                          </div>
                          <div className="text-sm text-primary/60">
                            Erstellt am: {new Date(admin.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg 
                                 transition-colors"
                        title="Administrator löschen"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </Section>

      {/* Add Admin Dialog */}
      <Dialog
        isOpen={showAdminForm}
        onClose={() => {
          setShowAdminForm(false);
          setAdminFormData({
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
          });
          setError(null);
        }}
        title="Administrator hinzufügen"
        size="md"
      >
        <form onSubmit={handleAdminSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 p-4 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Vorname
              </label>
              <input
                type="text"
                value={adminFormData.firstName}
                onChange={(e) => setAdminFormData(prev => ({
                  ...prev,
                  firstName: e.target.value,
                }))}
                className="w-full rounded-lg border-gray-300 focus:border-accent 
                         focus:ring focus:ring-accent/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Nachname
              </label>
              <input
                type="text"
                value={adminFormData.lastName}
                onChange={(e) => setAdminFormData(prev => ({
                  ...prev,
                  lastName: e.target.value,
                }))}
                className="w-full rounded-lg border-gray-300 focus:border-accent 
                         focus:ring focus:ring-accent/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              E-Mail
            </label>
            <div className="relative">
              <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
              <input
                type="email"
                value={adminFormData.email}
                onChange={(e) => setAdminFormData(prev => ({
                  ...prev,
                  email: e.target.value,
                }))}
                className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 
                         focus:border-accent focus:ring focus:ring-accent/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Passwort
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
              <input
                type="password"
                value={adminFormData.password}
                onChange={(e) => setAdminFormData(prev => ({
                  ...prev,
                  password: e.target.value,
                }))}
                className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 
                         focus:border-accent focus:ring focus:ring-accent/20"
                required
                minLength={8}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Passwort bestätigen
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
              <input
                type="password"
                value={adminFormData.confirmPassword}
                onChange={(e) => setAdminFormData(prev => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))}
                className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 
                         focus:border-accent focus:ring focus:ring-accent/20"
                required
                minLength={8}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                setShowAdminForm(false);
                setAdminFormData({
                  email: '',
                  password: '',
                  confirmPassword: '',
                  firstName: '',
                  lastName: '',
                });
                setError(null);
              }}
              className="px-4 py-2 rounded-lg text-primary/60 
                       hover:text-primary transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-accent text-secondary px-4 py-2 
                       rounded-lg hover:bg-accent/90 transition-colors 
                       disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Wird erstellt...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Administrator erstellen</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
