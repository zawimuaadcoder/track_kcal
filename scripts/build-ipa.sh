#!/usr/bin/env bash
# Genera MyFitPalace.ipa (sin firmar) para instalarlo con Sideloadly.
# Requisitos en el Mac: Xcode (App Store), CocoaPods (`brew install cocoapods`) y Node.js.
# Sideloadly firma la app con tu Apple ID al instalarla.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "› Instalando dependencias…"
npm ci

echo "› Generando el proyecto nativo de iOS…"
npx expo prebuild --platform ios --clean

WORKSPACE=$(find ios -maxdepth 1 -name "*.xcworkspace" | head -n 1)
SCHEME=$(basename "$WORKSPACE" .xcworkspace)

echo "› Compilando $SCHEME en modo Release (tarda unos minutos)…"
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration Release \
  -sdk iphoneos \
  -destination "generic/platform=iOS" \
  -derivedDataPath ios/build \
  CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY="" \
  build | tail -n 20

APP="ios/build/Build/Products/Release-iphoneos/$SCHEME.app"
rm -rf build-ipa && mkdir -p build-ipa/Payload
cp -R "$APP" build-ipa/Payload/
(cd build-ipa && zip -qr ../MyFitPalace.ipa Payload)
rm -rf build-ipa

echo ""
echo "✔ Listo: $(pwd)/MyFitPalace.ipa"
echo "  Ábrelo con Sideloadly, conecta el iPhone por cable e inicia sesión con tu Apple ID."
