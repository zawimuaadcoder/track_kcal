# Graph Report - track_kcal  (2026-10-14)

## Corpus Check
- 24 files · ~27,236 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 2, .graphify-bak 1)

## Summary
- 185 nodes · 449 edges · 13 communities (12 shown, 1 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `30ed19e5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- add-food.tsx
- package.json
- expo
- store.tsx
- useThemed
- dependencies
- index.tsx
- theme.ts
- AGENTS.md
- MyFitPalace
- tsconfig.json
- CLAUDE.md
- ayuno.tsx

## God Nodes (most connected - your core abstractions)
1. `useThemed()` - 30 edges
2. `useStore()` - 18 edges
3. `Button()` - 15 edges
4. `react` - 14 edges
5. `Diary()` - 14 edges
6. `react-native` - 13 edges
7. `Card()` - 13 edges
8. `expo` - 12 edges
9. `NumberInput()` - 12 edges
10. `Progress()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `TabsLayout()` --calls--> `useColors()`  [EXTRACTED]
  src/app/(tabs)/_layout.tsx → src/lib/theme.ts
- `Settings()` --calls--> `macroGoals()`  [EXTRACTED]
  src/app/(tabs)/ajustes.tsx → src/lib/nutrition.ts
- `Settings()` --calls--> `useStore()`  [EXTRACTED]
  src/app/(tabs)/ajustes.tsx → src/lib/store.tsx
- `Fasting()` --calls--> `Button()`  [EXTRACTED]
  src/app/(tabs)/ayuno.tsx → src/components/ui.tsx
- `Fasting()` --calls--> `Card()`  [EXTRACTED]
  src/app/(tabs)/ayuno.tsx → src/components/ui.tsx

## Import Cycles
- None detected.

## Communities (13 total, 1 thin omitted)

### Community 0 - "add-food.tsx"
Cohesion: 0.13
Nodes (22): expo-camera, expo-router, @expo/vector-icons, react, react-native, react-native-safe-area-context, react-native-svg, AddFood() (+14 more)

### Community 1 - "package.json"
Cohesion: 0.09
Nodes (22): devDependencies, @types/react, typescript, main, name, private, scripts, android (+14 more)

### Community 2 - "expo"
Cohesion: 0.09
Nodes (21): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, expo, android (+13 more)

### Community 3 - "store.tsx"
Cohesion: 0.18
Nodes (14): EMPTY, EMPTY_DAY, Store, StoreContext, AppData, Appearance, DayLog, Fasting (+6 more)

### Community 4 - "useThemed"
Cohesion: 0.25
Nodes (24): Field(), FoodScreen(), makeStyles(), Nutr(), makeStyles(), Onboarding(), makeStyles(), Settings() (+16 more)

### Community 5 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, expo, expo-camera, expo-constants, expo-linking, expo-router, expo-status-bar, @expo/vector-icons (+7 more)

### Community 6 - "index.tsx"
Cohesion: 0.48
Nodes (10): Diary(), Macro(), makeStyles(), Stat(), dateKey(), entryNutrients(), formatDateLabel(), macroGoals() (+2 more)

### Community 7 - "theme.ts"
Cohesion: 0.20
Nodes (14): RootLayout(), RootStack(), ThemedApp(), newId(), StoreProvider(), useStore(), AccentName, PALETTES (+6 more)

### Community 8 - "AGENTS.md"
Cohesion: 0.33
Nodes (5): Building with EAS, Commands, Expo has changed — do not trust your training data, Navigation & Routing, Rules

### Community 9 - "MyFitPalace"
Cohesion: 0.40
Nodes (4): Desarrollo, Funciones, MyFitPalace, Probar en el iPhone (gratis, con Expo Go)

### Community 10 - "tsconfig.json"
Cohesion: 0.40
Nodes (4): expo/tsconfig.base, compilerOptions, strict, extends

### Community 12 - "ayuno.tsx"
Cohesion: 0.48
Nodes (6): Fasting(), formatDuration(), formatTime(), makeStyles(), PLANS, Ring()

## Knowledge Gaps
- **8 isolated node(s):** `expo`, `expo-constants`, `expo-linking`, `react-dom`, `react-native-screens` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 76 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **What connects `expo`, `expo-constants`, `expo-linking` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `add-food.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12535612535612536 - nodes in this community are weakly interconnected._
- **Why does `react` connect `add-food.tsx` to `package.json`, `store.tsx`, `useThemed`, `index.tsx`, `theme.ts`, `ayuno.tsx`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Why does `react-native` connect `add-food.tsx` to `package.json`, `useThemed`, `index.tsx`, `theme.ts`, `ayuno.tsx`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `expo` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._