export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  language: string;
  is_read: boolean;
  created_at: string;
  replies?: MessageReply[];
  tags?: string[];
  archived?: boolean;
}

export interface MessageReply {
  id: string;
  message_id: string;
  content: string;
  sent_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  type: string;
}

export interface MessageGroup {
  title: string;
  messages: Message[];
  icon: React.FC<{ className?: string }>;
  color: string;
}
