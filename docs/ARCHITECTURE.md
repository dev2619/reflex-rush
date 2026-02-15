# Reflex Rush — Arquitectura

## Visión general

```
┌─────────────────────────────────────────────────────────────┐
│                         UI (React)                           │
│  GameScreen, overlays, menus, tienda                         │
└───────────────────────────┬─────────────────────────────────┘
                             │ state + callbacks
┌────────────────────────────▼─────────────────────────────────┐
│                    GameRunner (orchestrator)                  │
│  Loop, spawn, collision, score, feedback                      │
└──┬──────────┬──────────┬──────────┬──────────┬───────────────┘
   │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼
┌──────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────┐
│Engine│ │Systems │ │Entities│ │Config  │ │ Services   │
│Loop  │ │Input   │ │Player  │ │Remote  │ │ Economy    │
│Coll. │ │Spawn   │ │Threat  │ │        │ │ Analytics  │
└──────┘ │Score   │ └────────┘ └────────┘ │ Monetization│
         │Feedback│                       └────────────┘
         └────────┘
```

## Estructura de carpetas

```
src/
├── core/           # Tipos, constantes, configuración base
├── engine/         # Game loop, colisiones, GameRunner
├── entities/       # Player, Threat, Entity (ECS ligero)
├── systems/        # Input, Spawn, Score, Feedback
├── ui/             # Pantallas, componentes de juego
├── config/         # Remote config, feature flags
├── services/       # Economy, Backend, Meta progresión
├── analytics/      # Capa de eventos (proveedor intercambiable)
└── monetization/   # Hooks Ads + IAP (mockeables)
```

## Flujo del juego

1. **Inicio**: `app/index` crea `GameRunner` con `config` y callbacks. `onStateChange` actualiza estado React y persiste monedas al game over.
2. **Play**: Usuario toca PLAY → `gameRunner.startRun()` → loop arranca, spawn de amenazas, jugador en lane central.
3. **Tick**: Cada frame el loop ejecuta: spawn (SpawnManager), movimiento de amenazas, colisión AABB con jugador, near-miss (slow-mo + bonus), score por tiempo.
4. **Input**: Gestos Pan de `react-native-gesture-handler` llaman `gameRunner.onSwipe(dir)` → cambio de lane del jugador.
5. **Muerte**: Colisión → `kill('collision')` → loop.stop(), estado `gameover`, callbacks (analytics, economy.save).
6. **Retry**: `gameRunner.retry()` → mismo que startRun (reinicio limpio).

## Sistemas desacoplados

| Sistema      | Responsabilidad              | Extensible por              |
|-------------|------------------------------|-----------------------------|
| Input       | Resolver swipe → dirección   | Umbral, nuevos gestos       |
| Spawn       | Cuándo y qué spawn           | Remote config, patrones     |
| Score       | Puntos y monedas por run     | Fórmulas, eventos           |
| Feedback    | Haptics, (sonido/partículas) | Nuevos eventos              |
| Analytics   | Eventos a proveedor          | Cambio de proveedor         |
| Monetization| Ads / IAP                    | Implementación real         |
| RemoteConfig| Balance, flags               | Backend real                |

## Cómo escalar

- **Nuevos modos**: Otro `GameRunner` o mismo runner con `config.mode` y lógica condicional en spawn/collision.
- **Multiplayer async**: `BackendAdapter.submitScore` + `getLeaderboard` ya preparados; añadir pantalla de ranking.
- **Eventos temporales**: Remote config con `eventId`, `eventEndTime`; UI y recompensas según flags.
- **Skins/IA**: `MetaProgression` ya tiene skins/trails; nuevos IDs y desbloqueo por economía o IAP.

## Performance

- Game loop con `requestAnimationFrame` y delta acotado.
- Colisiones AABB sin físicas pesadas.
- Un solo `setState` por tick vía `onStateChange` (evitar re-renders por entidad).
- Haptics y analytics fuera del hot path crítico.
