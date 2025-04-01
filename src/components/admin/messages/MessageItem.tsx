import React, { useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  MessageSquare,
  Mail,
  Clock,
  Send,
  CheckCircle,
  Globe,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Eye,
  CheckSquare,
  Square,
  MoreHorizontal
} from 'lucide-react';
import type { Message, MessageReply, EmailTemplate } from '../../../types/admin';

interface MessageItemProps {
  message: Message;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onToggleExpand: () => void;
  isExpanded: boolean;
  onMarkAsRead: () => void;
  onReply: (messageId: string, content: string) => void;
  isSending: boolean;
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
  templates: EmailTemplate[];
  onShowTemplatePreview: () => void;
}

const languageLabels = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
};

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isSelected,
  onSelect,
  onToggleExpand,
  isExpanded,
  onMarkAsRead,
  onReply,
  isSending,
  selectedTemplate,
  onTemplateChange,
  templates,
  onShowTemplatePreview,
}) => {
  const [replyContent, setReplyContent] = useState('');

  const handleSendReply = () => {
    if (!replyContent.trim()) return;
    onReply(message.id, replyContent);
    setReplyContent(''); // Clear after sending
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Message Header */}
      <div className={`flex items-center gap-4 p-6 ${
        !message.is_read ? 'bg-blue-50' : ''
      }`}>
        <button
          onClick={() => onSelect(!isSelected)}
          className="p-1 rounded hover:bg-primary/5"
        >
          {isSelected ? (
            <CheckSquare className="w-5 h-5 text-accent" />
          ) : (
            <Square className="w-5 h-5 text-primary/40" />
          )}
        </button>

        <div className="flex-grow cursor-pointer" onClick={onToggleExpand}>
          <div className="flex items-center gap-3">
            <h3 className="font-medium">{message.subject}</h3>
            <span className={`px-2 py-1 rounded-full text-xs ${
              message.is_read
                ? 'bg-gray-100 text-gray-600'
                : 'bg-blue-100 text-blue-600'
            }`}>
              {message.is_read ? 'Gelesen' : 'Neu'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-primary/60 mt-1">
            <div className="flex items-center gap-1">
              <Clock size={16} />
              {format(new Date(message.created_at), 'dd.MM.yyyy HH:mm', { 
                locale: de 
              })}
            </div>
            <div className="flex items-center gap-1">
              <Globe size={16} />
              {languageLabels[message.language as keyof typeof languageLabels]}
            </div>
            {message.replies?.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare size={16} />
                {message.replies.length} Antwort{message.replies.length !== 1 ? 'en' : ''}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleExpand}
            className="p-2 rounded hover:bg-primary/5"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-primary/60" />
            ) : (
              <ChevronDown className="w-5 h-5 text-primary/60" />
            )}
          </button>
          <button className="p-2 rounded hover:bg-primary/5">
            <MoreHorizontal className="w-5 h-5 text-primary/60" />
          </button>
        </div>
      </div>

      {/* Message Content */}
      {isExpanded && (
        <div className="p-6 border-t border-gray-200">
          <div className="space-y-6">
            {/* Sender Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Von:</span>
                {message.name}
              </div>
              <a 
                href={`mailto:${message.email}`}
                className="flex items-center gap-2 text-accent hover:underline"
              >
                <Mail size={16} />
                {message.email}
              </a>
            </div>

            {/* Message Text */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{message.message}</p>
            </div>

            {/* Replies */}
            {message.replies && message.replies.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Antworten</h4>
                {message.replies.map((reply) => (
                  <div 
                    key={reply.id}
                    className="bg-accent/10 p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-2 text-sm text-primary/60 mb-2">
                      <Clock size={16} />
                      {format(new Date(reply.sent_at), 'dd.MM.yyyy HH:mm', {
                        locale: de
                      })}
                    </div>
                    <p className="whitespace-pre-wrap">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Form */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <select
                  value={selectedTemplate}
                  onChange={(e) => onTemplateChange(e.target.value)}
                  className="rounded-lg border-gray-300 focus:border-accent 
                           focus:ring focus:ring-accent/20"
                >
                  <option value="">Ohne Vorlage</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.name}>
                      {template.name}
                    </option>
                  ))}
                </select>

                {selectedTemplate && (
                  <button
                    onClick={onShowTemplatePreview}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg
                             bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                    <span>Vorschau</span>
                  </button>
                )}
              </div>

              <div className="flex gap-4">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Antwort schreiben..."
                  className="flex-1 rounded-lg border-gray-300 focus:border-accent 
                           focus:ring focus:ring-accent/20"
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyContent.trim() || isSending}
                  className="bg-accent text-secondary px-4 py-2 rounded-lg
                           hover:bg-accent/90 transition-colors disabled:opacity-50
                           disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Mark as Read Button */}
            {!message.is_read && (
              <button
                onClick={onMarkAsRead}
                className="flex items-center gap-2 text-accent hover:text-accent/80
                         transition-colors"
              >
                <CheckCircle size={20} />
                Als gelesen markieren
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
