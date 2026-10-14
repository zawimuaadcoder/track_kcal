# MyFitPalace

App personal de seguimiento de calorías para iPhone (Expo / React Native).

## Funciones
- Cuestionario inicial: peso actual y objetivo → objetivo diario de calorías y macros
- Diario: desayuno, comida, cena y snacks
- Buscador de alimentos y escáner de códigos de barras (Open Food Facts, muy completo en Francia)
- Alimentos creados a mano y lista de recientes
- Agua, peso con gráfica e historial, ayuno intermitente (12:12 a 20:4)
- Todos los datos se guardan solo en el móvil

## Probar en el iPhone (gratis, con Expo Go)
1. Instala **Expo Go** desde la App Store en el iPhone.
2. En un ordenador con Node.js 20+:
   ```bash
   git clone <este repo> && cd track_kcal
   npm install
   npx expo start --tunnel
   ```
3. Escanea el QR con la cámara del iPhone → se abre en Expo Go.

Para tenerla instalada como app normal (y compartirla con amigos por TestFlight) hace falta una cuenta de Apple Developer y `npx eas-cli@latest build -p ios`.

## Desarrollo
```bash
npm run typecheck
```
Código en `src/`: pantallas en `src/app/` (Expo Router), lógica en `src/lib/`, componentes en `src/components/`.
