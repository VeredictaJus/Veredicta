export type UserRole = 'CLIENT' | 'WRITER' | 'ADMIN' | 'SUPER_ADMIN';

export type PetitionStatus = 
  | 'PENDING' 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'CANCELLED';

export type PaymentStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'REFUNDED';

export type PetitionPriority = 'MEDIUM' | 'HIGH';

export type PetitionType = 
  | 'INICIAL' 
  | 'CONTESTACAO' 
  | 'RECURSO' 
  | 'AGRAVO' 
  | 'APELACAO' 
  | 'EMBARGOS' 
  | 'PETICAO_SIMPLES';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  last_login?: string;
}

export interface ClientProfile {
  id: string;
  user_id: string;
  company_name: string;
  cnpj: string;
  plan_id: string;
  plan_type: 'STARTER' | 'PROFESSIONAL' | 'PREMIUM';
  credits_balance: number;
  contact_person: string;
  phone: string;
  address: string;
  created_at: string;
}

export interface WriterProfile {
  id: string;
  user_id: string;
  full_name: string;
  cpf: string;
  cnpj?: string;
  oab_number: string;
  specializations: string[];
  hourly_rate: number;
  rating: number;
  completed_petitions: number;
  pending_payment: number;
  approval_status: 'pending_portfolio' | 'under_review' | 'approved' | 'rejected';
  portfolio_submitted: boolean;
  portfolio_submission_date?: string;
  can_accept_petitions: boolean;
  created_at: string;
}

export interface AdminProfile {
  id: string;
  user_id: string;
  full_name: string;
  permissions: string[];
  department: string;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  monthly_petitions: number;
  features: string[];
  is_active: boolean;
  created_at: string;
}

export interface Petition {
  id: string;
  client_id: string;
  writer_id?: string;
  petition_type: PetitionType;
  title: string;
  description: string;
  status: PetitionStatus;
  priority: PetitionPriority;
  deadline: string;
  estimated_hours: number;
  actual_hours?: number;
  value: number;
  created_at: string;
  accepted_at?: string;
  completed_at?: string;
  files?: PetitionFile[];
  correction_count?: number;
  correction_requested_at?: string;
}

export interface PetitionFile {
  id: string;
  petition_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  is_final: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  client_id?: string;
  writer_id?: string;
  petition_id?: string;
  amount: number;
  payment_type: 'CREDIT_CARD' | 'PIX' | 'BANK_TRANSFER';
  status: PaymentStatus;
  gateway_transaction_id?: string;
  created_at: string;
  processed_at?: string;
}

export interface CreditTransaction {
  id: string;
  client_id: string;
  amount: number;
  transaction_type: 'PURCHASE' | 'USAGE' | 'REFUND' | 'BONUS';
  reference_id?: string;
  description: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  is_read: boolean;
  sent_at: string;
  read_at?: string;
}

export interface WriterPortfolio {
  id: string;
  writer_id: string;
  petition_files: {
    file_name: string;
    file_url: string;
    file_size: number;
    upload_date: string;
  }[];
  submission_date: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  admin_comments?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

export interface DashboardMetrics {
  totalClients: number;
  totalWriters: number;
  totalPetitions: number;
  monthlyRevenue: number;
  pendingPetitions: number;
  completedPetitions: number;
  averageCompletionTime: number;
  clientSatisfaction: number;
}