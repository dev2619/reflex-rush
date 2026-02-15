# Verificación del plan — plan-reflex-rush.md

Comparación del **plan maestro** con el estado actual del código.  
Última revisión: según implementación actual.

---

## Resumen ejecutivo

| Estado | Descripción |
|--------|-------------|
| ✅ | Cubierto por el plan e implementado |
| ⚠️ | Parcial (falta integración o detalle) |
| ❌ | No implementado o solo stub |

---

## Por secciones del plan

### §1–6 Propósito, objetivos, mercado, tipo de juego, nombre, filosofía
**Estado: ✅**  
El proyecto cumple: Reflex Rush, híbrido casual, swipe reflex endless. Filosofía (fácil de aprender, reinicio inmediato, feedback, progreso cosmético) reflejada en la UX.

---

### §7 Core game loop (1–7)
**Estado: ✅**  
- Inicio partida, amenazas dinámicas, swipes, score, muerte, recompensa, retry.  
- Loop 10–40 s asumido por dificultad incremental y spawn.

---

### §8 Mecánicas principales

| Requisito | Estado |
|-----------|--------|
| Swipe izquierda/derecha | ✅ |
| Swipe arriba = salto | ✅ (offset Y + lane arriba) |
| Swipe abajo = dash | ✅ (invulnerabilidad + lane abajo) |
| Velocidad incremental | ✅ `SpawnManager` + `ScoreSystem` |
| Spawn procedural | ✅ |
| Modificadores aleatorios | ✅ (variantes de amenaza: normal/fast/wide) |

---

### §9 Sistemas secundarios

| Requisito | Estado |
|-----------|--------|
| Skins | ✅ MetaProgression + tienda |
| Trails | ✅ MetaProgression + tienda |
| Efectos visuales | ⚠️ Tipo `EffectId` en Meta; no hay API equipar/desbloquear ni UI |
| Avatares | ❌ No en meta ni UI |
| Rachas | ✅ DailyRewardService + MissionsScreen ("Racha: N días") |
| Daily rewards | ✅ DailyRewardService + UI |
| Misiones | ✅ MissionService + MissionsScreen |

---

### §10 Estrategias de adicción (neurodiseño)

| Requisito | Estado |
|-----------|--------|
| Near misses | ✅ Colisión cercana → bonus + slow-mo |
| Slow motion en eventos críticos | ✅ Lógica + vignette en UI |
| Haptic feedback | ✅ FeedbackSystem (expo-haptics) |
| Colores dinámicos | ✅ Variantes de amenaza (3 colores) |
| Reintentos instantáneos | ✅ Botón RETRY |

---

### §11 Estrategias de retención

| Requisito | Estado |
|-----------|--------|
| Tutorial invisible / partida inmediata | ✅ Una pantalla → PLAY |
| Recompensa en primeros 30 s | ✅ Monedas por tiempo + near-miss |
| Streaks diarios | ✅ DailyRewardService |
| Cofres temporales | ⚠️ Lootbox en tienda; no "temporales" (ventana de tiempo) |
| Misiones cortas | ✅ |
| Eventos semanales | ⚠️ EventService existe; no hay UI ni flujo semanal |
| Leaderboards | ✅ Pantalla + BackendAdapter (mock/Firebase stub) |
| LiveOps | ⚠️ Capas listas; backend real pendiente |

---

### §12 Monetización

| Requisito | Estado |
|-----------|--------|
| IAP skins económicas | ✅ Hooks (mock); tienda con monedas |
| Eliminación de anuncios | ✅ IAP en contexto; tienda tiene "Quitar anuncios"; ads gated por `!iap.hasPurchased('remove_ads')` |
| Multiplicadores / starter packs | ✅ Hooks IAP (mock) |
| Rewarded video | ✅ Revive + hook mock |
| Interstitial suave | ✅ Entre partidas (cada N games, con consent) |
| Sin banners intrusivos | ✅ |
| Ads no rompen flow | ✅ Interstitial solo en game over |

---

### §13 Economía del juego

| Requisito | Estado |
|-----------|--------|
| Moneda: coins | ✅ |
| Fuentes: partidas, ads, logins | ✅ (coins por run, rewarded, bonus por login) |
| Usos: skins, revives, lootboxes | ✅ |

---

### §14–17 Arquitectura y engine

**Estado: ✅**  
Capas (input, loop, physics simplificada, rendering, meta, monetization, analytics), estructura `src/` (core, engine, entities, systems, ui, services, analytics, monetization), loop con tick estable, spawn procedural, colisiones AABB.

---

### §18 Backend

