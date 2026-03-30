package store

import (
	"context"
	"log/slog"
	"time"

	"github.com/nextlevelbuilder/goclaw/internal/cache"
)

const contactSeenTTL = 30 * time.Minute

// ContactCollector wraps ContactStore with an in-memory "seen" cache
// to avoid redundant UPSERT queries on every message.
type ContactCollector struct {
	store ContactStore
	seen  cache.Cache[string] // Cache display_name instead of bool
}

// NewContactCollector creates a new collector backed by the given store and cache.
func NewContactCollector(s ContactStore, c cache.Cache[string]) *ContactCollector {
	return &ContactCollector{store: s, seen: c}
}

// EnsureContact creates or refreshes a contact entry, skipping DB if recently seen with same name.
// contactType: "user" (individual sender) or "group" (group chat entity).
func (c *ContactCollector) EnsureContact(ctx context.Context, channelType, channelInstance, senderID, userID, displayName, username, peerKind, contactType string) {
	key := channelType + ":" + senderID
	
	// Check cache: skip only if name hasn't changed
	if cachedName, ok := c.seen.Get(ctx, key); ok && cachedName == displayName {
		return
	}
	
	if contactType == "" {
		contactType = "user"
	}
	if err := c.store.UpsertContact(ctx, channelType, channelInstance, senderID, userID, displayName, username, peerKind, contactType); err != nil {
		slog.Warn("contact_collector.upsert_failed", "error", err, "channel", channelType, "sender", senderID)
		return
	}
	
	// Cache the new display_name
	c.seen.Set(ctx, key, displayName, contactSeenTTL)
}

// ResolveTenantUserID delegates to the underlying ContactStore.
func (c *ContactCollector) ResolveTenantUserID(ctx context.Context, channelType, senderID string) (string, error) {
	return c.store.ResolveTenantUserID(ctx, channelType, senderID)
}
