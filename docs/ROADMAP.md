# Roadmap — Reflex Rush

## Fase 1 — Core (hecho)

- [x] Arquitectura modular
- [x] Game loop con deltaTime
- [x] Entidades Player / Threat
- [x] Colisiones AABB
- [x] Spawn procedural
- [x] Score y monedas por run
- [x] Input swipe → lanes
- [x] Pantalla jugable + retry

## Fase 2 — Game feel

- [x] Partículas en muerte
- [x] Sonidos cortos (swipe, near-miss, game over)
- [x] Slow-mo visual en near-miss (vignette)
- [x] Animaciones de transición de lane (Reanimated)
- [x] Más variedad visual en amenazas (variantes + colores)

## Fase 3 — Meta y economía

- [x] Persistencia de monedas (AsyncStorage ya usado)
- [x] Tienda: skins y trails por monedas
- [x] Daily rewards + racha
- [x] Misiones simples (Juega 3/5 partidas, Score 100/250)
- [x] Revive por monedas o rewarded ad

## Fase 4 — Monetización

- [x] Hooks rewarded video (mock; integrar AdMob / Meta)
- [x] Interstitial suave (entre runs, respetando consent + remove_ads)
- [x] Hooks IAP (mock; remove ads en tienda + logEvent purchase)
- [ ] A/B tests de colocación de ads (feature flags listos)

## Fase 5 — Escala y LiveOps

- [x] Remote config (refresh desde BackendAdapter; mock; sustituir por Firebase)
- [x] Pantalla Leaderboard (UI + adapter mock)
- [x] Eventos temporales (coinMultiplier en run; tienda: banner + skins evento)
- [x] Analytics ad_watch y purchase
- [x] Preparar builds para App Store / Play Store (EAS + README)

## Extensiones futuras

- Modo versus (async o real-time)
- Nuevos modos (timed, survival con power-ups)
- Skins generadas por IA
- Localización y soft launch por países
