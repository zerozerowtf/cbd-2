import { createClient } from 'npm:@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

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

/**
 * Gets an email template from the database
 */
export async function getTemplate(templateId: string, language = 'de'): Promise<{
  subject: string;
  body: string;
} | null> {
  try {
    const { data: template, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    if (!template) return null;

    return {
      subject: template[`subject_${language}`] || template.subject_de,
      body: template[`body_${language}`] || template.body_de,
    };
  } catch (error) {
    console.error('Error fetching email template:', error);
    return null;
  }
}

/**
 * Processes a template by replacing variables with actual values
 */
export function processTemplate(template: string, data: Record<string, any>): string {
  let processedTemplate = template;

  // Replace all variables in the template
  for (const [key, value] of Object.entries(data)) {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    processedTemplate = processedTemplate.replace(placeholder, String(value));
  }

  return processedTemplate;
}
