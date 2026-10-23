# Graph Report - track_kcal  (2026-10-23)

## Corpus Check
- 40 files · ~38,098 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 2, .graphify-bak 1)

## Summary
- 284 nodes · 721 edges · 15 communities (13 shown, 2 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f773b7c7`
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
- ajustes.tsx
- AGENTS.md
- MyFitPalace
- tsconfig.json
- CLAUDE.md
- FloatingTabBar.tsx
- vercel.json
- build-ipa.sh

## God Nodes (most connected - your core abstractions)
1. `useThemed()` - 40 edges
2. `Diary()` - 21 edges
3. `react` - 20 edges
4. `react-native` - 20 edges
5. `Button()` - 19 edges
6. `useStore()` - 17 edges
7. `Settings()` - 15 edges
8. `fonts` - 15 edges
9. `Palette` - 14 edges
10. `Progress()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Settings()` --calls--> `Screen()`  [EXTRACTED]
  src/app/(tabs)/ajustes.tsx → src/components/Screen.tsx
- `Settings()` --calls--> `Card()`  [EXTRACTED]
  src/app/(tabs)/ajustes.tsx → src/components/ui.tsx
- `Settings()` --calls--> `NumberInput()`  [EXTRACTED]
  src/app/(tabs)/ajustes.tsx → src/components/ui.tsx
- `Settings()` --calls--> `parseNumber()`  [EXTRACTED]
  src/app/(tabs)/ajustes.tsx → src/components/ui.tsx
- `Settings()` --calls--> `confirm()`  [EXTRACTED]
  src/app/(tabs)/ajustes.tsx → src/lib/dialog.ts

## Import Cycles
- None detected.

## Communities (15 total, 2 thin omitted)

### Community 0 - "add-food.tsx"
Cohesion: 0.16
Nodes (20): AddFood(), makeStyles(), GENERIC_FOODS, GenericFood, Row, ROWS, getProductByBarcode(), num() (+12 more)

### Community 1 - "package.json"
Cohesion: 0.07
Nodes (26): devDependencies, @types/react, typescript, main, name, private, scripts, android (+18 more)

### Community 2 - "expo"
Cohesion: 0.07
Nodes (28): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, expo, android (+20 more)

### Community 3 - "store.tsx"
Cohesion: 0.10
Nodes (31): @expo-google-fonts/figtree, expo-status-bar, Loading(), ProfileApp(), RootLayout(), RootStack(), Shell(), usePalette() (+23 more)

### Community 4 - "useThemed"
Cohesion: 0.12
Nodes (43): react-native, react-native-safe-area-context, react-native-svg, Field(), FoodScreen(), makeStyles(), Nutr(), makeStyles() (+35 more)

### Community 5 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, expo, expo-camera, expo-constants, expo-font, @expo-google-fonts/figtree, expo-haptics, expo-linking (+13 more)

### Community 6 - "index.tsx"
Cohesion: 0.19
Nodes (22): expo-haptics, Diary(), formatInt(), formatLiters(), Macro(), makeStyles(), Mascot(), AnimatedNumber() (+14 more)

### Community 7 - "ajustes.tsx"
Cohesion: 0.18
Nodes (22): react, Perfiles(), makeStyles(), Settings(), CreateForm(), makeStyles(), Mode, PasswordForm() (+14 more)

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
Cohesion: 0.22
Nodes (11): expo-router, @expo/vector-icons, TabsLayout(), FloatingTabBar(), IconName, ICONS, LABELS, makeStyles() (+3 more)

### Community 13 - "vercel.json"
Cohesion: 0.29
Nodes (6): buildCommand, framework, installCommand, outputDirectory, rewrites, $schema

## Knowledge Gaps
- **12 isolated node(s):** `@expo/metro-runtime`, `expo`, `expo-constants`, `expo-font`, `expo-linking` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 113 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **What connects `@expo/metro-runtime`, `expo`, `expo-constants` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Why does `react` connect `ajustes.tsx` to `add-food.tsx`, `package.json`, `store.tsx`, `useThemed`, `index.tsx`, `FloatingTabBar.tsx`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Should `expo` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Why does `react-native` connect `useThemed` to `add-food.tsx`, `package.json`, `store.tsx`, `index.tsx`, `ajustes.tsx`, `FloatingTabBar.tsx`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Should `store.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09915966386554621 - nodes in this community are weakly interconnected._