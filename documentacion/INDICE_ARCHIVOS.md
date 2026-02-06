# 📚 Índice de Archivos - Nueva Arquitectura Pokedex

## 🗂️ Directorio Completo

### 📂 ROOT
```
pokedex-react/
├── 📄 ARQUITECTURA.md                    # Documentación de arquitectura
├── 📄 DIAGRAMA_ARQUITECTURA.md           # Diagramas visuales
├── 📄 RESUMEN_REFACTORIZACION.md         # Resumen del trabajo
├── 📄 INDICE_ARCHIVOS.md                 # Este archivo
└── src/                                  # Código fuente
```

---

## 📦 src/ - Código Fuente

### 🎯 CORE LAYER
```
src/core/
└── config/
    ├── 📄 app.config.ts         # Configuración centralizada de la app
    └── 📄 index.ts              # Barrel export
```

**Propósito**: Configuración central y constantes globales de la aplicación.

**Archivos**:
- `app.config.ts`: URLs de API, configuración del juego, storage keys

---

### 🔗 SHARED LAYER

#### 📦 Models
```
src/shared/models/
├── 📄 pokemon.model.ts          # Interfaces de Pokémon
├── 📄 battle.model.ts           # Interfaces de batalla
├── 📄 storage.model.ts          # Interfaces de almacenamiento
└── 📄 index.ts                  # Barrel export
```

**Propósito**: Definiciones de tipos TypeScript compartidos.

**Tipos Principales**:
- `Pokemon` - Modelo completo de Pokémon
- `PokemonApiResponse` - Response de PokeAPI
- `TeamPokemon` - Pokémon en equipo
- `BattleState` - Estado de batalla
- `StorageData` - Datos de localStorage

---

#### 🔧 Services
```
src/shared/services/
├── 📄 pokemon.service.ts        # Servicio de API de Pokémon
└── 📄 index.ts                  # Barrel export
```

**Propósito**: Lógica de comunicación con APIs externas.

**Métodos Principales**:
- `PokemonService.loadPokemon()` - Carga un Pokémon completo
- `PokemonService.loadPokemonMoves()` - Carga movimientos
- `PokemonService.searchPokemonByName()` - Busca por nombre
- `PokemonService.selectSprites()` - Selecciona sprites correctos
- `PokemonService.processStats()` - Procesa estadísticas

---

#### 🛠️ Utils
```
src/shared/utils/
├── 📄 storage.util.ts           # Utilidades de almacenamiento
└── 📄 index.ts                  # Barrel export
```

**Propósito**: Funciones de utilidad general.

**Métodos Principales**:
- `StorageUtil.loadTeamData()` - Carga datos del equipo
- `StorageUtil.saveTeamData()` - Guarda datos del equipo
- `StorageUtil.exportTeamToJSON()` - Exporta a JSON
- `StorageUtil.importTeamFromJSON()` - Importa desde JSON
- `StorageUtil.clearAllData()` - Limpia almacenamiento
- `StorageUtil.getStorageSize()` - Obtiene tamaño de datos

---

#### 🎯 Helpers
```
src/shared/helpers/
├── 📄 pokemon.helpers.ts        # Funciones auxiliares de Pokémon
└── 📄 index.ts                  # Barrel export
```

**Propósito**: Funciones auxiliares específicas del dominio.

**Funciones Principales**:
- `generateIV()` - Genera IV aleatorio
- `generateEV()` - Genera EV aleatorio
- `isShinyPokemon()` - Determina si es shiny
- `determineGender()` - Determina género
- `getDefaultMoves()` - Movimientos por defecto
- `getGenderSymbol()` - Símbolo de género

---

#### 📋 Constants
```
src/shared/constants/
├── 📄 pokemon.constants.ts      # Constantes de Pokémon
├── 📄 storage.constants.ts      # Constantes de storage
└── 📄 index.ts                  # Barrel export
```

**Propósito**: Valores constantes inmutables.

**Constantes de Pokémon**:
- `SHINY_RATE = 1/4096`
- `MAX_IV = 31`
- `MAX_EV = 252`
- `MAX_MOVES = 4`
- `MAX_TEAM_SIZE = 6`
- `POKEMON_API_BASE_URL`

**Constantes de Storage**:
- `STORAGE_KEY = "pokedex-team-data"`
- `BACKUP_KEY = "pokedex-team-backup"`
- `BATTLE_STATE_KEY = "battleState"`

---

#### 🧩 Shared Components
```
src/shared/components/
├── 📄 DPad.tsx                  # Componente de control direccional
└── 📄 index.ts                  # Barrel export
```

**Propósito**: Componentes React reutilizables.

**Componentes**:
- `DPad` - Control direccional (arriba, abajo, izquierda, derecha)

---

### 🎯 FEATURES LAYER

#### 📦 Feature: Pokedex
```
src/features/pokedex/
├── components/
│   ├── 📄 Pokedex.tsx           # Componente principal del Pokedex
│   ├── 📄 PokedexMenu.tsx       # Menú del Pokedex
│   └── 📄 index.ts              # Barrel export
├── hooks/
│   ├── 📄 usePokemon.ts         # Hook principal de Pokémon
│   └── 📄 index.ts              # Barrel export
├── styles/
│   ├── 📄 pokedex.css           # Estilos del Pokedex
│   └── 📄 pokedex-menu.css      # Estilos del menú
└── 📄 index.ts                  # Feature barrel export
```

**Propósito**: Feature completo del Pokedex.

**Componentes**:
- `Pokedex` - Interfaz principal del Pokedex
- `PokedexMenu` - Menú con gestión de equipo

