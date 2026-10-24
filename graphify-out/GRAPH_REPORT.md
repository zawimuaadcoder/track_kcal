# Graph Report - track_kcal  (2026-10-24)

## Corpus Check
- 44 files · ~42,998 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 2, .graphify-bak 1)

## Summary
- 320 nodes · 913 edges · 17 communities (15 shown, 2 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e11a46e7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- add-food.tsx
- package.json
- expo
- off.js
- useThemed
- dependencies
- index.tsx
- ProfileGate.tsx
- AGENTS.md
- MyFitPalace
- tsconfig.json
- CLAUDE.md
- theme.ts
- vercel.json
- build-ipa.sh
- app/_layout.tsx
- ayuno.tsx

## God Nodes (most connected - your core abstractions)
1. `useThemed()` - 48 edges
2. `Diary()` - 31 edges
3. `depth()` - 25 edges
4. `react` - 23 edges
5. `react-native` - 23 edges
6. `Button()` - 21 edges
7. `Progress()` - 19 edges
8. `Fasting()` - 17 edges
9. `useStore()` - 17 edges
10. `fonts` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Settings()` --calls--> `ProfileAvatar()`  [EXTRACTED]
  src/app/(tabs)/ajustes.tsx → src/components/ProfileGate.tsx
- `Settings()` --calls--> `Screen()`  [EXTRACTED]
  src/app/(tabs)/ajustes.tsx → src/components/Screen.tsx
- `Settings()` --calls--> `Button()`  [EXTRACTED]
  src/app/(tabs)/ajustes.tsx → src/components/ui.tsx
- `Settings()` --calls--> `macroGoals()`  [EXTRACTED]
  src/app/(tabs)/ajustes.tsx → src/lib/nutrition.ts
- `Settings()` --calls--> `useSession()`  [EXTRACTED]
  src/app/(tabs)/ajustes.tsx → src/lib/session.tsx

## Import Cycles
- None detected.

## Communities (17 total, 2 thin omitted)

### Community 0 - "add-food.tsx"
Cohesion: 0.16
Nodes (19): AddFood(), makeStyles(), GENERIC_FOODS, GenericFood, Row, ROWS, getProductByBarcode(), num() (+11 more)

### Community 1 - "package.json"
Cohesion: 0.07
Nodes (26): devDependencies, @types/react, typescript, main, name, private, scripts, android (+18 more)

### Community 2 - "expo"
Cohesion: 0.07
Nodes (28): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, expo, android (+20 more)

### Community 3 - "off.js"
Cohesion: 0.52
Nodes (6): asText(), FIELDS, getJson(), product(), search(), slim()

### Community 4 - "useThemed"
Cohesion: 0.20
Nodes (28): Field(), FoodScreen(), MacroChip(), makeStyles(), Nutr(), makeStyles(), Onboarding(), makeStyles() (+20 more)

### Community 5 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, expo, expo-camera, expo-constants, expo-font, @expo-google-fonts/figtree, expo-haptics, expo-linking (+13 more)

### Community 6 - "index.tsx"
Cohesion: 0.10
Nodes (40): Aurora(), Diary(), formatInt(), formatLiters(), MacroRing(), makeStyles(), MEAL_COLORS, MEAL_ICONS (+32 more)

### Community 7 - "ProfileGate.tsx"
Cohesion: 0.18
Nodes (19): @react-native-async-storage/async-storage, Perfiles(), CreateForm(), makeStyles(), Mode, PasswordForm(), PROFILE_COLORS, ProfileAvatar() (+11 more)

### Community 8 - "AGENTS.md"
Cohesion: 0.33
Nodes (5): Building with EAS, Commands, Expo has changed — do not trust your training data, Navigation & Routing, Rules

### Community 9 - "MyFitPalace"
Cohesion: 0.40
Nodes (4): Desarrollo, Funciones, MyFitPalace, Probar en el iPhone (gratis, con Expo Go)

### Community 10 - "tsconfig.json"
Cohesion: 0.40
Nodes (4): expo/tsconfig.base, compilerOptions, strict, extends

### Community 12 - "theme.ts"
Cohesion: 0.08
Nodes (35): expo-camera, expo-haptics, @expo/vector-icons, react, react-native, react-native-safe-area-context, react-native-svg, makeStyles() (+27 more)

### Community 13 - "vercel.json"
Cohesion: 0.29
Nodes (6): buildCommand, framework, installCommand, outputDirectory, rewrites, $schema

### Community 15 - "app/_layout.tsx"
Cohesion: 0.26
Nodes (14): expo-router, Loading(), ProfileApp(), RootLayout(), RootStack(), Shell(), usePalette(), TabsLayout() (+6 more)

### Community 16 - "ayuno.tsx"
Cohesion: 0.24
Nodes (19): Fasting(), fastingPhase(), formatClock(), formatHoursMinutes(), formatTime(), makeStyles(), PLANS, AnimatedCircle (+11 more)

## Knowledge Gaps
- **12 isolated node(s):** `@expo/metro-runtime`, `expo`, `expo-constants`, `expo-font`, `expo-linking` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 121 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **What connects `@expo/metro-runtime`, `expo`, `expo-constants` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Why does `react` connect `theme.ts` to `add-food.tsx`, `package.json`, `useThemed`, `index.tsx`, `ProfileGate.tsx`, `ayuno.tsx`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Should `expo` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Why does `react-native` connect `theme.ts` to `add-food.tsx`, `package.json`, `useThemed`, `index.tsx`, `ProfileGate.tsx`, `app/_layout.tsx`, `ayuno.tsx`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._