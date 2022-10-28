import {
  useValue,
  Canvas,
  Circle,
  ExtendedTouchInfo,
  Path,
  Skia,
  Selector,
  SkiaView,
  ToolType,
  TouchInfo,
  useDrawCallback,
  useTouchHandler,
} from '@shopify/react-native-skia';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Alert,
  LayoutChangeEvent,
  SafeAreaView,
  useWindowDimensions,
  View,
} from 'react-native';
import {useDrawingContext} from '../store';
import Header from '../components/header';
import history from './history';
import Toolbar from '../components/toolbar';

const Drawing = () => {
  const touchState = useRef(false);
  const skiaPath = useValue({path: Skia.Path.Make(), paint: Skia.Paint()});
  const curX = useValue(0);
  const curY = useValue(0);
  const {width} = useWindowDimensions();
  // const [completedPaths, setCompletedPaths] = useState([]);
  // const completedPaths = useDrawingContext(state => state.completedPaths);
  // const setCompletedPaths = useDrawingContext(state => state.setCompletedPaths);
  // const stroke = useDrawingContext(state => state.stroke);
  // const strokeWidth = useDrawingContext(state => state.strokeWidth);
  const [canvasHeight, setCanvasHeight] = useState(400);
  const {
    foo,
    setFoo,
    getFoo,
    completedPaths,
    setCompletedPaths,
    strokeWidth,
    getStrokeWidth,
    getColor,
    getStroke,
    strokeObj,
  } = useDrawingContext();

  const onDrawingActive = useCallback((touchInfo: ExtendedTouchInfo) => {
    // console.log(`onDrawingActive`);

    const {x, y} = touchInfo;

    curX.current = x;
    curY.current = y;

    if (touchInfo.toolType == ToolType.Pencil && touchState.current) {
      skiaPath.current.path.lineTo(x, y);
    }
  }, []);

  const onDrawingStart = useCallback((touchInfo: TouchInfo) => {
    // console.log(`onDrawingStart`);
    // only respond to pencil for drawing
    if (touchInfo.toolType != ToolType.Pencil) return;

    const {x, y} = touchInfo;
    touchState.current = true;

    skiaPath.current.path.reset();
    skiaPath.current.path.moveTo(x, y);
    skiaPath.current.paint = getStroke().copy();
    console.log(`set paint to ${skiaPath.current.paint.getColor()}`);
    console.log(`set paint to ${getColor()}`);
    console.log(`strokeObj: ${JSON.stringify(strokeObj, null, 2)}`);
  }, []);

  const onDrawingFinished = useCallback(() => {
    // console.log(`onDrawingFinished`);

    updatePaths();
    skiaPath.current.path.reset();
    touchState.current = false;
  }, [completedPaths.length]);

  const touchHandler = useTouchHandler({
    onActive: onDrawingActive,
    onStart: onDrawingStart,
    onEnd: onDrawingFinished,
  });

  const updatePaths = () => {
    // if (!currentPath.current) return;
    setCompletedPaths(_completedPaths => {
      const updatedPaths = _completedPaths.slice();
      console.log(`updatedPaths: ${updatedPaths.length}`);
      updatedPaths.push({
        path: skiaPath.current.path.copy(),
        paint: skiaPath.current.paint.copy(),
        uuid: Math.random().toString(),
      });
      return updatedPaths;
    });
    // history.push(skiaPath.current);
  };

  const onDraw = useDrawCallback((_canvas, info) => {
    touchHandler(info.touches);

    // if (!canvas.current) {
    //   useDrawingContext.getState().setCanvasInfo({
    //     width: info.width,
    //     height: info.height,
    //   });
    //   // canvas.current = _canvas;
    // }
  }, []);

  const onLayout = (event: LayoutChangeEvent) => {
    if (canvasHeight == 400) setCanvasHeight(event.nativeEvent.layout.height);
  };

  // useEffect(() => {
  //   // setCompletedPaths(completedPaths);
  // }, [completedPaths]);

  useEffect(() => {
    console.log(`drawing foo: ${getFoo()}`);
    console.log(`strokeObj: ${JSON.stringify(strokeObj, null, 2)}`);
  }, [foo, strokeObj]);

  useEffect(() => {
    console.log(`drawing before foo: ${getFoo()}`);
    setFoo('drawing init');
  }, []);

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
        {/* <Header /> */}

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
            <Circle r={3} cx={curX} cy={curY} color="#f00" />
            {completedPaths?.map(pathObj => (
              <Path
                key={pathObj.uuid}
                path={pathObj.path}
                strokeWidth={pathObj.paint.getStrokeWidth()}
                color={pathObj.paint.getColor()}
                style="stroke"
              />
            ))}
            {skiaPath && skiaPath.current && (
              <Path
                key={'current-path'}
                path={Selector(skiaPath, state => state.path)}
                //@ts-ignore
                strokeWidth={Selector(skiaPath, state =>
                  state.paint.getStrokeWidth(),
                )}
                color={Selector(skiaPath, state => state.paint.getColor())}
                // color={Selector(skiaPath, state => '#f00')}
                style="stroke"
              />
            )}
          </Canvas>
        </View>

        <Toolbar />
      </View>
    </SafeAreaView>
  );
};

export default Drawing;
