# 🚀 Guía Rápida de Uso - Nueva Arquitectura

## ⚡ TL;DR

Tu proyecto ahora tiene **dos estructuras paralelas**:
- ✅ **Antigua** (en `src/components/`, `src/hooks/`, etc.) - **Funciona perfectamente**
- ✅ **Nueva** (en `src/features/`, `src/shared/`, etc.) - **Mejor organizada**

**No eliminamos nada**. Todo sigue funcionando. La nueva estructura es adicional y mejorada.

---

## 🎯 Cómo Usar la Nueva Estructura

### 1️⃣ Importar Componentes

#### ❌ Antes (Aún funciona)
```typescript
import Pokedex from './components/Pokedex';
import { BattleArena } from './components/BattleArena';
```

#### ✅ Ahora (Recomendado)
```typescript
import { Pokedex } from './features/pokedex';
import { BattleArena } from './features/battle';
```

---

### 2️⃣ Importar Tipos

#### ❌ Antes
```typescript
import type { Pokemon } from './types/pokemon';
```

#### ✅ Ahora
```typescript
import type { Pokemon } from './shared/models';
// o más corto:
import type { Pokemon } from './shared';
```

---

### 3️⃣ Importar Servicios

#### ❌ Antes (No existía)
```typescript
// Lógica mezclada en hooks
```

#### ✅ Ahora (Separado y limpio)
```typescript
import { PokemonService } from './shared/services';

// Usar el servicio
const pokemon = await PokemonService.loadPokemon(1);
```

---

### 4️⃣ Importar Utilidades

#### ❌ Antes
```typescript
import { loadTeamData } from './utils/storage';
```

#### ✅ Ahora
```typescript
import { loadTeamData } from './shared/utils';
// o
import { StorageUtil } from './shared/utils';
const data = StorageUtil.loadTeamData();
```

---

### 5️⃣ Importar Constantes

#### ❌ Antes (hardcoded)
```typescript
const SHINY_RATE = 1/4096;
const MAX_TEAM_SIZE = 6;
```

#### ✅ Ahora (centralizado)
```typescript
import { SHINY_RATE, MAX_TEAM_SIZE } from './shared/constants';
```

---

## 📂 Dónde Encontrar las Cosas

| Necesitas... | Ve a... |
|--------------|---------|
| 🎨 **Componente de Pokedex** | `src/features/pokedex/components/` |
| ⚔️ **Componente de Battle** | `src/features/battle/components/` |
| 🎣 **Hooks** | `src/features/[feature]/hooks/` |
| 📦 **Tipos** | `src/shared/models/` |
| 🔧 **Servicios de API** | `src/shared/services/` |
| 🛠️ **Utilidades** | `src/shared/utils/` |
| 🎯 **Helpers** | `src/shared/helpers/` |
| 📋 **Constantes** | `src/shared/constants/` |
| 🧩 **Componentes compartidos** | `src/shared/components/` |
| ⚙️ **Configuración** | `src/core/config/` |
| 🎨 **Estilos** | `src/features/[feature]/styles/` |

---

## 🆕 Crear un Nuevo Feature

### Paso 1: Crear la estructura
```bash
src/features/mi-nuevo-feature/
├── components/
│   ├── MiComponente.tsx
│   └── index.ts
├── hooks/
│   ├── useMiHook.ts
│   └── index.ts
├── styles/
│   └── mi-feature.css
└── index.ts
```

### Paso 2: Crear el componente
```typescript
// src/features/mi-nuevo-feature/components/MiComponente.tsx
import { useMiHook } from '../hooks';
import '../styles/mi-feature.css';

export function MiComponente() {
  const { data } = useMiHook();
  return <div>{data}</div>;
}
```

### Paso 3: Exportar en index.ts
```typescript
// src/features/mi-nuevo-feature/components/index.ts
export { MiComponente } from './MiComponente';
```

### Paso 4: Exportar el feature completo
```typescript
// src/features/mi-nuevo-feature/index.ts
export * from './components';
export * from './hooks';
```

### Paso 5: Usar en App.tsx
```typescript
import { MiComponente } from './features/mi-nuevo-feature';
```

---

## 🔧 Crear un Nuevo Servicio

```typescript
// src/shared/services/mi-servicio.service.ts
export class MiServicio {
  static async obtenerDatos() {
    const response = await fetch('...');
    return response.json();
  }
}
```

Exportar:
```typescript
// src/shared/services/index.ts
export * from './pokemon.service';
export * from './mi-servicio.service'; // ← Agregar
```

---

## 🎯 Crear Helpers

```typescript
// src/shared/helpers/mi-helper.helpers.ts
export const calcularAlgo = (value: number): number => {
  return value * 2;
};

export const formatearTexto = (text: string): string => {
  return text.toUpperCase();
};
```