**Hooks**:
- `usePokemon()` - Gestión de estado de Pokémon
  - Navegación (siguiente, anterior, random)
  - Búsqueda
  - Gestión de equipo
  - Vista de estadísticas

---

#### ⚔️ Feature: Battle
```
src/features/battle/
├── components/
│   ├── 📄 BattleArena.tsx       # Arena de batalla multiplayer
│   ├── 📄 TrainerNameModal.tsx  # Modal de nombre de entrenador
│   └── 📄 index.ts              # Barrel export
├── styles/
│   ├── 📄 battle-arena.css      # Estilos de la arena
│   └── 📄 trainer-modal.css     # Estilos del modal
└── 📄 index.ts                  # Feature barrel export
```

**Propósito**: Sistema completo de batallas.

**Componentes**:
- `BattleArena` - Arena de batalla con Socket.io
- `TrainerNameModal` - Modal para configurar entrenador

**Funcionalidades**:
- Conexión Socket.io
- Selección de Pokémon
- Sistema de turnos
- Ataques y movimientos
- Logs de batalla

---

## 📊 Resumen de Archivos por Tipo

### TypeScript Files (.ts, .tsx)

| Categoría | Cantidad | Ubicación |
|-----------|----------|-----------|
| **Config** | 2 | `core/config/` |
| **Models** | 4 | `shared/models/` |
| **Services** | 2 | `shared/services/` |
| **Utils** | 2 | `shared/utils/` |
| **Helpers** | 2 | `shared/helpers/` |
| **Constants** | 3 | `shared/constants/` |
| **Shared Components** | 2 | `shared/components/` |
| **Pokedex Components** | 3 | `features/pokedex/components/` |
| **Pokedex Hooks** | 2 | `features/pokedex/hooks/` |
| **Battle Components** | 3 | `features/battle/components/` |
| **Barrel Exports (index.ts)** | 11 | Varios |
| **TOTAL** | **36** | - |

### CSS Files (.css)

| Categoría | Cantidad | Ubicación |
|-----------|----------|-----------|
| **Pokedex Styles** | 2 | `features/pokedex/styles/` |
| **Battle Styles** | 2 | `features/battle/styles/` |
| **TOTAL** | **4** | - |

### Documentation Files (.md)

| Archivo | Propósito |
|---------|-----------|
| `ARQUITECTURA.md` | Guía completa de arquitectura |
| `DIAGRAMA_ARQUITECTURA.md` | Diagramas visuales |
| `RESUMEN_REFACTORIZACION.md` | Resumen del trabajo |
| `INDICE_ARCHIVOS.md` | Este índice |
| **TOTAL** | **4** |

---

## 🔍 Búsqueda Rápida

### ¿Necesitas...?

#### 📦 Tipos e Interfaces?
→ `src/shared/models/`

#### 🔧 Lógica de API?
→ `src/shared/services/`

#### 🛠️ Funciones de utilidad?
→ `src/shared/utils/`

#### 🎯 Funciones auxiliares?
→ `src/shared/helpers/`

#### 📋 Constantes?
→ `src/shared/constants/`

#### 🧩 Componentes compartidos?
→ `src/shared/components/`

#### 🎨 Componentes de Pokedex?
→ `src/features/pokedex/components/`

#### ⚔️ Componentes de batalla?
→ `src/features/battle/components/`

#### 🎨 Estilos?
→ `src/features/[feature]/styles/`

#### ⚙️ Configuración?
→ `src/core/config/`

---

## 📈 Estadísticas

### Líneas de Código (Aproximado)

| Categoría | LOC (aprox) |
|-----------|-------------|
| Models | ~150 |
| Services | ~140 |
| Utils | ~130 |
| Helpers | ~60 |
| Constants | ~30 |
| Components | ~800 |
| Hooks | ~300 |
| **TOTAL** | **~1,610** |

### Archivos por Capa

| Capa | Archivos |
|------|----------|
| Core | 2 |
| Shared | 17 |
| Features | 13 |
| Docs | 4 |
| **TOTAL** | **36** |

---

## 🎯 Convenciones de Nomenclatura

### Archivos
- **Components**: `PascalCase.tsx` (ej: `Pokedex.tsx`)
- **Hooks**: `camelCase.ts` con prefijo `use` (ej: `usePokemon.ts`)
- **Services**: `camelCase.service.ts` (ej: `pokemon.service.ts`)
- **Utils**: `camelCase.util.ts` (ej: `storage.util.ts`)
- **Helpers**: `camelCase.helpers.ts` (ej: `pokemon.helpers.ts`)
- **Models**: `camelCase.model.ts` (ej: `pokemon.model.ts`)
- **Constants**: `camelCase.constants.ts` (ej: `pokemon.constants.ts`)
- **Styles**: `kebab-case.css` (ej: `battle-arena.css`)
- **Barrel Exports**: `index.ts`

### Clases y Tipos
- **Interfaces**: `PascalCase` (ej: `Pokemon`, `BattleState`)
- **Classes**: `PascalCase` con sufijo (ej: `PokemonService`, `StorageUtil`)
- **Constants**: `UPPER_SNAKE_CASE` (ej: `MAX_TEAM_SIZE`, `SHINY_RATE`)
- **Functions**: `camelCase` (ej: `generateIV`, `loadPokemon`)

---

## 🔗 Enlaces Útiles

- **Documentación Principal**: [ARQUITECTURA.md](./ARQUITECTURA.md)
- **Diagramas**: [DIAGRAMA_ARQUITECTURA.md](./DIAGRAMA_ARQUITECTURA.md)
- **Resumen**: [RESUMEN_REFACTORIZACION.md](./RESUMEN_REFACTORIZACION.md)

---

**Última actualización**: Febrero 2026  
**Versión**: 1.0.0
