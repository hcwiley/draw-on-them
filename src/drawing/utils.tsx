import {
  PaintStyle,
  Skia,
  StrokeCap,
  StrokeJoin,
  SKPaint,
  SKPath,
} from '@shopify/react-native-skia';
import {CurrentPath} from '../store';

//@ts-ignore adding a function to get random value from array
Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)];
};

/**
 * Get a stroke with the given parameters
 *
 * @param strokeWidth
 * @param color
 * @returns
 */
const getPaint = (strokeWidth: number, color: string) => {
  const paint: SKPaint = Skia.Paint();
  paint.setStrokeWidth(strokeWidth);
  paint.setStrokeMiter(5);
  paint.setStyle(PaintStyle.Stroke);
  paint.setStrokeCap(StrokeCap.Round);
  paint.setStrokeJoin(StrokeJoin.Round);
  paint.setAntiAlias(true);
  const _color = paint.copy();
  _color.setColor(Skia.Color(color));
  console.log(color);
  return _color;
};

function floatToHex(f: number) {
  return Math.round(f * 255)
    .toString(16)
    .padStart(2, '0');
}

const skiaColorToHex = (color: SkColor) => {
  let hex = `#`;
  hex += floatToHex(color[0]);
  hex += floatToHex(color[1]);
  hex += floatToHex(color[2]);
  // console.log(`hex: ${hex}`);
  return hex;
};

/**
 * A function get get elevation style for android/ios.
 * @param elevation
 * @returns
 */
const getElevation = (elevation: number) => {
  return {
    elevation,
    shadowColor: 'black',
    shadowOffset: {width: 0.3 * elevation, height: 0.5 * elevation},
    shadowOpacity: 0.2,
    shadowRadius: 0.7 * elevation,
  };
};

const makeSvgFromPaths = (
  paths: CurrentPath[],
  options: {
    width: number;
    height: number;
    backgroundColor?: string;
  },
) => {
  return `<svg width="${options.width}" height="${
    options.height
  }" viewBox="0 0 ${options.width} ${
    options.height
  }" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="${options.width}" height="${options.height}" fill="${
    options.backgroundColor || 'white'
  }"/>
  <g>

    ${paths.map(path =>
      path.paint && path.path
        ? `<path d="${path.path.toSVGString()}" stroke="${skiaColorToHex(
            path.paint.getColor(),
          )}" stroke-width="${path.paint.getStrokeWidth()}" stroke-linecap="${path.paint.getStrokeCap()}" stroke-linejoin="${path.paint.getStrokeJoin()}"/>`
        : '',
    )}
    </g>
    </svg>`;
};

export default {getPaint, getElevation, makeSvgFromPaths, skiaColorToHex};
