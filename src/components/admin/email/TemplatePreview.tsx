import React, { useState, useEffect } from 'react';
import { Globe2, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface TemplatePreviewProps {
  templateId: string;
  language?: string;
  testData?: Record<string, any>;
  onClose: () => void;
}

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
  booking_request: {
    first_name: 'Max',
    last_name: 'Mustermann',
    check_in_date: '15.06.2025',
    check_out_date: '22.06.2025',
    adults: '2',
    children: '1',
    total_price: '980',
    room_type: 'Hauptwohnung + Nebenzimmer',
    selected_services: ['Endreinigung', 'Willkommenspaket'],
  },
  booking_confirmation: {
    first_name: 'Max',
    last_name: 'Mustermann',
    check_in_date: '15.06.2025',
    check_out_date: '22.06.2025',
    adults: '2',
    children: '1',
    total_price: '980',
    deposit_amount: '490',
    remaining_amount: '490',
    deposit_due_date: '22.05.2025',
    remaining_due_date: '15.05.2025',
    room_type: 'Hauptwohnung + Nebenzimmer',
    selected_services: ['Endreinigung', 'Willkommenspaket'],
  },
  message_reply: {
    name: 'Max Mustermann',
    subject: 'Ihre Anfrage',
    reply: 'Vielen Dank für Ihre Nachricht. Wir freuen uns, Ihnen mitteilen zu können, dass...',
  },
  contact_confirmation: {
    name: 'Max Mustermann',
    subject: 'Verfügbarkeitsanfrage',
    message: 'Ich interessiere mich für einen Aufenthalt im Juni 2025...',
  },
};

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  templateId,
  language = 'de',
  testData,
  onClose,
}) => {
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processedContent, setProcessedContent] = useState({
    subject: '',
    body: '',
  });

  useEffect(() => {
    fetchTemplate();
  }, [templateId]);

  useEffect(() => {
    if (template) {
      processTemplate();
    }
  }, [template, selectedLanguage, testData]);

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

    // Get default test data for template type
    const defaultData = defaultTestData[template.name as keyof typeof defaultTestData] || {};
    const mergedData = { ...defaultData, ...testData };

    // Process conditional blocks
    body = body.replace(
      /{{#if ([^}]+)}}(.*?){{\/if}}/gs,
      (match, condition, content) => {
        const value = mergedData[condition];
        return value ? content : '';
      }
    );

    // Process arrays
    body = body.replace(
      /{{#each ([^}]+)}}(.*?){{\/each}}/gs,
      (match, array, content) => {
        const items = mergedData[array];
        if (!Array.isArray(items)) return '';
        return items.map(item => {
          let itemContent = content;
          itemContent = itemContent.replace(/{{this}}/g, item);
          return itemContent;
        }).join('\n');
      }
    );

    // Replace variables in subject and body
    Object.entries(mergedData).forEach(([key, value]) => {
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
        <button
          onClick={onClose}
          className="mt-4 w-full bg-accent text-secondary px-4 py-2 rounded-lg"
        >
          Schließen
        </button>
      </div>
    );
  }

  const emailAddress = "casadibarbara@zerozero.wtf";
  const senderName = "Casa di Barbara";

  return (
    <div className="fixed inset-0 z-50 bg-primary/90 backdrop-blur-sm overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-primary">
          <h2 className="text-xl font-display text-secondary">Template Vorschau</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-secondary hover:bg-primary-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-4 p-6 bg-primary border-t border-secondary/10">
          <Globe2 className="w-5 h-5 text-secondary/60" />
          <div className="flex gap-2">
            {Object.entries(languageLabels).map(([code, label]) => (
              <button
                key={code}
                onClick={() => setSelectedLanguage(code)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  selectedLanguage === code
                    ? 'bg-accent text-secondary'
                    : 'text-secondary hover:bg-primary-light'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Test Data Overview */}
        <div className="p-6 bg-primary border-t border-secondary/10">
          <h3 className="font-medium text-secondary mb-3">Testdaten:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(defaultTestData[template.name as keyof typeof defaultTestData] || {}).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                <code className="font-mono text-accent bg-primary-light px-1.5 py-0.5 rounded">
                  {'{{' + key + '}}'}
                </code>
                <span className="text-secondary/60">=</span>
                <span className="text-secondary">
                  {Array.isArray(value) ? value.join(', ') : value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Email Preview */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl">
            {/* Email Header */}
            <div className="bg-primary text-secondary p-6">
              <h3 className="text-lg font-medium">
                {processedContent.subject}
              </h3>
              <p className="text-sm text-secondary/80 mt-1">
                Von: {senderName} ({emailAddress})
              </p>
            </div>

            {/* Email Content */}
            <div 
              dangerouslySetInnerHTML={{ __html: processedContent.body }}
              className="p-6"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
