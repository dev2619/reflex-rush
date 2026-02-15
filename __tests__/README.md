# TDD — Reflex Rush / Space Swipe Shooter

Los tests garantizan el comportamiento del core del juego antes de cada commit o despliegue.

## Cómo garantizar TDD

1. **Ejecutar tests antes de commit**
   ```bash
   npm test
   ```

2. **Cobertura**
   ```bash
   npm run test:coverage
   ```

3. **Watch (desarrollo)**
   ```bash
   npm run test:watch
   ```

## Estructura

| Carpeta        | Qué cubre |
|----------------|-----------|
| `entities/`    | PlayerShip, Projectile (pool), Destructible, Coin, Powerup |
| `engine/`      | GameLoop, CollisionSystem, GameRunner (fleet, swipe, game over) |
| `systems/`     | WeaponSystem, FleetSystem, DamageSystem, DropSystem, SpaceSpawnManager, SpawnManager, ScoreSystem, InputSystem, FeedbackSystem |
| `config/`      | ShopCatalog |
| `services/`    | MissionService, DailyRewardService |

## Regla

**Todo cambio en `src/entities`, `src/engine`, `src/systems` o `src/core` debe mantener o ampliar tests.** Si añades una feature nueva, añade tests en `__tests__/entities`, `__tests__/engine` o `__tests__/systems` según corresponda.

## Tests totales

- **97 tests** en 20 suites (tras la evolución Space Swipe Shooter).
- Entidades y sistemas del shooter están cubiertos por tests unitarios.
