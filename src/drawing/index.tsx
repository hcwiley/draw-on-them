import {
  useValue,
  Canvas,
  Circle,
  Group,
  Image as CanvasImage,
  useImage,
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
import uuid from 'react-native-uuid';
import {
  Alert,
  LayoutChangeEvent,
  SafeAreaView,
  useWindowDimensions,
  View,
  Image,
} from 'react-native';
import {useDrawingContext} from '../store';
import Header from '../components/header';

const defaultBackgroundImage_path =
  // 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/436528/1447063/main-image';
  'https://collectionapi.metmuseum.org/api/collection/v1/iiif/483438/1016551/main-image';

const defaultBackgroundImage = {
  uuid: uuid.v4(),
  // name: 'Irises',
  name: 'Egon Schiele_Self-portrait',
  ext: 'jpg',
  // sourceUrl: '../assets/canvasBackgrounds/Irises.jpg',
  sourceUrl: defaultBackgroundImage_path,
  image: null,
};
// sourceUrl: 'https://www.metmuseum.org/art/collection/search/436528',

const Drawing = () => {
  const touchState = useRef(false);
  const skiaPath = useValue({path: Skia.Path.Make(), paint: Skia.Paint()});
  const curX = useValue(0);
  const curY = useValue(0);
  const {width} = useWindowDimensions();
  const [canvasHeight, setCanvasHeight] = useState(400);
  const {
    history,
    completedPaths,
    setCompletedPaths,
    stroke,
    getStrokeWidth,
    getColor,
    setCanvasInfo,
    canvasOpacity,
    backgroundOpacity,
    backgroundImage,
    setBackgroundImage,
  } = useDrawingContext();

  useEffect(() => {
    setBackgroundImage(defaultBackgroundImage);
  }, []);

  // let drawableBackgroundImage = null;
  // if (backgroundImage?.localCachePath) {
  //   drawableBackgroundImage = useImage(`uri://${backgroundImage.localCachePath}`);
  // }

  const onDrawingActive = useCallback(
    (touchInfo: ExtendedTouchInfo) => {
      // console.log(`onDrawingActive`);

      const {x, y} = touchInfo;

      curX.current = x;
      curY.current = y;

      if (touchInfo.toolType == ToolType.Pencil && touchState.current) {
        skiaPath.current.path.lineTo(x, y);
      }
    },
    [stroke],
  );

  const onDrawingStart = useCallback(
    (touchInfo: TouchInfo) => {
      // console.log(`onDrawingStart`);
      // only respond to pencil for drawing
      if (touchInfo.toolType != ToolType.Pencil) return;

      const {x, y} = touchInfo;
      touchState.current = true;

      skiaPath.current.path.reset();
      skiaPath.current.path.moveTo(x, y);
      skiaPath.current.paint.reset();
      skiaPath.current.paint = stroke.copy();
    },
    [stroke],
  );

  const onDrawingFinished = useCallback(
    (touchInfo: TouchInfo) => {
      // console.log(`onDrawingFinished`);

      if (touchInfo.toolType == ToolType.Pencil) updatePaths();
      skiaPath.current.path.reset();
      touchState.current = false;
    },
    [completedPaths.length],
  );

  const touchHandler = useTouchHandler(
    {
      onActive: onDrawingActive,
      onStart: onDrawingStart,
      onEnd: onDrawingFinished,
    },
    [stroke],
  );

  const updatePaths = () => {
    // if (!currentPath.current) return;
    setCompletedPaths((_completedPaths: [{}]) => {
      const updatedPaths = _completedPaths.slice();
      // console.log(`updatedPaths: ${updatedPaths.length}`);
      updatedPaths.push({
        path: skiaPath.current.path.copy(),
        paint: skiaPath.current.paint.copy(),
        uuid: Math.random().toString(),
      });
      return updatedPaths;
    });
    // history.push(skiaPath.current);
  };

  const onDraw = useDrawCallback(
    (_canvas, info) => {
      touchHandler(info.touches);

      // if (!canvas.current) {
      setCanvasInfo({
        width: info.width,
        height: info.height,
      });
      //   // canvas.current = _canvas;
      // }
    },
    [stroke],
  );

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
          {backgroundImage?.localCachePath && (
            <Image
              style={{
                opacity: backgroundOpacity,
                position: 'absolute',
                top: '10%',
                left: '10%',
                right: '10%',
                bottom: '10%',
                resizeMode: 'contain',
              }}
              source={{uri: `${backgroundImage.localCachePath}`}}
            />
          )}
          <Canvas
            style={{
              height: canvasHeight,
              width: width - 24,
              position: 'absolute',
            }}>
            <Group opacity={backgroundOpacity}>
              {/* {backgroundImage?.localCachePath && drawableBackgroundImage && (
                <CanvasImage
                  image={drawableBackgroundImage}
                  fit="contain"
                  x={width * 0.1}
                  y={canvasHeight * 0.1 - 20}
                  width={width * 0.8}
                  height={canvasHeight * 0.8}
                />
              )} */}
            </Group>
            <Group opacity={canvasOpacity}>
              <Circle r={3} cx={curX} cy={curY} color="#fff0" />
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
                  strokeWidth={Selector(skiaPath, state => getStrokeWidth())}
                  color={Selector(skiaPath, state => getColor())}
                  style="stroke"
                />
              )}
            </Group>
          </Canvas>
          {backgroundImage && <Header />}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Drawing;
