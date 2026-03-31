-- Remove agent_id from paired_devices
DROP INDEX IF EXISTS idx_paired_devices_agent_id;
ALTER TABLE paired_devices DROP COLUMN IF EXISTS agent_id;
