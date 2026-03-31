-- Add agent_id to paired_devices for per-node agent binding
ALTER TABLE paired_devices ADD COLUMN IF NOT EXISTS agent_id VARCHAR(255);
COMMENT ON COLUMN paired_devices.agent_id IS 'Agent assigned to this paired device. Overrides channel-level binding. NULL = use channel/default agent.';
CREATE INDEX IF NOT EXISTS idx_paired_devices_agent_id ON paired_devices(agent_id) WHERE agent_id IS NOT NULL;
