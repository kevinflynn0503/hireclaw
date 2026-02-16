/**
 * HireClaw API Types
 * 
 * 定义所有数据模型和环境类型
 */

// ============================================
// Cloudflare Workers 环境类型
// ============================================
export interface Env {
  // D1 数据库
  DB: D1Database;
  
  // R2 存储
  R2: R2Bucket;
  
  // 环境变量
  ENVIRONMENT: 'development' | 'production';
  PLATFORM_FEE_PERCENT: string;
  MAX_REJECTION_COUNT: string;
  MAX_FILE_SIZE_MB: string;
  TOKEN_EXPIRY_HOURS: string;
  
  // 秘密配置
  TASK_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}

// ============================================
// Agent 相关类型
// ============================================
export interface Agent {
  id: string;                    // agent_xxx
  name: string;
  owner_email: string;
  api_key: string;
  capabilities: string[];        // 从 JSON 解析
  stripe_customer_id?: string;
  stripe_account_id?: string;
  role: 'employer' | 'worker' | 'both';
  created_at: string;
  updated_at: string;
}

export interface CreateAgentInput {
  name: string;
  owner_email: string;
  capabilities?: string[];
  role?: 'employer' | 'worker' | 'both';
}

// ============================================
// Task 相关类型
// ============================================
export enum TaskStatus {
  OPEN = 'open',
  CLAIMED = 'claimed',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum PaymentStatus {
  PENDING = 'pending',
  HELD = 'held',
  CAPTURED = 'captured',
  REFUNDED = 'refunded'
}

export interface Task {
  id: string;                    // task_xxx
  employer_id: string;
  worker_id?: string;
  
  // 任务内容
  title: string;
  description: string;
  skills: string[];              // 从 JSON 解析
  budget: number;
  deadline: string;
  
  // 状态
  status: TaskStatus;
  
  // 支付信息
  payment_intent_id?: string;
  payment_status: PaymentStatus;
  
  // 时间戳
  created_at: string;
  claimed_at?: string;
  submitted_at?: string;
  completed_at?: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  skills?: string[];
  budget: number;
  deadline: string;
}

export interface TaskWithToken extends Task {
  task_token: string;  // 用于接单验证
}

// ============================================
// Submission 相关类型
// ============================================
export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface Submission {
  id: string;                    // sub_xxx
  task_id: string;
  worker_id: string;
  
  // 文件信息
  file_key: string;
  file_name: string;
  file_size: number;
  file_hash: string;             // SHA-256
  
  // 提交内容
  notes?: string;
  
  // 审核状态
  review_status: ReviewStatus;
  review_notes?: string;
  reviewed_at?: string;
  
  // 时间戳
  submitted_at: string;
}

export interface CreateSubmissionInput {
  task_id: string;
  file: File;
  notes?: string;
}

// ============================================
// Review 相关类型
// ============================================
export interface Review {
  id: string;                    // rev_xxx
  task_id: string;
  submission_id: string;
  employer_id: string;
  
  result: 'accept' | 'reject';
  feedback?: string;
  rating?: number;               // 1-5
  
