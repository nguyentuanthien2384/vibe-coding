import { LoginDto, RegisterDto, UserProfile, OrderSummaryItem, OrderStatusCounts } from './auth.types';

export interface FormFieldError {
  message?: string;
}

export type FormFieldErrors<T> = {
  [K in keyof T]?: FormFieldError;
};

export type FormRegisterHandler<T> = (name: keyof T) => {
  name: keyof T;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export interface AuthCardWrapperProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}

export interface LoginFormProps {
  register: FormRegisterHandler<LoginDto>;
  errors: FormFieldErrors<LoginDto>;
  isSubmitting: boolean;
  serverError?: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export interface RegisterFormProps {
  register: FormRegisterHandler<RegisterDto>;
  errors: FormFieldErrors<RegisterDto>;
  isSubmitting: boolean;
  serverError?: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export interface AuthFooterLinkProps {
  promptText: string;
  linkText: string;
  href: string;
}

export interface UserNavMenuProps {
  user: UserProfile | null;
  isAuthenticated: boolean;
  onLogout: () => void;
}

export interface ProfileInfoCardProps {
  user: UserProfile;
  onUpdateProfile?: (data: Partial<UserProfile>) => void;
}

export interface OrderHistoryListProps {
  orders: OrderSummaryItem[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onViewAll?: () => void;
  title?: string;
  showViewAllButton?: boolean;
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  statusCounts?: OrderStatusCounts;
  onOpenQrPayment?: (orderCode: string) => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
  };
}
