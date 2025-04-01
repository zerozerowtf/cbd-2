import React, { useState } from 'react';
import { testEmailConnection, sendEmail } from '../../lib/email';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Section } from '../../components/Section';
import { ScrollReveal } from '../../components/ScrollReveal';

export const EmailTest: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string>('idle');
  
  // Form state for email test
  const [emailData, setEmailData] = useState({
    to: '',
    subject: 'Test E-Mail von Casa di Barbara',
    content: 'Dies ist eine Test-E-Mail, um zu prüfen, ob die E-Mail-Funktion korrekt funktioniert.'
  });

  // Handler for connection test
  const handleTestConnection = async () => {
    setLoading(true);
    setTestResult(null);
    setEmailStatus('testing');
    
    try {
      // Add environment info for error analysis
      console.log('Environment info:', {
        'User Agent': navigator.userAgent,
        'Origin': window.location.origin,
        'Supabase URL': import.meta.env.VITE_SUPABASE_URL,
      });
      
      const result = await testEmailConnection();
      console.log('Connection test result:', result);
      setTestResult(result);
      setEmailStatus(result.success ? 'success' : 'error');
    } catch (error) {
      console.error('Connection test error:', error);
      setTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
      setEmailStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Handler for form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmailData(prev => ({ ...prev, [name]: value }));
  };

  // Handler for sending a test email
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTestResult(null);
    setEmailStatus('sending');
    
    try {
      const result = await sendEmail({
        to: emailData.to,
        subject: emailData.subject,
        content: emailData.content,
      });
      console.log('Email send result:', result);
      setTestResult(result);
      setEmailStatus(result.success ? 'success' : 'error');
    } catch (error) {
      console.error('Email send error:', error);
      setTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
      setEmailStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 sm:py-24">
      <Section variant="secondary">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h1 className="text-2xl md:text-3xl font-display mb-8">E-Mail-System Test</h1>
          </ScrollReveal>
          
          {/* SMTP Connection Test */}
          <ScrollReveal>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-display mb-4">SMTP-Verbindungstest</h2>
              <p className="mb-6 text-primary/80">
                Dieser Test prüft, ob die SMTP-Verbindung zum E-Mail-Server funktioniert, 
                ohne eine E-Mail zu versenden.
              </p>
              
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-accent text-secondary hover:bg-accent/90'
                } transition-colors`}
                onClick={handleTestConnection}
                disabled={loading}
              >
                {loading && emailStatus === 'testing' ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Teste Verbindung...</span>
                  </>
                ) : (
                  <span>SMTP-Verbindung testen</span>
                )}
              </button>
            </div>
          </ScrollReveal>
          
          {/* Email Form */}
          <ScrollReveal>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-display mb-4">Test-E-Mail senden</h2>
              
              <form onSubmit={handleSendTestEmail} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary/80 mb-2">
                    Empfänger-E-Mail
                  </label>
                  <input
                    type="email"
                    name="to"
                    value={emailData.to}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-gray-300 shadow-sm 
                             focus:border-accent focus:ring focus:ring-accent/20"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary/80 mb-2">
                    Betreff
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={emailData.subject}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-gray-300 shadow-sm 
                             focus:border-accent focus:ring focus:ring-accent/20"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary/80 mb-2">
                    Inhalt
                  </label>
                  <textarea
                    name="content"
                    rows={4}
                    value={emailData.content}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-gray-300 shadow-sm 
                             focus:border-accent focus:ring focus:ring-accent/20"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !emailData.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    loading || !emailData.to
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-accent text-secondary hover:bg-accent/90'
                  } transition-colors`}
                >
                  {loading && emailStatus === 'sending' ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Sende E-Mail...</span>
                    </>
                  ) : (
                    <span>Test-E-Mail senden</span>
                  )}
                </button>
              </form>
            </div>
          </ScrollReveal>
          
          {/* Test Result */}
          {testResult && (
            <ScrollReveal>
              <div className={`bg-white rounded-xl shadow-lg p-6 ${
                testResult.success 
                  ? 'border-l-4 border-emerald-500' 
                  : 'border-l-4 border-red-500'
              }`}>
                <h2 className="text-xl font-display mb-4">Testergebnis</h2>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-4 h-4 rounded-full ${
                    testResult.success ? 'bg-emerald-500' : 'bg-red-500'
                  }`} />
                  <span className="font-medium">
                    {testResult.success ? 'Erfolgreich' : 'Fehler'}
                  </span>
                </div>
                
                {testResult.message && (
                  <div className="mb-4">
                    <h3 className="font-medium text-primary/80 mb-2">Nachricht:</h3>
                    <p className="text-primary/60">{testResult.message}</p>
                  </div>
                )}
                
                {testResult.error && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <h3 className="font-medium">Fehlermeldung:</h3>
                    </div>
                    <p className="text-red-600">{testResult.error}</p>
                  </div>
                )}
                
                {testResult.timestamp && (
                  <div className="text-sm text-primary/60">
                    Zeitstempel: {new Date(testResult.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            </ScrollReveal>
          )}
        </div>
      </Section>
    </div>
  );
};
