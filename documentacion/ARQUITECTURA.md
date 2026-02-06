# 🏗️ Arquitectura del Proyecto Pokedex

## 📋 Descripción General

Este proyecto ha sido organizado siguiendo una **arquitectura por capas modular**, separando responsabilidades y facilitando el mantenimiento, escalabilidad y testing.

## 📁 Estructura de Carpetas

```
src/
├── 📦 core/                    # Configuración y funcionalidad central
│   └── config/                 # Archivos de configuración
│       ├── app.config.ts       # Configuración centralizada
│       └── index.ts            # Barrel export
│
├── 🎯 features/                # Módulos por funcionalidad
│   ├── pokedex/               # Feature: Pokedex
│   │   ├── components/        # Componentes del Pokedex
│   │   │   ├── Pokedex.tsx   # Componente principal
│   │   │   ├── PokedexMenu.tsx
│   │   │   └── index.ts
│   │   ├── hooks/             # Custom hooks del Pokedex
│   │   │   ├── usePokemon.ts
│   │   │   └── index.ts
│   │   ├── styles/            # Estilos específicos del Pokedex
│   │   │   ├── pokedex.css
│   │   │   └── pokedex-menu.css
│   │   └── index.ts           # Barrel export del feature
│   │
│   └── battle/                # Feature: Sistema de batallas
│       ├── components/        # Componentes de batalla
│       │   ├── BattleArena.tsx
│       │   ├── TrainerNameModal.tsx
│       │   └── index.ts
│       ├── hooks/             # Custom hooks de batalla (futuro)
│       ├── styles/            # Estilos específicos de batalla
│       │   ├── battle-arena.css
│       │   └── trainer-modal.css
│       └── index.ts           # Barrel export del feature
│
├── 🔗 shared/                  # Código compartido entre features
│   ├── models/                # Tipos e interfaces TypeScript
│   │   ├── pokemon.model.ts
│   │   ├── battle.model.ts
│   │   ├── storage.model.ts
│   │   └── index.ts
│   │
│   ├── services/              # Servicios de API y lógica de negocio
│   │   ├── pokemon.service.ts # Servicio para API de Pokémon
│   │   └── index.ts
│   │
│   ├── utils/                 # Utilidades generales
│   │   ├── storage.util.ts   # Gestión de localStorage
│   │   └── index.ts
│   │
│   ├── helpers/               # Funciones auxiliares
│   │   ├── pokemon.helpers.ts # Helpers para cálculos de Pokémon
│   │   └── index.ts
│   │
│   ├── constants/             # Constantes de la aplicación
│   │   ├── pokemon.constants.ts
│   │   ├── storage.constants.ts
│   │   └── index.ts
│   │
│   ├── components/            # Componentes reutilizables
│   │   ├── DPad.tsx          # Control direccional
│   │   └── index.ts
│   │
│   └── index.ts               # Barrel export principal
│
├── 🎨 assets/                  # Recursos estáticos
├── 📄 App.tsx                  # Componente raíz
├── 📄 main.tsx                 # Entry point
└── 📄 index.css                # Estilos globales
```

## 🔑 Principios de la Arquitectura

### 1. **Separación por Capas**
- **Core**: Configuración y lógica central de la app
- **Features**: Módulos funcionales independientes (Pokedex, Battle)
- **Shared**: Código reutilizable entre features

### 2. **Modularidad**
Cada feature es autocontenido con sus propios:
- ✅ Componentes
- ✅ Hooks
- ✅ Estilos
- ✅ Lógica de negocio

### 3. **Barrel Exports (index.ts)**
Cada carpeta tiene un `index.ts` que exporta su contenido:
```typescript
// ✅ Import limpio
import { Pokedex, usePokemon } from '@/features/pokedex';

// ❌ Import complicado (evitado)
import Pokedex from '@/features/pokedex/components/Pokedex';
import { usePokemon } from '@/features/pokedex/hooks/usePokemon';
```

### 4. **Separación de Responsabilidades**

#### **Models** (shared/models/)
- Definición de tipos e interfaces TypeScript
- Sin lógica de negocio
- Reutilizables en toda la app

#### **Services** (shared/services/)
- Lógica de comunicación con APIs externas
- Transformación de datos
- Clases con métodos estáticos

#### **Utils** (shared/utils/)
- Funciones de propósito general
- Gestión de almacenamiento
- Sin dependencias de UI

#### **Helpers** (shared/helpers/)
- Funciones auxiliares específicas
- Cálculos y transformaciones
- Funciones puras

#### **Constants** (shared/constants/)
- Valores constantes
- URLs de API
- Configuraciones inmutables

## 🎯 Ventajas de esta Arquitectura

### ✅ **Mantenibilidad**
- Código organizado y fácil de encontrar
- Cada archivo tiene una única responsabilidad
- Cambios localizados en módulos específicos

### ✅ **Escalabilidad**
- Fácil agregar nuevos features sin afectar existentes
- Estructura preparada para crecimiento
- Separación clara de dependencias

### ✅ **Reutilización**
- Componentes compartidos en `shared/components`
- Servicios y utilidades centralizados
- Lógica de negocio no duplicada

### ✅ **Testing**
- Servicios y helpers fáciles de testear (funciones puras)
- Componentes aislados
- Mocks sencillos de implementar

### ✅ **Colaboración**
- Estructura clara para equipos
- Menos conflictos en control de versiones
- Onboarding más rápido

## 📚 Guía de Uso

### Agregar un Nuevo Feature

```bash
src/features/nuevo-feature/
├── components/
│   ├── NuevoComponente.tsx
│   └── index.ts
├── hooks/
│   ├── useNuevoHook.ts
│   └── index.ts
├── styles/
│   └── nuevo-feature.css
└── index.ts
```

### Agregar un Nuevo Servicio

```typescript
// shared/services/nuevo.service.ts
export class NuevoService {
  static async metodo() {
    // Lógica del servicio
  }
}
```

### Agregar Nuevos Helpers

```typescript
// shared/helpers/nuevo.helpers.ts
export const calcularAlgo = (param: number): number => {
  return param * 2;
};
```

## 🔄 Migración desde Estructura Anterior

Los archivos antiguos permanecen intactos en:
- `src/components/` (original)
- `src/hooks/` (original)
- `src/types/` (original)
- `src/utils/` (original)
- `src/styles/` (original)

La nueva estructura es **paralela** y **no destructiva**.

## 🚀 Próximos Pasos Sugeridos

1. **Agregar tests** en estructura paralela:
   ```
   src/features/pokedex/__tests__/
   src/shared/services/__tests__/
   ```

2. **Implementar path aliases** en `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/features/*": ["./src/features/*"],
         "@/shared/*": ["./src/shared/*"],
         "@/core/*": ["./src/core/*"]
       }
     }
   }
   ```

3. **Crear contextos globales** en `core/context/`

4. **Agregar documentación** en cada feature con README.md

## 📖 Referencias

- **Clean Architecture**: Separación de capas
- **Feature-Sliced Design**: Organización por features
- **Atomic Design**: Componentes reutilizables
- **SOLID Principles**: Responsabilidad única

---

**Fecha de creación**: Febrero 2026  
**Versión**: 1.0.0