  reviewed_at: string;
}

export interface CreateReviewInput {
  submission_id: string;
  result: 'accept' | 'reject';
  feedback?: string;
  rating?: number;
}

// ============================================
// Audit Log 相关类型（借鉴 AP2）
// ============================================
export type AuditAction =
  | 'task_create'
  | 'task_claim'
  | 'task_unclaim'
  | 'submission_create'
  | 'submission_review'
  | 'submission_accept'
  | 'submission_reject'
  | 'payment_hold'
  | 'payment_capture'
  | 'payment_split'
  | 'payment_refund';

export type ActorType = 'employer' | 'worker' | 'platform' | 'system';

export interface AuditLog {
  id: string;                    // log_xxx
  task_id: string;
  action: AuditAction;
  actor: string;                 // agent_xxx 或 'system'
  actor_type: ActorType;
  details: Record<string, any>;  // 从 JSON 解析
  ip_address?: string;
  timestamp: string;
}

export interface CreateAuditLogInput {
  task_id: string;
  action: AuditAction;
  actor: string;
  actor_type: ActorType;
  details?: Record<string, any>;
  ip_address?: string;
}

// ============================================
// State Machine 相关类型
// ============================================
export interface StateTransitionRule {
  next: TaskStatus[];
  actor: ActorType;
  actions: string[];
}

export type StateTransitionMap = Record<TaskStatus, StateTransitionRule>;

// ============================================
// API Response 类型
// ============================================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

// ============================================
// 任务 Token 相关类型（借鉴 AP2）
// ============================================
export interface TaskTokenPayload {
  task_id: string;
  employer_id: string;
  budget: number;
  created_at: string;
}

export interface TaskTokenValidation {
  valid: boolean;
  reason?: string;
}

// ============================================
// 内容哈希相关类型（借鉴 AP2）
// ============================================
export interface FileUploadResult {
  key: string;
  hash: string;
  size: number;
}

export interface IntegrityCheckResult {
  valid: boolean;
  reason?: string;
}

// ============================================
// Agent Profile Card 相关类型
// ============================================
export interface SkillLevel {
  id: string;
  name: string;
  level?: 'beginner' | 'intermediate' | 'expert' | 'native';
}

export interface AgentProfile {
  id: string;
  agent_id: string;

  display_name: string;
  tagline?: string;
  bio?: string;
  avatar_url?: string;

  primary_skills: SkillLevel[];
  languages: string[];
  specializations: string[];

  accepts_free: boolean;
  accepts_paid: boolean;
  min_budget?: number;
  max_budget?: number;
  typical_response_time?: string;

  openclaw_version?: string;
  openclaw_skills_count: number;
  openclaw_model?: string;

  is_verified: boolean;
  verification_date?: string;
  verification_method?: string;

  is_listed: boolean;
  featured_work: { task_id: string; title: string; rating?: number }[];

  created_at: string;
  updated_at: string;
}

export interface UpdateProfileInput {
  display_name?: string;
  tagline?: string;
  bio?: string;
  avatar_url?: string;
  primary_skills?: SkillLevel[];
  languages?: string[];
  specializations?: string[];
  accepts_free?: boolean;
  accepts_paid?: boolean;
  min_budget?: number;
  max_budget?: number;
  typical_response_time?: string;
  openclaw_version?: string;
  openclaw_skills_count?: number;
  openclaw_model?: string;
  is_listed?: boolean;
}

export interface AgentStats {
  tasks_completed: number;
  tasks_succeeded: number;
  success_rate: number | null;
  avg_rating: number | null;
  review_count: number;
  avg_delivery_hours: number | null;
  total_earned_usd: number;
}

export interface AgentCard {
  agent_id: string;
  display_name: string;
  tagline?: string;
  bio?: string;
  avatar_url?: string;
  member_since: string;

  skills: SkillLevel[];
  languages: string[];
  specializations: string[];

  pricing: {
    accepts_free: boolean;
    accepts_paid: boolean;
    min_budget?: number;
    max_budget?: number;
    typical_response_time?: string;
    platform_fee: string;
  };

  stats: AgentStats;

  trust: {
    is_verified: boolean;
    verification_method?: string;
    verification_date?: string;
    has_stripe: boolean;
    member_days: number;
  };

  connect: {
    a2a_url?: string;
    profile_url: string;
    is_online: boolean;
    last_seen?: string;
  };

  openclaw: {
    version?: string;
    skills_installed: number;
    model?: string;
  };

  featured_work: { task_id: string; title: string; rating?: number; completed_at?: string }[];
}

// ============================================
// Hono Context 扩展
// ============================================
declare module 'hono' {
  interface ContextVariableMap {
    agent: Agent;  // 认证后的 Agent 信息
  }
}
