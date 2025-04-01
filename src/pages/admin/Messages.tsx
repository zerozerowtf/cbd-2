import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  MessageSquare,
  Download,
  Search,
  Archive,
  Trash2,
  CheckCircle,
  AlertCircle,
  Globe2,
  Filter,
} from 'lucide-react';
import { Section } from '../../components/Section';
import { ScrollReveal } from '../../components/ScrollReveal';
import { Dialog } from '../../components/Dialog';
import { TemplatePreview } from '../../components/admin/email/TemplatePreview';
import { MessageList } from '../../components/admin/messages/MessageList';
import { supabase } from '../../lib/supabase';
import { sendEmail } from '../../lib/email';
import type { Message, EmailTemplate } from '../../types/admin';

const languageLabels = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
};

export const Messages = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);

  useEffect(() => {
    fetchMessages();
    fetchTemplates();
  }, [filter]);

  const fetchMessages = async () => {
    try {
      let query = supabase
        .from('messages')
        .select(`
          *,
          replies:message_replies(*)
        `)
        .order('created_at', { ascending: false });

      if (filter === 'unread') {
        query = query.eq('is_read', false);
      } else if (filter === 'archived') {
        query = query.eq('archived', true);
      } else {
        query = query.eq('archived', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      setError('Fehler beim Laden der Nachrichten');
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true)
        .in('type', ['info'])
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const handleMarkAsRead = async (messageIds: string[]) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', messageIds);

      if (error) throw error;

      setMessages(messages.map(msg => 
        messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
      ));
      setSelectedMessages([]);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const handleSendReply = async (messageId: string, content: string) => {
    if (!content.trim()) return;

    try {
      setIsSending(true);
      setError(null);

      // Get the message we're replying to
      const message = messages.find(m => m.id === messageId);
      if (!message) throw new Error('Message not found');

      // Send email
      const emailResult = await sendEmail({
        to: message.email,
        templateId: selectedTemplate || 'message_reply',
        data: {
          name: message.name,
          subject: message.subject,
          reply: content,
        },
        language: message.language,
      });

      if (!emailResult.success) {
        throw new Error(emailResult.error || 'Failed to send email');
      }

      // Create reply in database
      const { error: replyError } = await supabase
        .from('message_replies')
        .insert({
          message_id: messageId,
          content: content.trim(),
        });

      if (replyError) throw replyError;

      // Mark message as read
      await handleMarkAsRead([messageId]);

      // Refresh messages to get the new reply
      await fetchMessages();
    } catch (err) {
      console.error('Error sending reply:', err);
      setError('Fehler beim Senden der Antwort');
    } finally {
      setIsSending(false);
    }
  };

  const handleArchive = async (messageIds: string[]) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ archived: true })
        .in('id', messageIds);

      if (error) throw error;

      await fetchMessages();
      setSelectedMessages([]);
    } catch (err) {
      console.error('Error archiving messages:', err);
    }
  };

  const handleDelete = async (messageIds: string[]) => {
    if (!window.confirm('Möchten Sie die ausgewählten Nachrichten wirklich löschen?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .in('id', messageIds);

      if (error) throw error;

      await fetchMessages();
      setSelectedMessages([]);
    } catch (err) {
      console.error('Error deleting messages:', err);
    }
  };

  const handleExport = () => {
    const exportData = messages.map(msg => ({
      Datum: new Date(msg.created_at).toLocaleString('de-DE'),
      Name: msg.name,
      Email: msg.email,
      Betreff: msg.subject,
      Nachricht: msg.message,
      Sprache: languageLabels[msg.language as keyof typeof languageLabels],
      Status: msg.is_read ? 'Gelesen' : 'Ungelesen',
      Antworten: msg.replies?.length || 0,
    }));

    const csv = [
      Object.keys(exportData[0]).join(';'),
      ...exportData.map(row => Object.values(row).join(';'))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `nachrichten_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredMessages = messages.filter(message => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        message.name.toLowerCase().includes(searchLower) ||
        message.email.toLowerCase().includes(searchLower) ||
        message.subject.toLowerCase().includes(searchLower) ||
        message.message.toLowerCase().includes(searchLower)
      );
    }
    if (selectedLanguage) {
      return message.language === selectedLanguage;
    }
    return true;
  });

  // Group messages by status
  const groupedMessages = {
    unread: filteredMessages.filter(m => !m.is_read),
    pending: filteredMessages.filter(m => m.is_read && !m.replies?.length),
    answered: filteredMessages.filter(m => m.is_read && m.replies?.length),
  };

  return (
    <div className="py-8">
      <Section variant="secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-display">Nachrichten</h1>
                <p className="text-primary/60 mt-1">
                  {messages.length} Nachrichten gesamt
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {/* Bulk Actions */}
                {selectedMessages.length > 0 && (
                  <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-lg">
                    <span className="text-sm">{selectedMessages.length} ausgewählt</span>
                    <button
                      onClick={() => handleMarkAsRead(selectedMessages)}
                      className="p-1 hover:bg-primary/10 rounded"
                      title="Als gelesen markieren"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleArchive(selectedMessages)}
                      className="p-1 hover:bg-primary/10 rounded"
                      title="Archivieren"
                    >
                      <Archive className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedMessages)}
                      className="p-1 hover:bg-red-100 text-red-600 rounded"
                      title="Löschen"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Filters */}
                <div className="flex gap-2">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as typeof filter)}
                    className="rounded-lg border-gray-300 focus:border-accent 
                             focus:ring focus:ring-accent/20"
                  >
                    <option value="all">Alle Nachrichten</option>
                    <option value="unread">Ungelesen</option>
                    <option value="archived">Archiv</option>
                  </select>

                  <select
                    value={selectedLanguage || ''}
                    onChange={(e) => setSelectedLanguage(e.target.value || null)}
                    className="rounded-lg border-gray-300 focus:border-accent 
                             focus:ring focus:ring-accent/20"
                  >
                    <option value="">Alle Sprachen</option>
                    {Object.entries(languageLabels).map(([code, label]) => (
                      <option key={code} value={code}>{label}</option>
                    ))}
                  </select>

                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg
                             bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    <span className="hidden sm:inline">Exportieren</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nachrichten durchsuchen..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 
                         focus:border-accent focus:ring focus:ring-accent/20"
              />
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
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12 text-primary/60">
              Keine Nachrichten gefunden
            </div>
          ) : (
            <div className="space-y-8">
              {/* Unread Messages */}
              {groupedMessages.unread.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-display flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    Ungelesene Nachrichten
                    <span className="text-sm font-normal text-primary/60">
                      ({groupedMessages.unread.length})
                    </span>
                  </h2>
                  <MessageList
                    messages={groupedMessages.unread}
                    selectedMessages={selectedMessages}
                    onSelectMessage={(id, selected) => {
                      setSelectedMessages(prev => 
                        selected 
                          ? [...prev, id]
                          : prev.filter(msgId => msgId !== id)
                      );
                    }}
                    selectedMessage={selectedMessage}
                    onToggleMessage={(id) => setSelectedMessage(
                      selectedMessage === id ? null : id
                    )}
                    onMarkAsRead={handleMarkAsRead}
                    onReply={handleSendReply}
                    isSending={isSending}
                    selectedTemplate={selectedTemplate}
                    onTemplateChange={setSelectedTemplate}
                    templates={templates}
                    onShowTemplatePreview={() => setShowTemplatePreview(true)}
                  />
                </div>
              )}

              {/* Pending Messages */}
              {groupedMessages.pending.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-display flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    Wartende Nachrichten
                    <span className="text-sm font-normal text-primary/60">
                      ({groupedMessages.pending.length})
                    </span>
                  </h2>
                  <MessageList
                    messages={groupedMessages.pending}
                    selectedMessages={selectedMessages}
                    onSelectMessage={(id, selected) => {
                      setSelectedMessages(prev => 
                        selected 
                          ? [...prev, id]
                          : prev.filter(msgId => msgId !== id)
                      );
                    }}
                    selectedMessage={selectedMessage}
                    onToggleMessage={(id) => setSelectedMessage(
                      selectedMessage === id ? null : id
                    )}
                    onMarkAsRead={handleMarkAsRead}
                    onReply={handleSendReply}
                    isSending={isSending}
                    selectedTemplate={selectedTemplate}
                    onTemplateChange={setSelectedTemplate}
                    templates={templates}
                    onShowTemplatePreview={() => setShowTemplatePreview(true)}
                  />
                </div>
              )}

              {/* Answered Messages */}
              {groupedMessages.answered.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-display flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    Beantwortete Nachrichten
                    <span className="text-sm font-normal text-primary/60">
                      ({groupedMessages.answered.length})
                    </span>
                  </h2>
                  <MessageList
                    messages={groupedMessages.answered}
                    selectedMessages={selectedMessages}
                    onSelectMessage={(id, selected) => {
                      setSelectedMessages(prev => 
                        selected 
                          ? [...prev, id]
                          : prev.filter(msgId => msgId !== id)
                      );
                    }}
                    selectedMessage={selectedMessage}
                    onToggleMessage={(id) => setSelectedMessage(
                      selectedMessage === id ? null : id
                    )}
                    onMarkAsRead={handleMarkAsRead}
                    onReply={handleSendReply}
                    isSending={isSending}
                    selectedTemplate={selectedTemplate}
                    onTemplateChange={setSelectedTemplate}
                    templates={templates}
                    onShowTemplatePreview={() => setShowTemplatePreview(true)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </Section>

      {/* Template Preview Dialog */}
      <Dialog
        isOpen={showTemplatePreview}
        onClose={() => setShowTemplatePreview(false)}
        title="E-Mail-Vorlage Vorschau"
        size="xl"
      >
        {selectedTemplate && selectedMessage && (
          <TemplatePreview
            templateId={selectedTemplate}
            language={messages.find(m => m.id === selectedMessage)?.language}
            testData={{
              name: messages.find(m => m.id === selectedMessage)?.name || '',
              subject: messages.find(m => m.id === selectedMessage)?.subject || '',
              message: messages.find(m => m.id === selectedMessage)?.message || '',
              reply: 'Beispielantwort für die Vorschau',
            }}
            onClose={() => setShowTemplatePreview(false)}
          />
        )}
      </Dialog>
    </div>
  );
};
