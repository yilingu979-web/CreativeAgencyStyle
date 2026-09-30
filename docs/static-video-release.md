# Full-length portfolio videos

The four full films are served from `/assets/works/full/` on the same host as the site. They do not use OSS, the FC signing service, or api.koujikeji.com. Cards retain muted looping previews; opening a card loads the full MP4 with sound and native controls. Closing the dialog stops full playback and resumes visible previews.

Web exports preserve complete duration and audio, use H.264/AAC MP4 with faststart, 30 fps, landscape height 1080 (original aspect ratio), and portrait width 1080. Originals remain on the owner's desktop. Download controls are hidden, but public media can still be saved.

GitHub Pages has a 1 GB site limit and a soft 100 GB/month bandwidth limit; this is suitable only while the portfolio remains within those limits. The normal production deployment runs through pages.yml. The older publish-demo workflow is manual-only and shares its deployment concurrency group.

The earlier private-media implementation and contact-service configuration are not part of this release. No cloud resources or paid subscriptions are provisioned by this change.
