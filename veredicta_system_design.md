# Sistema Veredicta - Arquitetura Completa

## Implementation approach

A plataforma Veredicta será desenvolvida como uma aplicação web moderna utilizando arquitetura baseada em microsserviços com Supabase como backend-as-a-service. O sistema implementará:

- **Frontend**: Next.js 14 com TypeScript, Shadcn-ui e Tailwind CSS para interface responsiva
- **Backend**: Supabase com PostgreSQL, Auth, Storage e Edge Functions
- **Autenticação**: Row Level Security (RLS) nativo do Supabase para controle granular de acesso
- **Pagamentos**: Integração com Stripe para cartão e Pix via providers brasileiros
- **Notificações**: Sistema de email transacional com Resend
- **Storage**: Supabase Storage para arquivos jurídicos com criptografia
- **Real-time**: Subscriptions do Supabase para atualizações em tempo real

**Pontos críticos identificados:**
1. Segurança jurídica dos documentos (criptografia end-to-end)
2. Controle de acesso granular por perfil de usuário
3. Sistema de créditos com transações ACID
4. Workflow de petições com estados bem definidos
5. Compliance LGPD para dados sensíveis

## Data structures and interfaces

```mermaid
classDiagram
    class User {
        +id: UUID
        +email: string
        +password_hash: string
        +role: UserRole
        +created_at: timestamp
        +updated_at: timestamp
        +is_active: boolean
        +last_login: timestamp
        +__init__(email: string, password: string, role: UserRole)
        +authenticate(password: string) boolean
        +update_profile(data: dict) void
        +deactivate() void
    }

    class ClientProfile {
        +id: UUID
        +user_id: UUID
        +company_name: string
        +cnpj: string
        +plan_id: UUID
        +credits_balance: integer
        +contact_person: string
        +phone: string
        +address: string
        +created_at: timestamp
        +__init__(user_id: UUID, company_data: dict)
        +get_active_plan() Plan
        +update_credits(amount: integer) void
        +get_credit_history() list[CreditTransaction]
    }

    class WriterProfile {
        +id: UUID
        +user_id: UUID
        +full_name: string
        +cpf: string
        +cnpj: string
        +oab_number: string
        +specializations: string[]
        +hourly_rate: decimal
        +rating: decimal
        +completed_petitions: integer
        +pending_payment: decimal
        +created_at: timestamp
        +__init__(user_id: UUID, professional_data: dict)
        +add_specialization(area: string) void
        +update_rating(new_rating: decimal) void
        +calculate_earnings() decimal
    }

    class AdminProfile {
        +id: UUID
        +user_id: UUID
        +full_name: string
        +permissions: string[]
        +department: string
        +created_at: timestamp
        +__init__(user_id: UUID, admin_data: dict)
        +has_permission(permission: string) boolean
        +get_system_metrics() dict
    }

    class Plan {
        +id: UUID
        +name: string
        +price: decimal
        +monthly_petitions: integer
        +features: string[]
        +is_active: boolean
        +created_at: timestamp
        +__init__(name: string, price: decimal, petitions: integer)
        +calculate_overage_cost(extra_petitions: integer) decimal
        +get_feature_list() string[]
    }

    class Subscription {
        +id: UUID
        +client_id: UUID
        +plan_id: UUID
        +status: SubscriptionStatus
        +current_period_start: timestamp
        +current_period_end: timestamp
        +petitions_used: integer
        +created_at: timestamp
        +__init__(client_id: UUID, plan_id: UUID)
        +is_active() boolean
        +renew_subscription() void
        +upgrade_plan(new_plan_id: UUID) void
    }

    class Petition {
        +id: UUID
        +client_id: UUID
        +writer_id: UUID
        +petition_type: string
        +title: string
        +description: text
        +status: PetitionStatus
        +priority: PetitionPriority
        +deadline: timestamp
        +estimated_hours: integer
        +actual_hours: integer
        +value: decimal
        +created_at: timestamp
        +accepted_at: timestamp
        +completed_at: timestamp
        +__init__(client_id: UUID, petition_data: dict)
        +assign_writer(writer_id: UUID) void
        +update_status(status: PetitionStatus) void
        +calculate_payment() decimal
        +get_time_remaining() integer
    }

    class PetitionFile {
        +id: UUID
        +petition_id: UUID
        +file_name: string
        +file_path: string
        +file_type: string
        +file_size: integer
        +uploaded_by: UUID
        +is_final: boolean
        +created_at: timestamp
        +__init__(petition_id: UUID, file_data: dict)
        +encrypt_file() void
        +generate_download_url() string
        +validate_file_type() boolean
    }

    class Payment {
        +id: UUID
        +client_id: UUID
        +writer_id: UUID
        +petition_id: UUID
        +amount: decimal
        +payment_type: PaymentType
        +status: PaymentStatus
        +gateway_transaction_id: string
        +created_at: timestamp
        +processed_at: timestamp
        +__init__(payer_id: UUID, amount: decimal, type: PaymentType)
        +process_payment() boolean
        +refund_payment() boolean
        +generate_invoice() string
    }

    class CreditTransaction {
        +id: UUID
        +client_id: UUID
        +amount: integer
        +transaction_type: CreditTransactionType
        +reference_id: UUID
        +description: string
        +created_at: timestamp
        +__init__(client_id: UUID, amount: integer, type: CreditTransactionType)
        +validate_transaction() boolean
        +apply_transaction() void
    }

    class Notification {
        +id: UUID
        +user_id: UUID
        +title: string
        +message: text
        +notification_type: NotificationType
        +is_read: boolean
        +sent_at: timestamp
        +read_at: timestamp
        +__init__(user_id: UUID, notification_data: dict)
        +mark_as_read() void
        +send_email() void
        +send_push() void
    }

    class AuditLog {
        +id: UUID
        +user_id: UUID
        +action: string
        +resource_type: string
        +resource_id: UUID
        +old_values: json
        +new_values: json
        +ip_address: string
        +user_agent: string
        +created_at: timestamp
        +__init__(user_id: UUID, action: string, resource: dict)
        +log_action() void
        +get_user_history(user_id: UUID) list[AuditLog]
    }

    %% Enums
    class UserRole {
        <<enumeration>>
        CLIENT
        WRITER
        ADMIN
        SUPER_ADMIN
    }

    class PetitionStatus {
        <<enumeration>>
        PENDING
        ASSIGNED
        IN_PROGRESS
        COMPLETED
        APPROVED
        REJECTED
        CANCELLED
    }

    class PaymentStatus {
        <<enumeration>>
        PENDING
        PROCESSING
        COMPLETED
        FAILED
        REFUNDED
    }

    %% Relationships
    User ||--|| ClientProfile : "has"
    User ||--|| WriterProfile : "has"
    User ||--|| AdminProfile : "has"
    User ||--o{ Notification : "receives"
    User ||--o{ AuditLog : "performs"

    ClientProfile ||--|| Subscription : "has"
    ClientProfile ||--o{ Petition : "creates"
    ClientProfile ||--o{ Payment : "makes"
    ClientProfile ||--o{ CreditTransaction : "has"

    WriterProfile ||--o{ Petition : "accepts"
    WriterProfile ||--o{ Payment : "receives"

    Plan ||--o{ Subscription : "includes"
    
    Petition ||--o{ PetitionFile : "contains"
    Petition ||--|| Payment : "generates"
    
    Subscription }|--|| Plan : "follows"
```