Exportar:
```typescript
// src/shared/helpers/index.ts
export * from './pokemon.helpers';
export * from './mi-helper.helpers'; // ← Agregar
```

---

## 📋 Agregar Constantes

```typescript
// src/shared/constants/mi-feature.constants.ts
export const MI_CONSTANTE = 'valor';
export const OTRA_CONSTANTE = 123;
```

Exportar:
```typescript
// src/shared/constants/index.ts
export * from './pokemon.constants';
export * from './storage.constants';
export * from './mi-feature.constants'; // ← Agregar
```

---

## 🎨 Crear Componente Compartido

```typescript
// src/shared/components/MiComponente.tsx
interface MiComponenteProps {
  texto: string;
}

export function MiComponente({ texto }: MiComponenteProps) {
  return <div>{texto}</div>;
}
```

Exportar:
```typescript
// src/shared/components/index.ts
export { DPad } from './DPad';
export { MiComponente } from './MiComponente'; // ← Agregar
```

---

## 📖 Patrón de Barrel Exports

Cada carpeta tiene un `index.ts` que re-exporta todo:

```typescript
// ✅ Con barrel export
import { Pokemon, BattleState } from './shared/models';

// ❌ Sin barrel export
import { Pokemon } from './shared/models/pokemon.model';
import { BattleState } from './shared/models/battle.model';
```

---

## 🔄 Migración Gradual

### Opción 1: Usar solo estructura nueva
- Importa desde `features/` y `shared/`
- Ignora los archivos antiguos

### Opción 2: Migrar poco a poco
- Componentes nuevos → estructura nueva
- Componentes existentes → mantener antigua
- Refactorizar cuando sea necesario

### Opción 3: Mantener ambas
- Estructura antigua funciona perfectamente
- Nueva estructura disponible para crecimiento

---

## ⚠️ Cosas a Recordar

### ✅ DO (Hacer)
- ✅ Usar barrel exports (`index.ts`)
- ✅ Organizar por features
- ✅ Separar componentes, hooks, estilos
- ✅ Usar servicios para lógica de API
- ✅ Centralizar constantes
- ✅ Documentar código nuevo

### ❌ DON'T (No hacer)
- ❌ Mezclar lógica de UI con lógica de negocio
- ❌ Duplicar código entre features
- ❌ Hardcodear URLs o constantes
- ❌ Crear archivos gigantes
- ❌ Importar desde rutas largas sin barrel exports

---

## 🧪 Testing (Futuro)

Estructura recomendada:
```
src/
├── features/
│   └── pokedex/
│       ├── components/
│       │   └── __tests__/
│       │       └── Pokedex.test.tsx
│       └── hooks/
│           └── __tests__/
│               └── usePokemon.test.ts
└── shared/
    └── services/
        └── __tests__/
            └── pokemon.service.test.ts
```

---

## 📚 Recursos Adicionales

- 📖 **Arquitectura Completa**: [ARQUITECTURA.md](./ARQUITECTURA.md)
- 📊 **Diagramas**: [DIAGRAMA_ARQUITECTURA.md](./DIAGRAMA_ARQUITECTURA.md)
- 📋 **Resumen**: [RESUMEN_REFACTORIZACION.md](./RESUMEN_REFACTORIZACION.md)
- 📂 **Índice**: [INDICE_ARCHIVOS.md](./INDICE_ARCHIVOS.md)

---

## 🎉 ¡Listo para Usar!

La nueva estructura está **lista y funcional**. Puedes:

1. ✅ **Seguir usando la estructura antigua** - Todo funciona
2. ✅ **Empezar a usar la nueva** - Mejor organizada
3. ✅ **Migrar gradualmente** - Sin prisa

**No hay breaking changes. Todo es compatible.** 🚀

---

## 💡 Ejemplos Rápidos

### Crear componente de Pokedex
```typescript
import { usePokemon } from '../hooks';
import type { Pokemon } from '../../../shared/models';

export function NuevoComponente() {
  const { pokemon } = usePokemon();
  return <div>{pokemon?.name}</div>;
}
```

### Usar servicio
```typescript
import { PokemonService } from '../../../shared/services';

const pokemon = await PokemonService.loadPokemon(25); // Pikachu
```

### Usar helpers
```typescript
import { generateIV, determineGender } from '../../../shared/helpers';

const iv = generateIV(true);
const gender = determineGender(-1);
```

### Usar constantes
```typescript
import { MAX_TEAM_SIZE, SHINY_RATE } from '../../../shared/constants';

if (team.length >= MAX_TEAM_SIZE) {
  alert('Equipo completo');
}
```

---

**¿Dudas? Consulta la documentación completa en los archivos .md** 📚
