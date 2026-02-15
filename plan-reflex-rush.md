# MOBILE GAME MASTER PLAN — HYBRID CASUAL SWIPE ARCADE

## 1. PROPOSITO DEL PROYECTO

Diseñar y construir un videojuego móvil multiplataforma altamente adictivo, fácil de desarrollar y escalar, enfocado en:

- Alta retención
- Monetización híbrida (ads + IAP)
- Producción rápida por un solo desarrollador o equipo pequeño
- Arquitectura modular y escalable
- Compatible con App Store y Play Store

El juego debe poder ser generado o extendido por LLMs usando este documento como blueprint técnico y de producto.

---

## 2. OBJETIVOS PRINCIPALES

### Objetivos de negocio

- Lanzar un MVP funcional en < 60 días
- Alcanzar retención D1 > 30%
- Monetización híbrida desde el día 1
- CAC bajo mediante viralidad orgánica

### Objetivos técnicos

- Multiplataforma (iOS + Android)
- Arquitectura modular
- Backend desacoplado
- Preparado para LiveOps

---

## 3. ESTUDIO DE MERCADO

### Tendencias clave

- Juegos casuales dominan sesiones diarias y engagement
- Sesiones cortas favorecen retención temprana
- Recompensas diarias aumentan retención ~19%
- Hiper casual domina descargas, pero híbrido monetiza mejor
- In-app ads generan ingresos similares a IAP globalmente
- Retención promedio D1 ~30%, D7 ~13%

### Implicaciones

- Hacer juego híbrido casual (no hiper casual puro)
- Loop simple pero con meta progresión
- Monetización híbrida obligatoria
- Diseño enfocado en retención temprana

---

## 4. TIPO DE JUEGO

### Categoría

Hybrid Casual Arcade

### Subgénero

Swipe Reflex Endless Arcade

### Descripción

Juego infinito basado en reflejos donde el jugador sobrevive haciendo swipes rápidos para esquivar amenazas dinámicas en sesiones cortas pero intensas.

Inspiraciones funcionales:

- Loop infinito tipo endless runner
- Controles tipo TikTok swipe
- Feedback dopaminérgico inmediato

---

## 5. NOMBRE DEL JUEGO (LIBRE DE COPYRIGHT)

Nombres sugeridos originales:

- Reflex Rush
- Neon Reflex
- Swipe Reactor
- Pulse Dash
- Rush Vector

Nombre recomendado: Reflex Rush

Motivos:

- Marca original
- Corto
- Fácil de recordar
- SEO amigable

---

## 6. FILOSOFIA DE DISEÑO

### Principios

1. Fácil de aprender, difícil de dominar
2. Reinicio inmediato
3. Feedback constante
4. Dopamina visual y auditiva
5. Progreso cosmético

### Regla de oro

Tiempo desde abrir app hasta jugar < 3 segundos

---

## 7. CORE GAME LOOP

1. Jugador inicia partida
2. Aparecen amenazas dinámicas
3. Jugador hace swipes para sobrevivir
4. Score incrementa
5. Muerte inevitable
6. Recompensa inmediata
7. Botón retry instantáneo

Loop debe durar 10–40 segundos.

---

## 8. MECANICAS PRINCIPALES

### Controles

- Swipe izquierda: esquivar izquierda
- Swipe derecha: esquivar derecha
- Swipe arriba: salto
- Swipe abajo: dash

### Sistema de dificultad

- Velocidad incremental
- Spawn procedural
- Modificadores aleatorios

---

## 9. SISTEMAS SECUNDARIOS

### Meta progresión

- Skins
- Trails
- Efectos visuales
- Avatares

### Engagement systems

- Rachas
- Daily rewards
- Misiones

---

## 10. ESTRATEGIAS DE ADICCION (NEURODISEÑO)

- Near misses (casi morir)
- Slow motion en eventos críticos
- Haptic feedback
- Colores dinámicos
- Reintentos instantáneos

Objetivo: reducir fricción cognitiva.

---

## 11. ESTRATEGIAS DE RETENCION

### Retención temprana

- Tutorial invisible
- Partida inmediata
- Recompensa en primeros 30 segundos

### Retención media

- Streaks diarios
- Cofres temporales
- Misiones cortas

### Retención larga

- Eventos semanales
- Leaderboards
- LiveOps

---

## 12. ESTRATEGIAS DE MONETIZACION

Modelo híbrido recomendado.

### 1. In-App Purchases

- Skins económicas ($0.49–$2.99)
- Eliminación de anuncios
- Multiplicadores temporales
- Starter packs

### 2. Ads

- Rewarded video (principal)
- Interstitial suave
- Sin banners intrusivos

Reglas:

- Ads nunca deben romper el flow
- Rewarded ads ligados a recompensas reales

### 3. Suscripción futura

- VIP pass
- Recompensas diarias extra
- Cosméticos exclusivos

---

## 13. ECONOMIA DEL JUEGO

### Moneda primaria

Coins

### Fuentes

- Partidas
- Ads
- Logins

### Usos

- Skins
- Revives
- Lootboxes cosméticos

---

## 14. ARQUITECTURA FUNCIONAL

### Capas

1. Input layer
2. Game loop engine
3. Physics simplificada
4. Rendering layer
5. Meta systems
6. Monetization layer
7. Analytics layer

Separación estricta de responsabilidades.

---

## 15. ARQUITECTURA TECNICA

### Frontend

React Native + Expo recomendado

Motivos:

- Hot reload
- OTA updates
- Deploy rápido

### Librerías clave

- react-native-reanimated
- react-native-gesture-handler
- expo-haptics
- expo-gl (opcional)

### Alternativa

Unity solo si:

- Se requieren físicas avanzadas
- Multiplayer en tiempo real

---

## 16. ARQUITECTURA DE CODIGO

### Estructura

src/
core/
engine/
entities/
systems/
ui/
services/
analytics/
monetization/

Principio: ECS simplificado (Entity Component System)

---

## 17. GAME ENGINE INTERNO

Loop basado en:
requestAnimationFrame o game ticker

Responsabilidades:

- Tick rate estable
- Spawn procedural
- Colisiones simplificadas

---

## 18. BACKEND (OPCIONAL PERO RECOMENDADO)

### Stack

Firebase o Supabase

### Servicios

- Leaderboards
- Remote config
- Feature flags
- LiveOps

Backend debe ser reemplazable.

---

## 19. ANALYTICS

Eventos obligatorios:

- session_start
- run_start
- run_end
- death_reason
- ad_watch
- purchase
- retention_day

Objetivo: optimización continua.

---

## 20. LIVEOPS READY

El juego debe soportar:

- Eventos temporales
- Cambios remotos de dificultad
- Skins limitadas
- Temporadas

Implementar Remote Config desde inicio.

---

## 21. UX CRITICA

### Tiempo a diversión

< 5 segundos

### Navegación

1 pantalla principal
1 pantalla de tienda
1 pantalla de misiones

Minimalismo extremo.

---

## 22. ROADMAP DE DESARROLLO

### Fase 1 — Core

- Loop jugable
- Swipes
- Colisiones
- Score

### Fase 2 — Feel

- Animaciones
- Haptics
- Partículas

### Fase 3 — Meta

- Skins
- Economía
- Recompensas

### Fase 4 — Monetización

- Ads
- IAP
- Pricing tests

### Fase 5 — Escala

- Analytics
- Remote config
- A/B testing

---

## 23. ESCALABILIDAD

Diseño preparado para:

- Multiplayer async
- UGC
- Modos nuevos
- Expansiones temáticas

Arquitectura modular obligatoria.

---

## 24. SEGURIDAD Y COMPLIANCE

- GDPR ready
- ATT iOS
- Consentimiento de ads
- Compras seguras

---

## 25. ESTRATEGIA DE LANZAMIENTO

### Soft launch

Países sugeridos:

- Colombia
- Filipinas
- Indonesia

### Objetivo

Medir:

- Retención
- CTR ads
- Conversión IAP

---

## 26. KPIs OBJETIVO

- D1 > 30%
- D7 > 10%
- ARPDAU positivo
- Session count > 3 diarios

---

## 27. OPTIMIZACION CON LLM

El proyecto debe ser LLM-friendly.

### Reglas

- Código modular
- Documentación inline
- Interfaces claras
- Tipado estricto

---

## 28. EXTENSIONES FUTURAS

- Modo versus
- Editor de niveles
- NFTs (opcional)
- AI-generated skins

---

## 29. PRINCIPIOS CLAVE

- Simplicidad > complejidad
- Feedback inmediato
- Escalabilidad desde día 1
- Monetización sin romper diversión

---

## 30. DEFINICION DE EXITO

Un juego exitoso cumple:

- Jugable en < 1 minuto
- Adictivo en primeras 3 sesiones
- Monetizable sin paywall
- Expandible como plataforma

---

## 31. INSTRUCCIONES PARA UN LLM

Al recibir este documento, el LLM debe:

1. Generar arquitectura base
2. Crear skeleton del proyecto
3. Implementar game loop
4. Añadir sistemas modulares
5. Preparar monetización
6. Dejar hooks para escalabilidad

El desarrollo debe priorizar:

- Performance
- Modularidad
- Iteración rápida
- UX adictiva

---

FIN DEL DOCUMENTO