## Program call flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as Next.js API
    participant Auth as Supabase Auth
    participant DB as PostgreSQL
    participant Storage as Supabase Storage
    participant Edge as Edge Functions
    participant Payment as Payment Gateway
    participant Email as Email Service

    %% User Authentication Flow
    Note over C,Email: Authentication Flow
    C->>API: POST /auth/login {email, password}
    API->>Auth: signInWithPassword()
    Auth->>DB: validate credentials
    DB-->>Auth: user data + role
    Auth-->>API: session + user info
    API-->>C: JWT token + user profile

    %% Client Creates Petition Flow
    Note over C,Email: Create Petition Flow
    C->>API: POST /petitions {title, description, type}
    API->>Auth: verify JWT token
    Auth-->>API: user session valid
    API->>DB: INSERT INTO petitions
    DB-->>API: petition created with ID
    API->>Storage: upload files to bucket
    Storage-->>API: file URLs
    API->>DB: UPDATE petition SET file_paths
    API->>Edge: trigger-auto-assignment function
    Edge->>DB: SELECT writers by specialization
    DB-->>Edge: available writers list
    Edge->>DB: UPDATE petition SET writer_id
    Edge->>Email: send notification to writer
    Email-->>Edge: email sent
    API-->>C: petition created successfully

    %% Writer Accepts Petition Flow
    Note over C,Email: Writer Accepts Petition
    C->>API: PUT /petitions/{id}/accept
    API->>Auth: verify writer role
    Auth-->>API: writer authorized
    API->>DB: UPDATE petition SET status='IN_PROGRESS'
    API->>DB: INSERT INTO audit_logs
    API->>Edge: trigger-status-notification
    Edge->>Email: notify client petition accepted
    API-->>C: petition accepted

    %% Payment Processing Flow
    Note over C,Email: Payment Processing
    C->>API: POST /payments/subscribe {plan_id}
    API->>Auth: verify client role
    API->>Payment: create payment intent
    Payment-->>API: payment intent created
    API->>DB: INSERT INTO payments
    C->>Payment: complete payment
    Payment->>API: webhook payment_completed
    API->>DB: UPDATE payment SET status='COMPLETED'
    API->>DB: UPDATE client_profile SET credits
    API->>DB: INSERT INTO credit_transactions
    API->>Email: send payment confirmation
    API-->>C: payment successful

    %% Admin Dashboard Flow
    Note over C,Email: Admin Dashboard Access
    C->>API: GET /admin/dashboard
    API->>Auth: verify admin role
    Auth-->>API: admin authorized
    API->>DB: SELECT metrics data
    DB-->>API: aggregated statistics
    API->>DB: SELECT recent activities
    DB-->>API: recent logs
    API-->>C: dashboard data

    %% File Upload Flow
    Note over C,Storage: File Upload Process
    C->>API: POST /files/upload
    API->>Auth: verify user permissions
    API->>Storage: upload to bucket with RLS
    Storage->>Storage: encrypt file
    Storage-->>API: secure file URL
    API->>DB: INSERT INTO petition_files
    API-->>C: file uploaded successfully

    %% Real-time Updates Flow
    Note over C,DB: Real-time Subscriptions
    C->>API: subscribe to petition updates
    API->>DB: LISTEN for petition changes
    DB->>API: NOTIFY petition status changed
    API->>C: push real-time update
    
    %% Writer Completes Petition Flow
    Note over C,Email: Complete Petition
    C->>API: PUT /petitions/{id}/complete
    API->>Storage: upload final petition file
    API->>DB: UPDATE petition SET status='COMPLETED'
    API->>DB: INSERT INTO payments (writer payment)
    API->>Edge: trigger-completion-workflow
    Edge->>Email: notify client petition ready
    Edge->>DB: UPDATE writer stats
    API-->>C: petition completed

    %% Credit System Flow
    Note over C,DB: Credit Management
    C->>API: POST /credits/purchase {amount}
    API->>Payment: process credit purchase
    Payment-->>API: payment confirmed
    API->>DB: BEGIN TRANSACTION
    API->>DB: UPDATE client_profile SET credits
    API->>DB: INSERT INTO credit_transactions
    API->>DB: COMMIT TRANSACTION
    API-->>C: credits added successfully
```

## Anything UNCLEAR

As seguintes questões precisam de esclarecimento para completar a implementação:

1. **Integração PIX**: Qual provider será utilizado (Mercado Pago, PagSeguro, Stripe Brasil) para processamento de pagamentos PIX?

2. **Criptografia de Arquivos**: Será implementada criptografia client-side antes do upload ou server-side no Supabase Storage?

3. **SLA por Tipo de Petição**: Quais são os prazos específicos para cada tipo de petição (inicial, recurso, contestação, etc.)?

4. **Auto-atribuição de Petições**: Quais critérios serão usados (especialização, carga de trabalho, rating, disponibilidade)?

5. **Compliance LGPD**: Período de retenção de dados e processo de anonização/exclusão de dados pessoais?

6. **Backup e Disaster Recovery**: Frequência de backups e RTO/RPO requirements para continuidade do negócio?

7. **Rate Limiting**: Limites de API calls por usuário e por endpoint para evitar abuso?

8. **Ambiente de Homologação**: Será necessário ambiente staging separado com dados de teste?

9. **Monitoramento**: Quais métricas de performance e alertas serão implementados (latência, uptime, erros)?

10. **Certificação de Redatores**: Processo de verificação de OAB e validação de especialização será manual ou automatizado?