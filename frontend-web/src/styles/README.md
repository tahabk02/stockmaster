# Styles Directory — README

## Arabic (العربية)

هذا المجلد يحتوي على ملفات SASS المستخدمة في المشروع:

- `_variables.scss`: متغيرات التصميم (ألوان، خطوط، أحجام).
- `_mixins.scss`: mixins قابلة لإعادة الاستخدام (محاذاة، تأثير زجاجي، ظل).
- `_utilities.scss`: مساعدات صغيرة مثل `.aspect-9-16` و `%visually-hidden`.
- `components/_call-overlay.scss`: أنماط خاصة بمكوّن CallOverlay.
- `main.scss`: نقطة الإدخال التي تجمع partials وتصدّر متغيرات كـ CSS custom properties.

استراتيجية: استخدام Tailwind للـ utilities السريعة وSASS للـ tokens وmixins وoverrides المكوّنات.

## Français

Ce dossier contient les fichiers SASS du projet:

- `_variables.scss`: variables de design (couleurs, tailles, polices).
- `_mixins.scss`: mixins réutilisables (centrage, effet glass, ombre).
- `_utilities.scss`: helpers (e.g. `.aspect-9-16`, `%visually-hidden`).
- `components/_call-overlay.scss`: styles spécifiques au composant CallOverlay.
- `main.scss`: point d'entrée qui regroupe les partials et expose des variables en custom properties CSS.

Stratégie: continuer d'utiliser Tailwind pour les utilitaires, SASS pour tokens, mixins et overrides composants.

## English

This folder contains the project's SASS files:

- `_variables.scss`: design variables (colors, sizes, fonts).
- `_mixins.scss`: reusable mixins (centering, glass effect, shadow).
- `_utilities.scss`: small helpers (e.g. `.aspect-9-16`, `%visually-hidden`).
- `components/_call-overlay.scss`: component-specific styles for CallOverlay.
- `main.scss`: entry point that gathers partials and exports variables as CSS custom properties.

Strategy: keep using Tailwind for quick utilities and SASS for tokens, mixins, and component overrides.
