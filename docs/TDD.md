# TDD — Test-Driven Development

## Regla

Escribir **tests antes o junto** con la implementación. No subir lógica de negocio sin tests que la cubran.

## Comandos

```bash
npm test           # run tests once
npm run test:watch # watch mode (red-green-refactor)
npm run test:coverage
```

## Estructura

- Tests en `__tests__/` espejando `src/` (p. ej. `__tests__/engine/GameRunner.test.ts`).
- Tests unitarios para: `core`, `engine`, `systems`, `entities`.
- UI (`src/ui`) y `app/`: tests de integración o E2E en fases posteriores.

## Ciclo TDD

1. **Red**: Escribir un test que falle (comportamiento deseado).
2. **Green**: Mínimo código para que pase.
3. **Refactor**: Limpiar sin romper tests.

## Cobertura

`npm run test:coverage` genera informe en `coverage/`. Objetivo: cubrir engine, systems y core; excluir UI por defecto (ver `jest.config.js`).
