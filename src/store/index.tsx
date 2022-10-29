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

const defaultStroke = utils.getPaint(3, '#000000');

export const useDrawingStore = () => {
  const [completedPaths, setCompletedPaths] = useState<CurrentPath[]>([]);
  const [stroke, setStroke] = useState<SKPaint>(defaultStroke);
  const [canvasInfo, setCanvasInfo] = useState<Partial<DrawingInfo> | null>(
    null,
  );

  const history: {
    undo: CurrentPath[];
    redo: CurrentPath[];
  } = {
    undo: [],
    redo: [],
  };

  function undo(setCompletedPaths) {
    if (history.undo.length === 0) return;
    let lastPath = history.undo[history.undo.length - 1];
    history.redo.push(lastPath);
    history.undo.splice(history.undo.length - 1, 1);
    setCompletedPaths([...history.undo]);
  }

  function redo(setCompletedPaths) {
    if (history.redo.length === 0) return;
    let lastPath = history.redo[history.redo.length - 1];
    history.redo.splice(history.redo.length - 1, 1);
    history.undo.push(lastPath);
    setCompletedPaths([...history.undo]);
  }

  function clear() {
    history.undo = [];
    history.redo = [];
  }

  function push(path: CurrentPath) {
    history.undo.push(path);
  }

  function floatToHex(f: number) {
    return Math.round(f * 255)
      .toString(16)
      .padStart(2, '0');
  }

  return {
    completedPaths,
    setCompletedPaths,
    setStroke,
    stroke,
    getColor: (mode: string = 'Skia') => {
      const color = stroke.getColor();
      if (mode === 'Skia') {
        return color;
      } else if (mode.toLowerCase() === 'hex') {
        return utils.skiaColorToHex(color);
      }
    },
    getStrokeWidth: () => (stroke ? stroke.getStrokeWidth() : 3),
    setColor: (color: string) => stroke.setColor(color),
    setStrokeWidth: (width: number) => stroke.setStrokeWidth(width),
    canvasInfo,
    setCanvasInfo,
    history: {
      history,
      undo,
      redo,
      push,
      clear,
    },
  };
};
