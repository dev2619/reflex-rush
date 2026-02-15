# Reflex Rush

Hybrid casual arcade móvil: **Swipe Reflex Endless**. Sobrevive con gestos swipe, puntúa en el tiempo, reinicio inmediato.

## Stack

- **React Native + Expo** (SDK 54)
- **TypeScript** estricto
- **react-native-gesture-handler** + **react-native-reanimated**
- **expo-haptics**

## Requisitos

- Node 18+
- npm / yarn / pnpm
- Expo Go (iOS/Android) o simuladores

## Instalación

```bash
npm install
```

Añade assets en `assets/`: `icon.png` (1024×1024), `splash-icon.png`, `adaptive-icon.png` (1024×1024). O genera con:

```bash
npx create-expo-app@latest temp-reflex --template blank-typescript
# Copia assets desde temp-reflex/assets a ./assets y borra temp-reflex
```

## Ejecución

```bash
npx expo start
```

- **i** → iOS Simulator  
- **a** → Android emulator  
- Escanear QR con Expo Go en dispositivo físico

## Tests (TDD)

Regla: **nueva lógica en core/engine/systems debe tener tests**.

```bash
npm test              # una vez
npm run test:watch    # watch (red-green-refactor)
npm run test:coverage
```

Ver [docs/TDD.md](docs/TDD.md).

## Estructura del proyecto

```
__tests__/     Tests (TDD); espeja src/engine, src/systems
src/
  core/         Tipos, constantes
  engine/       Game loop, colisiones, GameRunner
  entities/     Player, Threat
  systems/      Input, Spawn, Score, Feedback
  ui/           GameScreen
  config/       Remote config
  services/     Economy, Backend, Meta progresión
  analytics/    Eventos (proveedor intercambiable)
  monetization/ Ads + IAP hooks (mock)
app/
  _layout.tsx   Root + GestureHandler
  index.tsx     Entrada, creación de GameRunner
docs/
  ARCHITECTURE.md
```

## Controles

- **Swipe izquierda/derecha**: cambiar lane (esquivar)
- **Swipe arriba/abajo**: opcionalmente lane arriba/abajo (MVP: mismo que left/right)
- **PLAY / RETRY**: botón en pantalla

## Monetización (hooks)

- **Ads**: `src/monetization/AdsHooks.ts` — implementar `showRewarded`, `showInterstitial` con AdMob u otro.
- **IAP**: `src/monetization/IAPHooks.ts` — implementar con expo-in-app-purchases o similar.
- Sustituir mocks en producción sin tocar el core.

## Analytics

- `src/analytics/AnalyticsLayer.ts`: `logEvent(event, payload)`.
- Sustituir `setAnalyticsProvider(mockProvider)` por Firebase/Mixpanel/etc.
- Eventos: `session_start`, `run_start`, `run_end`, `death_reason`, `retry`, `ad_watch`, `purchase`.

## Escalabilidad

- **Modos nuevos**: mismo runner con distinta config o segundo runner.
- **Leaderboards**: `BackendAdapter` (Firebase/Mock) ya definido.
- **Remote config**: `config/RemoteConfig.ts` listo para variables remotas.
- **Meta progresión**: skins/trails en `services/MetaProgression.ts`; economía en `EconomyService`.

## Roadmap

Véase [docs/ROADMAP.md](docs/ROADMAP.md).

## Licencia

Privado / según repositorio.
