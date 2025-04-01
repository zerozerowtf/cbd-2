import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Section } from '../components/Section';
import { ScrollReveal } from '../components/ScrollReveal';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('test@test.de');
  const [password, setPassword] = useState('Test1234');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        navigate('/admin');
      }
    } catch (err) {
      setError('Ungültige Anmeldedaten');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Section variant="secondary" className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <ScrollReveal>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-display text-primary mb-2">
                Admin-Login
              </h1>
              <p className="text-primary/60">
                Melden Sie sich an, um auf den Admin-Bereich zuzugreifen
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-primary mb-2"
                >
                  E-Mail
                </label>
                <div className="relative">
                  <Mail 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 
                             text-primary/40 w-5 h-5" 
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 
                             focus:ring focus:ring-accent/20 focus:border-accent"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-primary mb-2"
                >
                  Passwort
                </label>
                <div className="relative">
                  <Lock 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 
                             text-primary/40 w-5 h-5" 
                  />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 
                             focus:ring focus:ring-accent/20 focus:border-accent"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent text-secondary py-2 rounded-lg font-medium
                         hover:bg-accent/90 transition-colors disabled:opacity-50 
                         disabled:cursor-not-allowed"
              >
                {isLoading ? 'Anmeldung...' : 'Anmelden'}
              </button>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </Section>
  );
};
