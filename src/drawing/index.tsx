import {
  Canvas,
  ExtendedTouchInfo,
  ICanvas,
  Path,
  Skia,
  SkiaView,
  ToolType,
  TouchInfo,
  useDrawCallback,
  useTouchHandler,
} from '@shopify/react-native-skia';
import React, {useCallback, useRef, useState} from 'react';
import {
  Alert,
  LayoutChangeEvent,
  SafeAreaView,
  useWindowDimensions,
  View,
} from 'react-native';
import useDrawingStore, {CurrentPath} from '../store';
import Header from '../components/header';
import history from './history';
import Toolbar from '../components/toolbar';

const Drawing = () => {
  const touchState = useRef(false);
  const canvas = useRef<ICanvas>();
  const currentPath = useRef<CurrentPath | null>();
  const {width} = useWindowDimensions();
  const completedPaths = useDrawingStore(state => state.completedPaths);
  const setCompletedPaths = useDrawingStore(state => state.setCompletedPaths);
  const stroke = useDrawingStore(state => state.stroke);
  const strokeWidth = useDrawingStore(state => state.strokeWidth);
  const [canvasHeight, setCanvasHeight] = useState(400);

  const onDrawingActive = useCallback((touchInfo: ExtendedTouchInfo) => {
    const {x, y} = touchInfo;
    if (!currentPath.current?.path) return;

    
    if (touchState.current) {
      currentPath.current.path.lineTo(x, y);
      // TODO: make path variable thickness based on force
      // let _strokeWidth = strokeWidth * Math.pow((0.5 + touchInfo.force), 5);
      // currentPath.current.paint.setStrokeWidth(_strokeWidth);
      if (currentPath.current) {
        canvas.current?.drawPath(
          currentPath.current.path,
          currentPath.current.paint,
        );
      }
    }
  }, []);

  const onDrawingStart = useCallback(
    (touchInfo: TouchInfo) => {
      if (currentPath.current) return;

      // only respond to pencil for drawing
      if (touchInfo.toolType != ToolType.Pencil) return;

      const {x, y} = touchInfo;
      currentPath.current = {
        path: Skia.Path.Make(),
        paint: stroke.copy(),
      };

      touchState.current = true;
      currentPath.current.path?.moveTo(x, y);

      if (currentPath.current) {
        canvas.current?.drawPath(
          currentPath.current.path,
          currentPath.current.paint,
        );
      }
    },
    [stroke],
  );

  const onDrawingFinished = useCallback(() => {
    updatePaths();
    currentPath.current = null;
    touchState.current = false;
  }, [completedPaths.length]);

  const touchHandler = useTouchHandler({
    onActive: onDrawingActive,
    onStart: onDrawingStart,
    onEnd: onDrawingFinished,
  });

  const updatePaths = () => {
    if (!currentPath.current) return;
    let updatedPaths = [...completedPaths];
    updatedPaths.push({
      path: currentPath.current?.path.copy(),
      paint: currentPath.current?.paint.copy(),
      color: useDrawingStore.getState().color,
    });
    history.push(currentPath.current);
    setCompletedPaths(updatedPaths);
  };

  const onDraw = useDrawCallback((_canvas, info) => {
    touchHandler(info.touches);

    if (currentPath.current) {
      canvas.current?.drawPath(
        currentPath.current.path,
        currentPath.current.paint,
      );
    }

    if (!canvas.current) {
      useDrawingStore.getState().setCanvasInfo({
        width: info.width,
        height: info.height,
      });
      canvas.current = _canvas;
    }
  }, []);

  const onLayout = (event: LayoutChangeEvent) => {
    if (canvasHeight == 400) setCanvasHeight(event.nativeEvent.layout.height);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}>
      <View
        style={{
          backgroundColor: '#f0f0f0',
          flex: 1,
          alignItems: 'center',
        }}>
        <Header />

        <View
          onLayout={onLayout}
          style={{
            width: width - 24,
            flexGrow: 1,
            backgroundColor: '#ffffff',
            borderRadius: 10,
            overflow: 'hidden',
            elevation: 1,
          }}>
          <SkiaView
            onDraw={onDraw}
            style={{height: canvasHeight, width: width - 24, zIndex: 10}}
          />

          <Canvas
            style={{
              height: canvasHeight,
              width: width - 24,
              position: 'absolute',
            }}>
            {completedPaths?.map(path => (
              <Path
                key={path.path.toSVGString()}
                path={path.path}
                //@ts-ignore
                paint={{current: path.paint}}
              />
            ))}
          </Canvas>
        </View>

        <Toolbar />
      </View>
    </SafeAreaView>
  );
};

export default Drawing;
