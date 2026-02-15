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
- [ ] Sonidos cortos (swipe, near-miss, game over)
- [ ] Slow-mo visual en near-miss (ya hay lógica; reforzar en UI)
- [ ] Animaciones de transición de lane (Reanimated)
- [ ] Más variedad visual en amenazas (formas/colores por tipo)

## Fase 3 — Meta y economía

- [x] Persistencia de monedas (AsyncStorage ya usado)
- [x] Tienda: skins y trails por monedas
- [x] Daily rewards + racha
- [x] Misiones simples (Juega 3/5 partidas, Score 100/250)
- [x] Revive por monedas o rewarded ad

## Fase 4 — Monetización

- [x] Hooks rewarded video (mock; integrar AdMob / Meta)
- [ ] Interstitial suave (entre runs)
- [x] Hooks IAP (mock; remove ads, starter pack, coin packs)
- [ ] A/B tests de colocación de ads

## Fase 5 — Escala y LiveOps

- [ ] Remote config real (Firebase o similar)
- [x] Pantalla Leaderboard (UI + adapter mock)
- [ ] Eventos temporales (doble monedas, skins limitadas)
- [ ] Analytics en producción y dashboards
- [ ] Preparar builds para App Store / Play Store

## Extensiones futuras

- Modo versus (async o real-time)
- Nuevos modos (timed, survival con power-ups)
- Skins generadas por IA
- Localización y soft launch por países
