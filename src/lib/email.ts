import { supabase } from './supabase';

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

/**
 * Process a template by replacing variables with values
 */
function processTemplate(template: string, data: Record<string, any>): string {
  let processedTemplate = template;

  // Process conditional blocks
  processedTemplate = processedTemplate.replace(
    /{{#if ([^}]+)}}(.*?){{\/if}}/gs,
    (match, condition, content) => {
      const value = data[condition];
      return value ? content : '';
    }
  );

  // Process arrays/each blocks
  processedTemplate = processedTemplate.replace(
    /{{#each ([^}]+)}}(.*?){{\/each}}/gs,
    (match, array, content) => {
      const items = data[array];
      if (!Array.isArray(items)) return '';
      return items.map(item => {
        let itemContent = content;
        if (typeof item === 'object') {
          // Replace object properties
          Object.entries(item).forEach(([key, value]) => {
            const regex = new RegExp(`{{this.${key}}}`, 'g');
            itemContent = itemContent.replace(regex, String(value));
          });
        } else {
          // Replace simple value
          itemContent = itemContent.replace(/{{this}}/g, String(item));
        }
        return itemContent;
      }).join('\n');
    }
  );

  // Replace all remaining variables
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processedTemplate = processedTemplate.replace(regex, String(value));
  });

  return processedTemplate;
}

/**
 * Gets a template by name
 */
export async function getTemplate(templateName: string, language = 'de'): Promise<{
  subject: string;
  body: string;
} | null> {
  try {
    // First check if template exists and is active
    const { data: template, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', templateName)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Template fetch error:', error);
      throw error;
    }
    
    if (!template) {
      console.warn('No template found for name:', templateName);
      throw new Error(`Template ${templateName} not found or inactive`);
    }

    // Get header and footer
    const [headerRes, footerRes] = await Promise.all([
      supabase
        .from('email_template_parts')
        .select('*')
        .eq('name', 'header')
        .single(),
      supabase
        .from('email_template_parts')
        .select('*')
        .eq('name', 'footer')
        .single()
    ]);

    const header = headerRes.data?.[`content_${language}`] || headerRes.data?.content_de;
    const footer = footerRes.data?.[`content_${language}`] || footerRes.data?.content_de;

    return {
      subject: template[`subject_${language}`] || template.subject_de,
      body: `${header || ''}${template[`body_${language}`] || template.body_de}${footer || ''}`
    };
  } catch (error) {
    console.error('Error in getTemplate:', error);
    throw error;
  }
}

/**
 * Gets all available email templates
 */
export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('type', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error in getEmailTemplates:', error);
    return [];
  }
}

/**
 * Sends an email using the configured email system
 */
export async function sendEmail(params: {
  to: string;
  templateId?: string;
  subject?: string;
  content?: string;
  data?: Record<string, any>;
  language?: string;
}): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  timestamp?: string;
}> {
  try {
    let emailContent: { subject: string; content: string };

    // If templateId is provided, fetch and process template
    if (params.templateId) {
      const template = await getTemplate(params.templateId, params.language);
      if (!template) {
        throw new Error(`Template ${params.templateId} not found or inactive`);
      }

      emailContent = {
        subject: processTemplate(template.subject, params.data || {}),
        content: processTemplate(template.body, params.data || {}),
      };
    } else {
      // Use direct subject and content
      if (!params.subject || !params.content) {
        throw new Error('Either templateId or subject and content must be provided');
      }
      emailContent = {
        subject: params.subject,
        content: params.content,
      };
    }

    // Send email via Edge Function
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: JSON.stringify({
        to: params.to,
        subject: emailContent.subject,
        content: emailContent.content,
      }),
    });

    if (error) throw error;
    if (!data) throw new Error('No response from email function');

    // Log email in database
    const { error: logError } = await supabase
      .from('email_logs')
      .insert({
        recipient_email: params.to,
        language: params.language || 'de',
        subject: emailContent.subject,
        body: emailContent.content,
        status: 'sent',
      });

    if (logError) {
      console.error('Error logging email:', logError);
    }

    return {
      success: true,
      message: 'Email sent successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error sending email:', error);

    // Log failed attempt
    try {
      await supabase
        .from('email_logs')
        .insert({
          recipient_email: params.to,
          language: params.language || 'de',
          subject: params.subject || 'Failed email',
          body: params.content || 'Email sending failed',
          status: 'failed',
          error_message: error instanceof Error ? error.message : String(error),
        });
    } catch (logError) {
      console.error('Error logging failed email:', logError);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Tests the email connection
 */
export async function testEmailConnection(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  timestamp?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: JSON.stringify({ test: true }),
    });

    if (error) throw error;
    if (!data) throw new Error('No response from email function');

    return {
      success: true,
      message: 'Email connection test successful',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error testing email connection:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
  }
}
