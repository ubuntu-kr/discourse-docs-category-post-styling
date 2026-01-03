# Discourse Docs Category Post Styling Component

This Discourse theme component applies content focused style on posts of specific categories. It basically update styles on first post of each topics to hide author's avatar then make the post area a bit wider on desktop.

## Structure
- `common/common.scss`: shared styling hooks for wiki posts.
- `desktop/desktop.scss`: desktop-specific tweaks.
- `mobile/mobile.scss`: mobile-specific tweaks.
- `settings.yml`: theme settings and descriptions (including target categories).
- `javascripts/discourse/api-initializers/post-meta-script.js`: Scripts for altering author metadata on the post.

## Development
1. Install as a theme component in your Discourse instance.
2. Configure `target_categories` in theme settings to limit where the wiki styling and comment toggle apply.
3. Update the SCSS files with the desired wiki post styles, referencing any settings you add.
4. Reload the theme preview to verify changes across desktop and mobile.
