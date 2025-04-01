import React from 'react';
import { Section } from '../../components/Section';
import { ScrollReveal } from '../../components/ScrollReveal';
import { TemplateList } from '../../components/admin/email/TemplateList';

export const EmailTemplates = () => {
  return (
    <div className="py-4">
      <Section variant="secondary">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-display">Email-Vorlagen</h1>
                <p className="text-primary/60 mt-1">
                  Verwalten Sie die Email-Vorlagen für verschiedene Anlässe
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <TemplateList />
          </ScrollReveal>
        </div>
      </Section>
    </div>
  );
};
