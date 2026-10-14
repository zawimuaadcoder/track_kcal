import Svg, { Defs, Ellipse, LinearGradient, Path, Stop, Circle } from 'react-native-svg';

const BODY =
  'M24 60C24 46 29 38 34 27C38 33 40 37 42 39C44 31 47 25 50 17C54 25 57 31 59 39C61 35 63 31 67 26C72 37 76 46 76 60A26 26 0 0 1 24 60Z';

/** La mascota de MyFitPalace: una llamita sonriente. `variant="fire"` es la versión naranja de las rachas. */
export function Mascot({ size, variant = 'fire' }: { size: number; variant?: 'fire' | 'white' }) {
  const [top, bottom] = variant === 'fire' ? ['#FFD36B', '#FF7A1A'] : ['#FFFFFF', '#FFDDE8'];
  const ink = variant === 'fire' ? '#3A1500' : '#2A0A14';
  const cheek = variant === 'fire' ? '#FF4D2E' : '#FF5C83';
  return (
    <Svg width={size} height={size} viewBox="12 12 76 76">
      <Defs>
        <LinearGradient id={`mascot-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={top} />
          <Stop offset="1" stopColor={bottom} />
        </LinearGradient>
      </Defs>
      <Path d={BODY} fill={`url(#mascot-${variant})`} />
      <Ellipse cx="41" cy="58" rx="4.2" ry="5.8" fill={ink} />
      <Ellipse cx="59" cy="58" rx="4.2" ry="5.8" fill={ink} />
      <Circle cx="42.3" cy="56" r="1.5" fill="#FFFFFF" />
      <Circle cx="60.3" cy="56" r="1.5" fill="#FFFFFF" />
      <Ellipse cx="34" cy="67" rx="4" ry="2.4" fill={cheek} opacity={0.55} />
      <Ellipse cx="66" cy="67" rx="4" ry="2.4" fill={cheek} opacity={0.55} />
      <Path d="M45 68q5 5 10 0" fill="none" stroke={ink} strokeWidth={2.6} strokeLinecap="round" />
    </Svg>
  );
}
