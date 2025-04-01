import React from 'react';
import { MessageItem } from './MessageItem';
import type { Message, EmailTemplate } from '../../../types/admin';

interface MessageListProps {
  messages: Message[];
  selectedMessages: string[];
  onSelectMessage: (id: string, selected: boolean) => void;
  selectedMessage: string | null;
  onToggleMessage: (id: string) => void;
  onMarkAsRead: (ids: string[]) => void;
  onReply: (messageId: string, content: string) => void;
  isSending: boolean;
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
  templates: EmailTemplate[];
  onShowTemplatePreview: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  selectedMessages,
  onSelectMessage,
  selectedMessage,
  onToggleMessage,
  onMarkAsRead,
  onReply,
  isSending,
  selectedTemplate,
  onTemplateChange,
  templates,
  onShowTemplatePreview,
}) => {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isSelected={selectedMessages.includes(message.id)}
          onSelect={(selected) => onSelectMessage(message.id, selected)}
          onToggleExpand={() => onToggleMessage(message.id)}
          isExpanded={selectedMessage === message.id}
          onMarkAsRead={() => onMarkAsRead([message.id])}
          onReply={onReply}
          isSending={isSending}
          selectedTemplate={selectedTemplate}
          onTemplateChange={onTemplateChange}
          templates={templates}
          onShowTemplatePreview={onShowTemplatePreview}
        />
      ))}
    </div>
  );
};