| Requisito | Estado |
|-----------|--------|
| Firebase/Supabase reemplazable | ✅ BackendAdapter + FirebaseAdapter stub |
| Leaderboards | ✅ getLeaderboard + submitScore (mock/stub) |
| Remote config | ✅ createRemoteConfig(backend); refresh() llama getRemoteConfig() y aplica flags/numbers/config |
| Feature flags | ✅ getFlag/getNumber rellenados desde backend en refresh() |
| LiveOps | ⚠️ EventService; sin backend real |

---

### §19 Analytics

| Evento | Estado |
|--------|--------|
| session_start | ✅ |
| run_start | ✅ |
| run_end | ✅ |
| death_reason | ✅ |
| ad_watch | ✅ Se llama en app/index al completar rewarded (revive) |
| purchase | ✅ Se llama en ShopScreen al completar IAP (p. ej. remove_ads) |
| retention_day | ✅ |

---

### §20 LiveOps ready

| Requisito | Estado |
|-----------|--------|
| Eventos temporales | ✅ EventService; tienda muestra banner y skins "(evento)"; economía aplica coinMultiplier al dar monedas por run |
| Cambios remotos de dificultad | ✅ RemoteConfig.refresh() aplica números a GameConfig (spawnIntervalMs, etc.) |
| Skins limitadas | ✅ Tienda ordena/filtra por limitedSkinIds del evento activo y marca "(evento)" |
| Temporadas | ⚠️ Mismo modelo que eventos; sin UI específica de temporada |
| Remote Config desde inicio | ✅ refresh() en arranque (GameProvider); backend mock devuelve {}; sustituir por Firebase para datos reales |

---

### §21 UX crítica

| Requisito | Estado |
|-----------|--------|
| Tiempo a diversión < 5 s | ✅ |
| 1 pantalla principal, 1 tienda, 1 misiones | ✅ |
| Minimalismo | ✅ |

---

### §22 Roadmap (Fases 1–5)

- **Fase 1 Core**: ✅  
- **Fase 2 Feel**: ✅ (sonidos, slow-mo visual, animación lane, variedad amenazas, partículas)  
- **Fase 3 Meta**: ✅ (economía, tienda, daily, misiones, revive)  
- **Fase 4 Monetización**: ✅ hooks; ⚠️ falta enlazar IAP remove_ads y analytics ad_watch/purchase  
- **Fase 5 Escala**: ⚠️ Remote config real, eventos en UI, analytics en producción; ✅ EAS/builds en README  

---

### §24 Seguridad y compliance

| Requisito | Estado |
|-----------|--------|
| GDPR ready | ✅ ConsentScreen + ConsentService |
| ATT iOS | ✅ ConsentState.attAccepted |
| Consentimiento de ads | ✅ Ads condicionados a consent.ads |
| Compras seguras | ✅ Hooks IAP (implementación real pendiente) |

---

## Pendiente / recomendado (por prioridad)

1. ~~**Analytics ad_watch / purchase**~~ — **Hecho:** `ad_watch` en revive por anuncio; `purchase` en tienda al comprar "Quitar anuncios".
2. ~~**Remove ads IAP**~~ — **Hecho:** IAP en contexto; `canShowAds = consent?.ads && !iap.hasPurchased('remove_ads')`; tienda con botón "Quitar anuncios".
3. ~~**Remote config real**~~ — **Hecho:** `createRemoteConfig(backend)`; `refresh()` llama `getRemoteConfig()` y aplica flags/numbers/config; se llama en GameProvider al montar.
4. ~~**Eventos temporales en producto**~~ — **Hecho:** En game over se aplica `event.coinMultiplier` a monedas del run; tienda muestra banner de evento y skins "(evento)" cuando hay `limitedSkinIds`.

5. **Efectos visuales (y opcional avatares)**  
   - Si el plan se mantiene: extender MetaProgression con getEquippedEffect / setEquippedEffect y persistencia; añadir UI mínima (selector de efecto).

6. **Cofres temporales (opcional)**  
   - Si se desea: lootbox o cofre con ventana de tiempo usando `EventService` (evento activo con endTime).

7. **A/B testing**  
   - No implementado; se puede añadir con feature flags (Remote config ya expone getFlag).

---

## Conclusión

El plan está **cumplido en su mayoría**: core, feel, meta, monetización (hooks), compliance y preparación de builds están cubiertos.  
Quedan sobre todo **integraciones** (analytics ad_watch/purchase, IAP remove_ads, Remote config + eventos en UI) y, si se quieren alinear al 100 % con el plan, **efectos/avatares** y **cofres/eventos temporales** en la UX.
