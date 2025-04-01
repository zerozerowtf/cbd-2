import React, { useState, useEffect } from 'react';
import { Section } from '../../../components/Section';
import { ScrollReveal } from '../../../components/ScrollReveal';
import { Plus, AlertCircle, Mail, Globe2, Edit2, Eye } from 'lucide-react';
import { Dialog } from '../../../components/Dialog';
import { TemplateForm } from '../../../components/admin/email/TemplateForm';
import { TemplatePreview } from '../../../components/admin/email/TemplatePreview';
import { getEmailTemplates } from '../../../lib/email';

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

export const EmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const templates = await getEmailTemplates();
      setTemplates(templates);
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
    <div className="py-16 sm:py-24">
      <Section variant="secondary">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-display">Email-Vorlagen</h1>
                <p className="text-primary/60 mt-1">
                  {templates.length} Vorlagen insgesamt
                </p>
              </div>

              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-accent text-secondary px-4 py-2 
                         rounded-lg hover:bg-accent/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Neue Vorlage</span>
              </button>
            </div>
          </ScrollReveal>

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
          ) : templates.length === 0 ? (
            <div className="text-center py-12 text-primary/60">
              Keine Vorlagen vorhanden
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedTemplates).map(([type, templates]) => (
                <ScrollReveal key={type}>
                  <div className="space-y-4">
                    <h2 className="text-xl font-display flex items-center gap-2">
                      <Mail className="w-6 h-6 text-accent" />
                      <span>{typeLabels[type as keyof typeof typeLabels]}</span>
                      <span className="text-sm font-normal text-primary/60">
                        ({templates.length})
                      </span>
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className="bg-white rounded-xl shadow-lg overflow-hidden"
                        >
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
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
                                <button
                                  onClick={() => {
                                    setSelectedTemplate(template);
                                    setShowPreview(true);
                                  }}
                                  className="p-2 rounded-lg hover:bg-primary/5 transition-colors"
                                  title="Vorschau"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
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

                            <div className="bg-primary/5 rounded-lg p-4">
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
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Preview Dialog */}
      <Dialog
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setSelectedTemplate(null);
        }}
        title="Template Vorschau"
        size="xl"
      >
        {selectedTemplate && (
          <TemplatePreview
            templateId={selectedTemplate.name}
            testData={{
              name: 'Max Mustermann',
              first_name: 'Max',
              last_name: 'Mustermann',
              subject: 'Buchungsanfrage',
              message: 'Dies ist eine Testnachricht.',
              check_in_date: '01.06.2025',
              check_out_date: '08.06.2025',
              adults: '2',
              children: '1',
              total_price: '980',
              deposit_amount: '294',
              deposit_due_date: '15.05.2025',
            }}
            onClose={() => {
              setShowPreview(false);
              setSelectedTemplate(null);
            }}
          />
        )}
      </Dialog>

      {/* Edit Dialog */}
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
