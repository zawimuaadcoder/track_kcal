# Graph Report - track_kcal  (2026-10-23)

## Corpus Check
- 42 files · ~40,792 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 2, .graphify-bak 1)

## Summary
- 302 nodes · 823 edges · 17 communities (15 shown, 2 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 33 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0ea00e11`
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
- react
- vercel.json
- build-ipa.sh
- theme.ts
- ayuno.tsx

## God Nodes (most connected - your core abstractions)
1. `useThemed()` - 47 edges
2. `Diary()` - 28 edges
3. `react` - 22 edges
4. `react-native` - 21 edges
5. `Button()` - 19 edges
6. `Progress()` - 18 edges
7. `useStore()` - 17 edges
8. `Fasting()` - 16 edges
9. `fonts` - 16 edges
10. `Settings()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `TabsLayout()` --calls--> `useColors()`  [EXTRACTED]
  src/app/(tabs)/_layout.tsx → src/lib/theme.ts
- `Settings()` --calls--> `Screen()`  [EXTRACTED]
  src/app/(tabs)/ajustes.tsx → src/components/Screen.tsx
- `Settings()` --calls--> `Card()`  [EXTRACTED]
  src/app/(tabs)/ajustes.tsx → src/components/ui.tsx
- `Settings()` --calls--> `NumberInput()`  [EXTRACTED]
  src/app/(tabs)/ajustes.tsx → src/components/ui.tsx
- `Settings()` --calls--> `parseNumber()`  [EXTRACTED]
  src/app/(tabs)/ajustes.tsx → src/components/ui.tsx

## Import Cycles
- None detected.

## Communities (17 total, 2 thin omitted)

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
Cohesion: 0.12
Nodes (20): react-native-svg, PAD, cacheKey(), EMPTY, EMPTY_DAY, hydrate(), isEmpty(), newId() (+12 more)

### Community 4 - "useThemed"
Cohesion: 0.31
Nodes (17): Field(), FoodScreen(), MacroChip(), makeStyles(), Nutr(), makeStyles(), Onboarding(), Bar() (+9 more)

### Community 5 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, expo, expo-camera, expo-constants, expo-font, @expo-google-fonts/figtree, expo-haptics, expo-linking (+13 more)

### Community 6 - "index.tsx"
Cohesion: 0.14
Nodes (36): @expo/vector-icons, Diary(), formatInt(), formatLiters(), MacroRing(), makeStyles(), MEAL_ICONS, fmtKg() (+28 more)

### Community 7 - "ajustes.tsx"
Cohesion: 0.16
Nodes (23): @react-native-async-storage/async-storage, Perfiles(), makeStyles(), Settings(), CreateForm(), makeStyles(), Mode, PasswordForm() (+15 more)

### Community 8 - "AGENTS.md"
Cohesion: 0.33
Nodes (5): Building with EAS, Commands, Expo has changed — do not trust your training data, Navigation & Routing, Rules

### Community 9 - "MyFitPalace"
Cohesion: 0.40
Nodes (4): Desarrollo, Funciones, MyFitPalace, Probar en el iPhone (gratis, con Expo Go)

### Community 10 - "tsconfig.json"
Cohesion: 0.40
Nodes (4): expo/tsconfig.base, compilerOptions, strict, extends

### Community 12 - "react"
Cohesion: 0.13
Nodes (22): expo-camera, expo-haptics, expo-router, react, react-native, react-native-safe-area-context, makeStyles(), Scan() (+14 more)

### Community 13 - "vercel.json"
Cohesion: 0.29
Nodes (6): buildCommand, framework, installCommand, outputDirectory, rewrites, $schema

### Community 15 - "theme.ts"
Cohesion: 0.17
Nodes (18): Loading(), ProfileApp(), RootLayout(), RootStack(), Shell(), usePalette(), WebFrame(), SessionProvider() (+10 more)

### Community 16 - "ayuno.tsx"
Cohesion: 0.33
Nodes (9): Fasting(), fastingPhase(), formatClock(), formatHoursMinutes(), formatTime(), makeStyles(), PLANS, makeStyles() (+1 more)

## Knowledge Gaps
- **12 isolated node(s):** `@expo/metro-runtime`, `expo`, `expo-constants`, `expo-font`, `expo-linking` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 116 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **What connects `@expo/metro-runtime`, `expo`, `expo-constants` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `add-food.tsx`, `package.json`, `store.tsx`, `useThemed`, `index.tsx`, `ajustes.tsx`, `theme.ts`, `ayuno.tsx`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Should `expo` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Why does `react-native` connect `react` to `add-food.tsx`, `package.json`, `store.tsx`, `useThemed`, `index.tsx`, `ajustes.tsx`, `theme.ts`, `ayuno.tsx`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `store.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1225296442687747 - nodes in this community are weakly interconnected._