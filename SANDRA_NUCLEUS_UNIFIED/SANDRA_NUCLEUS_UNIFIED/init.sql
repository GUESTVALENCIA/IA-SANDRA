-- SANDRA NUCLEUS DATABASE INITIALIZATION
-- PostgreSQL Schema for Complete System

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- SCHEMAS
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS sandra;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS subagents;

-- ============================================================================
-- MAIN TABLES
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS sandra.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'guest',
    tenant_id VARCHAR(100) DEFAULT 'guestsvalencia',
    preferences JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Properties table
CREATE TABLE IF NOT EXISTS sandra.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address JSONB NOT NULL,
    amenities JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    base_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    capacity INTEGER NOT NULL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    property_type VARCHAR(50),
    owner_id UUID REFERENCES sandra.users(id),
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS sandra.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES sandra.properties(id),
    guest_id UUID REFERENCES sandra.users(id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_id VARCHAR(255),
    special_requests TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates CHECK (check_out > check_in)
);

-- Conversations table
CREATE TABLE IF NOT EXISTS sandra.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES sandra.users(id),
    tenant_id VARCHAR(100) DEFAULT 'guestsvalencia',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB DEFAULT '{}'
);

-- Messages table
CREATE TABLE IF NOT EXISTS sandra.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES sandra.conversations(id),
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    intent VARCHAR(50),
    confidence DECIMAL(3, 2),
    tokens_used INTEGER,
    multimodal_data JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ANALYTICS TABLES
-- ============================================================================

-- Events tracking
CREATE TABLE IF NOT EXISTS analytics.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    user_id UUID,
    session_id VARCHAR(255),
    properties JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance metrics
CREATE TABLE IF NOT EXISTS analytics.metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL,
    unit VARCHAR(50),
    tags JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pricing history
CREATE TABLE IF NOT EXISTS analytics.pricing_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES sandra.properties(id),
    date DATE NOT NULL,
    base_price DECIMAL(10, 2),
    dynamic_price DECIMAL(10, 2),
    occupancy_rate DECIMAL(5, 2),
    competitor_avg DECIMAL(10, 2),
    demand_score DECIMAL(5, 2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SUBAGENTS TABLES
-- ============================================================================

-- Subagent registry
CREATE TABLE IF NOT EXISTS subagents.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    capabilities JSONB DEFAULT '[]',
    configuration JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    version VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subagent memory
CREATE TABLE IF NOT EXISTS subagents.memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES subagents.agents(id),
    key VARCHAR(255) NOT NULL,
    value JSONB NOT NULL,
    ttl INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, key)
);

-- Subagent tasks
CREATE TABLE IF NOT EXISTS subagents.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES subagents.agents(id),
    task_type VARCHAR(100) NOT NULL,
    priority INTEGER DEFAULT 5,
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    result JSONB,
    error TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- VECTOR STORE FOR EMBEDDINGS
-- ============================================================================

-- Document embeddings
CREATE TABLE IF NOT EXISTS sandra.embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SYSTEM TABLES
-- ============================================================================

-- Checkpoints
CREATE TABLE IF NOT EXISTS sandra.checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checkpoint_id VARCHAR(100) UNIQUE NOT NULL,
    state JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System logs
CREATE TABLE IF NOT EXISTS sandra.system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON sandra.users(email);
CREATE INDEX idx_users_tenant ON sandra.users(tenant_id);
CREATE INDEX idx_users_active ON sandra.users(is_active);

-- Properties indexes
CREATE INDEX idx_properties_owner ON sandra.properties(owner_id);
CREATE INDEX idx_properties_status ON sandra.properties(status);
CREATE INDEX idx_properties_type ON sandra.properties(property_type);

-- Bookings indexes
CREATE INDEX idx_bookings_property ON sandra.bookings(property_id);
CREATE INDEX idx_bookings_guest ON sandra.bookings(guest_id);
CREATE INDEX idx_bookings_dates ON sandra.bookings(check_in, check_out);
CREATE INDEX idx_bookings_status ON sandra.bookings(status);

-- Conversations indexes
CREATE INDEX idx_conversations_session ON sandra.conversations(session_id);
CREATE INDEX idx_conversations_user ON sandra.conversations(user_id);
CREATE INDEX idx_conversations_tenant ON sandra.conversations(tenant_id);

-- Messages indexes
CREATE INDEX idx_messages_conversation ON sandra.messages(conversation_id);
CREATE INDEX idx_messages_created ON sandra.messages(created_at);

-- Analytics indexes
CREATE INDEX idx_events_type ON analytics.events(event_type);
CREATE INDEX idx_events_user ON analytics.events(user_id);
CREATE INDEX idx_events_timestamp ON analytics.events(timestamp);
CREATE INDEX idx_metrics_name ON analytics.metrics(metric_name);
CREATE INDEX idx_metrics_timestamp ON analytics.metrics(timestamp);

-- Subagents indexes
CREATE INDEX idx_agents_status ON subagents.agents(status);
CREATE INDEX idx_tasks_agent ON subagents.tasks(agent_id);
CREATE INDEX idx_tasks_status ON subagents.tasks(status);

-- Vector search index
CREATE INDEX idx_embeddings_vector ON sandra.embeddings 
    USING ivfflat (embedding vector_cosine_ops) 
    WITH (lists = 100);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION sandra.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update triggers
CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON sandra.users
    FOR EACH ROW
    EXECUTE FUNCTION sandra.update_updated_at();

CREATE TRIGGER update_properties_timestamp
    BEFORE UPDATE ON sandra.properties
    FOR EACH ROW
    EXECUTE FUNCTION sandra.update_updated_at();

CREATE TRIGGER update_bookings_timestamp
    BEFORE UPDATE ON sandra.bookings
    FOR EACH ROW
    EXECUTE FUNCTION sandra.update_updated_at();

CREATE TRIGGER update_agents_timestamp
    BEFORE UPDATE ON subagents.agents
    FOR EACH ROW
    EXECUTE FUNCTION sandra.update_updated_at();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default subagents
INSERT INTO subagents.agents (name, type, capabilities, status) VALUES
    ('pricing-agent', 'pricing', '["dynamic_pricing", "competitor_analysis", "demand_forecast"]', 'active'),
    ('booking-agent', 'booking', '["reservation", "availability", "calendar_sync"]', 'active'),
    ('support-agent', 'support', '["troubleshooting", "faq", "escalation"]', 'active'),
    ('marketing-agent', 'marketing', '["content_creation", "seo", "social_media"]', 'active'),
    ('security-agent', 'security', '["fraud_detection", "policy_enforcement", "audit"]', 'active')
ON CONFLICT (name) DO NOTHING;

-- Insert system user
INSERT INTO sandra.users (email, name, role, tenant_id) VALUES
    ('system@sandra.ai', 'Sandra System', 'system', 'guestsvalencia')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- PERMISSIONS
-- ============================================================================
GRANT ALL PRIVILEGES ON SCHEMA sandra TO sandra_admin;
GRANT ALL PRIVILEGES ON SCHEMA analytics TO sandra_admin;
GRANT ALL PRIVILEGES ON SCHEMA subagents TO sandra_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA sandra TO sandra_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA analytics TO sandra_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA subagents TO sandra_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA sandra TO sandra_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA analytics TO sandra_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA subagents TO sandra_admin;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'SANDRA NUCLEUS Database initialized successfully!';
    RAISE NOTICE 'Version: 100.0.0 GALAXY';
    RAISE NOTICE 'Schemas created: sandra, analytics, subagents';
    RAISE NOTICE 'Default agents registered: 5';
END $$;
