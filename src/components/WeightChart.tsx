import { useState } from 'react';
import { LayoutChangeEvent, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { colors } from '../lib/theme';
import { WeightEntry } from '../lib/types';

const HEIGHT = 180;
const PAD = { top: 16, bottom: 22, left: 34, right: 12 };

export function WeightChart({ weights, target }: { weights: WeightEntry[]; target: number }) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  if (weights.length < 2) {
    return (
      <Text style={{ color: colors.muted, textAlign: 'center', paddingVertical: 30 }}>
        Registra tu peso al menos dos días para ver la gráfica.
      </Text>
    );
  }

  const values = [...weights.map((w) => w.kg), target];
  const min = Math.floor(Math.min(...values) - 1);
  const max = Math.ceil(Math.max(...values) + 1);
  const t0 = Date.parse(weights[0].date);
  const t1 = Date.parse(weights[weights.length - 1].date);
  const innerW = Math.max(1, width - PAD.left - PAD.right);
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (date: string) => PAD.left + ((Date.parse(date) - t0) / Math.max(1, t1 - t0)) * innerW;
  const y = (kg: number) => PAD.top + (1 - (kg - min) / (max - min)) * innerH;
  const label = (date: string) => {
    const [, m, d] = date.split('-');
    return `${Number(d)}/${Number(m)}`;
  };

  return (
    <View onLayout={onLayout} style={{ height: HEIGHT }}>
      {width > 0 && (
        <Svg width={width} height={HEIGHT}>
          {[min, (min + max) / 2, max].map((v) => (
            <SvgText key={v} x={PAD.left - 6} y={y(v) + 4} fontSize={10} fill={colors.muted} textAnchor="end">
              {Math.round(v)}
            </SvgText>
          ))}
          <Line
            x1={PAD.left}
            x2={width - PAD.right}
            y1={y(target)}
            y2={y(target)}
            stroke={colors.accent}
            strokeDasharray="5 5"
            strokeWidth={1.5}
          />
          <Polyline
            points={weights.map((w) => `${x(w.date)},${y(w.kg)}`).join(' ')}
            fill="none"
            stroke={colors.primary}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          {weights.map((w) => (
            <Circle key={w.date} cx={x(w.date)} cy={y(w.kg)} r={3.5} fill={colors.primary} />
          ))}
          <SvgText x={PAD.left} y={HEIGHT - 4} fontSize={10} fill={colors.muted}>
            {label(weights[0].date)}
          </SvgText>
          <SvgText x={width - PAD.right} y={HEIGHT - 4} fontSize={10} fill={colors.muted} textAnchor="end">
            {label(weights[weights.length - 1].date)}
          </SvgText>
        </Svg>
      )}
    </View>
  );
}
