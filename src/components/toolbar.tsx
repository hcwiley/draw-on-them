import React, {useState, useEffect} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Color from '../components/color';
import Stroke from '../components/stroke';
import {useDrawingContext} from '../store';
import constants from '../drawing/constants';
import utils from '../drawing/utils';

const Toolbar = () => {
  const {getStrokeWidth, setStrokeWidth, getColor, setStroke, stroke} =
    useDrawingContext();
  const [showStrokes, setShowStrokes] = useState(false);

  const onStrokeChange = (stroke: number) => {
    setStrokeWidth(stroke);
    setShowStrokes(false);
    setStroke(utils.getPaint(stroke, getColor()));
  };

  const onChangeColor = (color: string) => {
    setStroke(utils.getPaint(2, color));
  };

  const undo = () => {
    history.undo();
  };

  const redo = () => {
    history.redo();
  };

  return (
    <>
      <View style={styles.toolbar}>
        <View
          style={{
            flexDirection: 'row',
          }}>
          <Icon.Button
            name="undo"
            onPress={undo}
            color={'black'}
            backgroundColor={'transparent'}
            style={[styles.button, {marginRight: 10}]}
          />

          <Icon.Button
            name="redo"
            onPress={redo}
            activeOpacity={0.6}
            color={'black'}
            style={styles.button}
          />
        </View>

        {/* Vertical separator */}
        <View style={styles.verticalSeparator} />

        <View
          style={{
            backgroundColor: '#f7f7f7',
            borderRadius: 5,
          }}>
          {showStrokes && (
            <View
              style={{
                width: 5,
                height: 5,
                borderRadius: 100,
                backgroundColor: 'black',
                alignSelf: 'center',
                position: 'absolute',
              }}
            />
          )}
          {showStrokes && (
            <View
              style={[
                styles.toolbar,
                {
                  position: 'absolute',
                  top: 50,
                  height: 50,
                  width: 300,
                },
              ]}>
              {constants.strokes.map(_stroke => (
                <Stroke
                  key={_stroke}
                  stroke={_stroke}
                  color={getColor('hex')}
                  onPress={() => onStrokeChange(_stroke)}
                />
              ))}
            </View>
          )}

          <Stroke
            stroke={getStrokeWidth()}
            color={getColor('hex')}
            onPress={() => setShowStrokes(!showStrokes)}
          />
        </View>

        <View style={styles.verticalSeparator} />

        {constants.colors.map(item => (
          <Color key={item} color={item} onPress={() => onChangeColor(item)} />
        ))}
      </View>
    </>
  );
};

export default Toolbar;

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: '#ffffff',
    height: '80%',
    borderRadius: 100,
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...utils.getElevation(5),
  },
  button: {
    backgroundColor: '#ffffff',
  },
  color: {
    width: 35,
    height: 35,
    marginRight: 10,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    ...utils.getElevation(1),
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalSeparator: {
    height: 30,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginHorizontal: 20,
  },
});
