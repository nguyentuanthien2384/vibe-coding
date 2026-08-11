export type EmailType =
  | 'REGISTER_WELCOME'
  | 'ORDER_CONFIRMATION'
  | 'PASSWORD_CHANGED'
  | 'SECURITY_ALERT';

export type EmailStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface EmailLog {
  id: number;
  recipient: string;
  subject: string;
  type: EmailType;
  status: EmailStatus;
  metadata?: Record<string, unknown> | null;
  errorMessage?: string | null;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailLogQueryDto {
  page?: number;
  limit?: number;
  type?: EmailType | '';
  status?: EmailStatus | '';
  search?: string;
}

export interface EmailLogsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EmailLogsResponse {
  statusCode: number;
  message: string;
  data: {
    items: EmailLog[];
    pagination: EmailLogsPagination;
  };
}

export interface ResendEmailResponse {
  statusCode: number;
  message: string;
}
