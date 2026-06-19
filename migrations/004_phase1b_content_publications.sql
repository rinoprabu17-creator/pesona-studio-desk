CREATE TABLE content_publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL REFERENCES content_items(id),
  channel text NOT NULL,
  publication_format text NOT NULL,
  planned_publish_at timestamptz,
  publication_status text NOT NULL DEFAULT 'planned',
  platform_title text,
  platform_caption text,
  published_url text,
  published_at timestamptz,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_publications_item_channel_format_key UNIQUE (content_item_id, channel, publication_format),
  CONSTRAINT content_publications_channel_check CHECK (
    channel = ANY (ARRAY['instagram', 'facebook', 'tiktok', 'youtube', 'whatsapp_status'])
  ),
  CONSTRAINT content_publications_format_check CHECK (
    publication_format = ANY (ARRAY['reel', 'short_video', 'feed_video', 'feed_image', 'carousel', 'status_video', 'status_image', 'standard_video'])
  ),
  CONSTRAINT content_publications_channel_format_check CHECK (
    (channel IN ('instagram', 'facebook') AND publication_format IN ('reel', 'feed_video', 'feed_image', 'carousel'))
    OR (channel = 'tiktok' AND publication_format = 'short_video')
    OR (channel = 'youtube' AND publication_format IN ('short_video', 'standard_video'))
    OR (channel = 'whatsapp_status' AND publication_format IN ('status_video', 'status_image'))
  ),
  CONSTRAINT content_publications_status_check CHECK (
    publication_status = ANY (ARRAY['planned', 'scheduled', 'publishing', 'posted', 'failed', 'cancelled'])
  ),
  CONSTRAINT content_publications_schedule_required_check CHECK (
    publication_status NOT IN ('scheduled', 'publishing', 'posted') OR planned_publish_at IS NOT NULL
  ),
  CONSTRAINT content_publications_posted_at_required_check CHECK (
    publication_status <> 'posted' OR published_at IS NOT NULL
  ),
  CONSTRAINT content_publications_failure_reason_required_check CHECK (
    publication_status <> 'failed' OR NULLIF(btrim(COALESCE(failure_reason, '')), '') IS NOT NULL
  ),
  CONSTRAINT content_publications_youtube_title_required_check CHECK (
    NOT (channel = 'youtube' AND publication_status IN ('scheduled', 'publishing', 'posted'))
    OR NULLIF(btrim(COALESCE(platform_title, '')), '') IS NOT NULL
  )
);

CREATE INDEX content_publications_content_item_id_idx ON content_publications (content_item_id);
CREATE INDEX content_publications_status_schedule_idx ON content_publications (publication_status, planned_publish_at);
CREATE INDEX content_publications_channel_status_idx ON content_publications (channel, publication_status);
CREATE INDEX content_publications_planned_publish_at_idx ON content_publications (planned_publish_at);
