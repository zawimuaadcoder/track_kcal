# Graph Report - track_kcal  (2026-10-14)

## Corpus Check
- 31 files · ~30,616 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 2, .graphify-bak 1)

## Summary
- 225 nodes · 566 edges · 15 communities (13 shown, 2 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `695985b3`
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
- FloatingTabBar.tsx
- scripts
- build-ipa.sh

## God Nodes (most connected - your core abstractions)
1. `useThemed()` - 35 edges
2. `useStore()` - 18 edges
3. `Diary()` - 17 edges
4. `react` - 16 edges
5. `react-native` - 15 edges
6. `Button()` - 15 edges
7. `fonts` - 14 edges
8. `Card()` - 13 edges
9. `Palette` - 13 edges
10. `expo` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Settings()` --calls--> `Screen()`  [EXTRACTED]
  src/app/(tabs)/ajustes.tsx → src/components/Screen.tsx
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

## Communities (15 total, 2 thin omitted)

### Community 0 - "add-food.tsx"
Cohesion: 0.16
Nodes (20): AddFood(), makeStyles(), GENERIC_FOODS, GenericFood, Row, ROWS, getProductByBarcode(), HEADERS (+12 more)

### Community 1 - "package.json"
Cohesion: 0.08
Nodes (25): devDependencies, @types/react, typescript, main, name, private, version, expo (+17 more)

### Community 2 - "expo"
Cohesion: 0.09
Nodes (21): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, expo, android (+13 more)

### Community 3 - "store.tsx"
Cohesion: 0.15
Nodes (19): @react-native-async-storage/async-storage, RootLayout(), RootStack(), ThemedApp(), EMPTY, EMPTY_DAY, newId(), Store (+11 more)

### Community 4 - "useThemed"
Cohesion: 0.29
Nodes (21): Field(), FoodScreen(), makeStyles(), Nutr(), makeStyles(), Onboarding(), Settings(), makeStyles() (+13 more)

### Community 5 - "dependencies"
Cohesion: 0.11
Nodes (18): dependencies, expo, expo-camera, expo-constants, expo-font, @expo-google-fonts/figtree, expo-haptics, expo-linking (+10 more)

### Community 6 - "index.tsx"
Cohesion: 0.21
Nodes (20): expo-haptics, @expo/vector-icons, Diary(), formatInt(), formatLiters(), Macro(), makeStyles(), makeStyles() (+12 more)

### Community 7 - "theme.ts"
Cohesion: 0.16
Nodes (20): react, makeStyles(), Fasting(), formatClock(), formatHoursMinutes(), formatTime(), makeStyles(), PLANS (+12 more)

### Community 8 - "AGENTS.md"
Cohesion: 0.33
Nodes (5): Building with EAS, Commands, Expo has changed — do not trust your training data, Navigation & Routing, Rules

### Community 9 - "MyFitPalace"
Cohesion: 0.40
Nodes (4): Desarrollo, Funciones, MyFitPalace, Probar en el iPhone (gratis, con Expo Go)

### Community 10 - "tsconfig.json"
Cohesion: 0.40
Nodes (4): expo/tsconfig.base, compilerOptions, strict, extends

### Community 12 - "FloatingTabBar.tsx"
Cohesion: 0.24
Nodes (10): expo-router, TabsLayout(), FloatingTabBar(), IconName, ICONS, LABELS, makeStyles(), TAB_BAR_SPACE (+2 more)

### Community 13 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, android, ios, start, typecheck, web

## Knowledge Gaps
- **9 isolated node(s):** `expo`, `expo-constants`, `expo-font`, `expo-linking`, `react-dom` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 89 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **What connects `expo`, `expo-constants`, `expo-font` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.082010582010582 - nodes in this community are weakly interconnected._
- **Why does `react` connect `theme.ts` to `add-food.tsx`, `package.json`, `store.tsx`, `useThemed`, `index.tsx`, `FloatingTabBar.tsx`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Should `expo` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Why does `react-native` connect `package.json` to `add-food.tsx`, `store.tsx`, `useThemed`, `index.tsx`, `theme.ts`, `FloatingTabBar.tsx`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Should `store.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1471861471861472 - nodes in this community are weakly interconnected._