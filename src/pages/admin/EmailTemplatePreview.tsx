import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Globe2, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface EmailTemplate {
  id: string;
  name: string;
  type: 'booking' | 'payment' | 'info';
  subject_de: string;
  subject_en: string;
  subject_fr: string;
  subject_it: string;
  body_de: string;
  body_en: string;
  body_fr: string;
  body_it: string;
  is_active: boolean;
}

const languageLabels = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
};

const defaultTestData = {
  name: 'Max Mustermann',
  first_name: 'Max',
  last_name: 'Mustermann',
  email: 'max.mustermann@example.com',
  subject: 'Buchungsanfrage',
  message: 'Dies ist eine Testnachricht.',
  check_in_date: '01.06.2025',
  check_out_date: '08.06.2025',
  adults: '2',
  children: '1',
  total_price: '980',
  deposit_amount: '490',
  remaining_amount: '490',
  deposit_due_date: '15.05.2025',
  remaining_due_date: '01.05.2025',
  room_type: 'Hauptwohnung + Nebenzimmer',
  selected_services: ['Endreinigung', 'Willkommenspaket'],
};

export const EmailTemplatePreview = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('de');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processedContent, setProcessedContent] = useState({
    subject: '',
    body: '',
  });

  useEffect(() => {
    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  useEffect(() => {
    if (template) {
      processTemplate();
    }
  }, [template, selectedLanguage]);

  const fetchTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('name', templateId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Template not found or inactive');
      
      setTemplate(data);
    } catch (err) {
      console.error('Error fetching template:', err);
      setError('Fehler beim Laden der Vorlage');
    } finally {
      setIsLoading(false);
    }
  };

  const processTemplate = () => {
    if (!template) return;

    let subject = template[`subject_${selectedLanguage}` as keyof EmailTemplate] as string;
    let body = template[`body_${selectedLanguage}` as keyof EmailTemplate] as string;

    // Process conditional blocks
    body = body.replace(
      /{{#if ([^}]+)}}(.*?){{\/if}}/gs,
      (match, condition, content) => {
        const value = defaultTestData[condition as keyof typeof defaultTestData];
        return value ? content : '';
      }
    );

    // Process arrays
    body = body.replace(
      /{{#each ([^}]+)}}(.*?){{\/each}}/gs,
      (match, array, content) => {
        const items = defaultTestData[array as keyof typeof defaultTestData];
        if (!Array.isArray(items)) return '';
        return items.map(item => {
          let itemContent = content;
          itemContent = itemContent.replace(/{{this}}/g, item);
          return itemContent;
        }).join('\n');
      }
    );

    // Replace variables in subject and body
    Object.entries(defaultTestData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, String(value));
      body = body.replace(regex, String(value));
    });

    setProcessedContent({ subject, body });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent 
                     rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error || 'Vorlage nicht gefunden'}</p>
        <Link
          to="/admin/email-templates"
          className="mt-4 inline-flex items-center gap-2 text-accent hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Zurück zu den Vorlagen
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/email-templates"
              className="p-2 rounded-lg hover:bg-primary/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-display">
              Template Vorschau
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Globe2 className="w-5 h-5 text-primary/60" />
            <div className="flex gap-2">
              {Object.entries(languageLabels).map(([code, label]) => (
                <button
                  key={code}
                  onClick={() => setSelectedLanguage(code)}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    selectedLanguage === code
                      ? 'bg-accent text-secondary'
                      : 'hover:bg-primary/5'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Test Data Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="font-medium text-lg mb-4">Testdaten:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(defaultTestData).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                <code className="font-mono text-accent bg-accent/5 px-1.5 py-0.5 rounded">
                  {'{{' + key + '}}'}
                </code>
                <span className="text-primary/60">=</span>
                <span>
                  {Array.isArray(value) ? value.join(', ') : value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Email Preview */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Email Header */}
          <div className="bg-primary text-secondary p-6">
            <h3 className="text-lg font-medium">
              {processedContent.subject}
            </h3>
            <p className="text-sm text-secondary/80 mt-1">
              Von: Casa di Barbara (casadibarbara@zerozero.wtf)
            </p>
          </div>

          {/* Email Content */}
          <div 
            dangerouslySetInnerHTML={{ __html: processedContent.body }}
            className="p-6 email-preview"
          />
        </div>
      </div>
    </div>
  );
};
