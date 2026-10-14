# Graph Report - track_kcal  (2026-10-14)

## Corpus Check
- 24 files · ~26,404 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: .graphify-bak 1, (none) 1)

## Summary
- 174 nodes · 378 edges · 12 communities (11 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- ui.tsx
- package.json
- expo
- store.tsx
- food.tsx
- dependencies
- index.tsx
- openFoodFacts.ts
- AGENTS.md
- MyFitPalace
- tsconfig.json
- CLAUDE.md

## God Nodes (most connected - your core abstractions)
1. `useStore()` - 17 edges
2. `react` - 13 edges
3. `react-native` - 13 edges
4. `Button()` - 13 edges
5. `colors` - 13 edges
6. `expo` - 12 edges
7. `Diary()` - 12 edges
8. `Card()` - 11 edges
9. `NumberInput()` - 10 edges
10. `Progress()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Settings()` --calls--> `Button()`  [EXTRACTED]
  src/app/(tabs)/ajustes.tsx → src/components/ui.tsx
- `Settings()` --calls--> `macroGoals()`  [EXTRACTED]
  src/app/(tabs)/ajustes.tsx → src/lib/nutrition.ts
- `Settings()` --calls--> `useStore()`  [EXTRACTED]
  src/app/(tabs)/ajustes.tsx → src/lib/store.tsx
- `Fasting()` --calls--> `Card()`  [EXTRACTED]
  src/app/(tabs)/ayuno.tsx → src/components/ui.tsx
- `Fasting()` --calls--> `useStore()`  [EXTRACTED]
  src/app/(tabs)/ayuno.tsx → src/lib/store.tsx

## Import Cycles
- None detected.

## Communities (12 total, 1 thin omitted)

### Community 0 - "ui.tsx"
Cohesion: 0.12
Nodes (31): expo-router, @expo/vector-icons, react, react-native, react-native-svg, AddFood(), styles, Scan() (+23 more)

### Community 1 - "package.json"
Cohesion: 0.08
Nodes (23): devDependencies, @types/react, typescript, main, name, private, scripts, android (+15 more)

### Community 2 - "expo"
Cohesion: 0.09
Nodes (21): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, expo, android (+13 more)

### Community 3 - "store.tsx"
Cohesion: 0.16
Nodes (17): RootLayout(), RootStack(), EMPTY, EMPTY_DAY, newId(), Store, StoreContext, StoreProvider() (+9 more)

### Community 4 - "food.tsx"
Cohesion: 0.24
Nodes (14): react-native-safe-area-context, Field(), FoodScreen(), Nutr(), styles, Onboarding(), styles, Settings() (+6 more)

### Community 5 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, expo, expo-camera, expo-constants, expo-linking, expo-router, expo-status-bar, @expo/vector-icons (+7 more)

### Community 6 - "index.tsx"
Cohesion: 0.44
Nodes (10): Diary(), Macro(), Stat(), styles, dateKey(), entryNutrients(), formatDateLabel(), macroGoals() (+2 more)

### Community 7 - "openFoodFacts.ts"
Cohesion: 0.43
Nodes (6): getProductByBarcode(), HEADERS, num(), OffProduct, searchFoods(), toFood()

### Community 8 - "AGENTS.md"
Cohesion: 0.33
Nodes (5): Building with EAS, Commands, Expo has changed — do not trust your training data, Navigation & Routing, Rules

### Community 9 - "MyFitPalace"
Cohesion: 0.40
Nodes (4): Desarrollo, Funciones, MyFitPalace, Probar en el iPhone (gratis, con Expo Go)

### Community 10 - "tsconfig.json"
Cohesion: 0.40
Nodes (4): expo/tsconfig.base, compilerOptions, strict, extends

## Knowledge Gaps
- **8 isolated node(s):** `expo`, `expo-constants`, `expo-linking`, `react-dom`, `react-native-screens` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 82 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **What connects `expo`, `expo-constants`, `expo-linking` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ui.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11875843454790823 - nodes in this community are weakly interconnected._
- **Why does `react` connect `ui.tsx` to `package.json`, `store.tsx`, `food.tsx`, `index.tsx`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Why does `react-native` connect `ui.tsx` to `package.json`, `store.tsx`, `food.tsx`, `index.tsx`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Should `expo` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._