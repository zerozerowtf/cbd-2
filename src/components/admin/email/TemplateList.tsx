import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Edit2, Eye, Globe2, Plus, AlertCircle } from 'lucide-react';
import { ScrollReveal } from '../../ScrollReveal';
import { Dialog } from '../../Dialog';
import { TemplateForm } from './TemplateForm';

interface EmailTemplate {
  id: string;
  name: string;
  type: string;
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

const typeLabels = {
  booking: 'Buchung',
  payment: 'Zahlung',
  info: 'Information',
};

export const TemplateList = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('type', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Fehler beim Laden der Vorlagen');
    } finally {
      setIsLoading(false);
    }
  };

  // Group templates by type
  const groupedTemplates = templates.reduce((acc, template) => {
    const type = template.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(template);
    return acc;
  }, {} as Record<string, EmailTemplate[]>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-accent text-secondary px-4 py-2 
                   rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Neue Vorlage</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent 
                       rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTemplates).map(([type, templates]) => (
            <div key={type} className="space-y-4">
              <h2 className="text-xl font-display flex items-center gap-2">
                <span>{typeLabels[type as keyof typeof typeLabels]}</span>
                <span className="text-sm font-normal text-primary/60">
                  ({templates.length})
                </span>
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {templates.map((template) => (
                  <ScrollReveal key={template.id}>
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-lg">{template.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-primary/60 mt-1">
                              <div className="flex items-center gap-1">
                                <Globe2 className="w-4 h-4" />
                                <span>4 Sprachen</span>
                              </div>
                              <span>•</span>
                              <span className={template.is_active ? 'text-emerald-600' : 'text-red-600'}>
                                {template.is_active ? 'Aktiv' : 'Inaktiv'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              to={`/admin/email-templates/${template.name}/preview`}
                              className="p-2 rounded-lg hover:bg-primary/5 transition-colors"
                              title="Vorschau"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedTemplate(template);
                                setShowForm(true);
                              }}
                              className="p-2 rounded-lg hover:bg-primary/5 transition-colors"
                              title="Bearbeiten"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 bg-primary/5 rounded-lg p-4">
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium">Betreff (DE):</span>
                              <p className="text-sm text-primary/80">{template.subject_de}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Inhalt (DE):</span>
                              <p className="text-sm text-primary/80 line-clamp-2">{template.body_de}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Form Dialog */}
      <Dialog
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedTemplate(null);
        }}
        title={selectedTemplate ? 'Template bearbeiten' : 'Neues Template'}
        size="2xl"
      >
        <TemplateForm
          initialData={selectedTemplate}
          onClose={() => {
            setShowForm(false);
            setSelectedTemplate(null);
          }}
          onSuccess={() => {
            fetchTemplates();
            setShowForm(false);
            setSelectedTemplate(null);
          }}
        />
      </Dialog>
    </div>
  );
};
