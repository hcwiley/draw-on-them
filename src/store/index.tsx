import {DrawingInfo, Skia, SKPaint, SKPath} from '@shopify/react-native-skia';
import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import uuid from 'react-native-uuid';

import utils from '../drawing/utils';

export type CurrentPath = {
  path: SKPath;
  paint: SKPaint;
  color?: string;
};

export const DrawingContext = createContext('drawing');

export const useDrawingContext = () => useContext(DrawingContext);

export function DrawingProvider({children}) {
  const drawing = useDrawingStore();
  return (
    <DrawingContext.Provider value={drawing}>
      {children}
    </DrawingContext.Provider>
  );
}

export const useDrawingStore = () => {
  const [completedPaths, setCompletedPaths] = useState<CurrentPath[]>([]);
  const [strokeObj, _setStroke] = useState<{
    color: string;
    strokeWidth: number;
  }>();
  const [canvasInfo, setCanvasInfo] = useState<Partial<DrawingInfo> | null>(
    null,
  );
  // make foo a uuid
  const [foo, _setFoo] = useState<string>(uuid.v4());

  const getStroke = () => {
    const _stroke = Skia.Paint();

    console.log(
      `get stored values: ${strokeObj.color} ${strokeObj.strokeWidth}`,
    );

    _stroke.setColor(Skia.Color(strokeObj.color));
    _stroke.setStrokeWidth(strokeObj.strokeWidth);
    return _stroke;
  };

  const setStroke = (_stroke: SKPaint) => {
    // why is this being such a jerk?
    console.log(`newStroke: ${_stroke.getColor()} ${_stroke.getStrokeWidth()}`);
    _setStroke({
      strokeWidth: _stroke.getStrokeWidth(),
      color: _stroke.getColor(),
    });
  };

  useEffect(() => {
    // _setStroke(utils.getPaint(2, 'black'));
    _setStroke({
      strokeWidth: 2,
      color: '#fe1',
    });
    console.log(`useDrawingStore init...`);
  }, []);

  const setFoo = (newFoo: string) => {
    return _setFoo(newFoo);
  };

  return {
    completedPaths,
    setCompletedPaths,
    getStroke,
    setStroke,
    strokeObj,
    getColor: () => strokeObj?.color,
    strokeWidth: () => getStroke().getStrokeWidth(),
    setColor: (color: string) => getStroke().setColor(color),
    setStrokeWidth: (width: number) => getStroke().setStrokeWidth(width),
    canvasInfo,
    setCanvasInfo,
    getFoo: () => foo,
    foo,
    setFoo,
  };
};
