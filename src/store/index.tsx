import RNFetchBlob from 'rn-fetch-blob';
import {
  DrawingInfo,
  useImage,
  Skia,
  SKPaint,
  SKPath,
  SkImage,
} from '@shopify/react-native-skia';
import React, {createContext, useContext, useState} from 'react';
import uuid from 'react-native-uuid';

import utils from '../drawing/utils';
import file from '../utils/file';

export type CurrentPath = {
  path: SKPath;
  paint: SKPaint;
  color?: string;
};

export type BackgroundImage = {
  name: string;
  basename: string;
  dirPath: string;
  ext: string;
  sourceUrl: string;
  localCachePath?: string;
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

const defaultStroke = utils.getPaint(1, '#000000');

export const useDrawingStore = () => {
  const [completedPaths, setCompletedPaths] = useState<CurrentPath[]>([]);
  const [stroke, setStroke] = useState<SKPaint>(defaultStroke);
  const [canvasInfo, setCanvasInfo] = useState<Partial<DrawingInfo> | null>(
    null,
  );
  const [canvasOpacity, setCanvasOpacity] = useState(1.0);
  const [backgroundOpacity, setBackgroundOpacity] = useState(1.0);
  const [backgroundImage, setBackgroundImage] = useState<BackgroundImage>({});

  const [usePencil, setUsePencil] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

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
    setColor: (color: string) => {
      console.log(`setting color to ${color}`);
      // debugger
      // stroke.setColor(Skia.Color(color));
    },
    setStrokeWidth: (width: number) => stroke.setStrokeWidth(width),
    canvasInfo,
    setCanvasInfo,
    canvasOpacity,
    setCanvasOpacity,
    backgroundOpacity,
    setBackgroundOpacity,
    backgroundImage,
    setBackgroundImage: (image: BackgroundImage) => {
      image.basename = file.slugify(image.name);
      image.dirPath = `${file.sketchImageDir}/${image.basename}`;
      // get the extension from the name
      image.ext = image.name.split('.').pop() || 'ERROR';
      RNFetchBlob.config({
        path: file.CachesDirectoryPath + '/' + image.basename + '.jpg',
        appendExt: 'jpg',
      })
        .fetch('GET', image.sourceUrl, {
          //some headers?
        })
        .then(res => {
          // the temp file path with file extension `png`
          console.log('The file saved to ', res.path());
          image.localCachePath = res.path();
          setBackgroundImage(image);
        });
    },
    history: {
      history,
      undo,
      redo,
      push,
      clear,
    },
    setUsePencil,
    usePencil,
    menuOpen,
    setMenuOpen,
  };
};
