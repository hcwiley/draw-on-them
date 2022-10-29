import React from 'react';
import {Text, View, TouchableOpacity, StyleSheet} from 'react-native';
import {useDrawingContext} from '../store';
import utils from '../drawing/utils';
import {saveTextToFile} from '../utils/file';

const Header = () => {
  const {
    canvasInfo,
    completedPaths,
    setCompletedPaths,
    setStroke,
    setColor,
    setStrokeWidth,
    history,
  } = useDrawingContext();

  /**
   * Reset the canvas & draw state
   */
  const reset = () => {
    setCompletedPaths([]);
    setStroke(utils.getPaint(2, 'black'));
    setColor('black');
    setStrokeWidth(2);
    history.clear();
  };

  const save = () => {
    if (completedPaths.length === 0) return;
    console.log('saving');
    if (canvasInfo?.width && canvasInfo?.height) {
      const svg = utils.makeSvgFromPaths(completedPaths, {
        width: canvasInfo.width,
        height: canvasInfo.height,
      });
      // save the svg as a timestamp file with YYYY-MM-DD-HH-MM-SS format
      saveTextToFile(
        svg,
        `${new Date().toISOString().replace(/:/g, '-')}.svg`,
      ).then(ret => {
        console.log(`saved to ${ret}`);
      });
    }
  };

  const undo = () => {
    history.undo();
  };

  const redo = () => {
    history.redo();
  };
  return (
    <View
      style={{
        height: 50,
        width: '100%',
        paddingHorizontal: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
      <View
        style={{
          flexDirection: 'row',
        }}>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={undo}
          style={[styles.button, {marginRight: 10}]}>
          <Text style={styles.buttonText}>Undo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={redo}
          activeOpacity={0.6}
          style={styles.button}>
          <Text style={styles.buttonText}>Redo</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: 'row',
        }}>
        <TouchableOpacity
          onPress={reset}
          activeOpacity={0.6}
          style={styles.button}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.6}
          onPress={save}
          style={[styles.button, {marginLeft: 10}]}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    backgroundColor: 'white',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    ...utils.getElevation(1),
  },
  buttonText: {
    color: 'black',
  },
});

export default Header;
