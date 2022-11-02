import Icon from 'react-native-vector-icons/FontAwesome5';
import CheckBox from '@react-native-community/checkbox';
import Slider from '@react-native-community/slider';
import React, {useState} from 'react';
import {Alert, Text, View, TouchableOpacity, StyleSheet} from 'react-native';
import {useToast} from 'react-native-toast-notifications';
import _ from 'lodash';

import Toolbar from './toolbar';
import {CurrentPath, useDrawingContext} from '../store';
import utils from '../drawing/utils';
import fileUtils from '../utils/file';

const Header = () => {
  const {
    canvasInfo,
    completedPaths,
    setCompletedPaths,
    setStroke,
    setColor,
    setStrokeWidth,
    history,
    backgroundImage,
    canvasOpacity,
    setCanvasOpacity,
    backgroundOpacity,
    setBackgroundOpacity,
  } = useDrawingContext();
  const [canvasOpacityToggle, setCanvasOpacityToggle] = useState(false);
  const toast = useToast();

  /**
   * Reset the canvas & draw state
   */
  const reset = () => {
    Alert.alert(`Reset`, `Are you sure you want to reset the canvas?`, [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => {},
      },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          setCompletedPaths([]);
          setStroke(utils.getPaint(2, 'black'));
          setColor('black');
          setStrokeWidth(2);
          history.clear();
        },
      },
    ]);
  };

  const save = () => {
    if (completedPaths.length === 0) return;
    console.log('saving');
    if (canvasInfo?.width && canvasInfo?.height) {
      const svg = utils.makeSvgFromPaths(completedPaths, {
        width: canvasInfo.width,
        height: canvasInfo.height,
      });

      const {basename, dirPath} = backgroundImage;
      fileUtils
        .exists(dirPath)
        .then(exists => {
          // clear the dir if it exists
          if (exists) {
            fileUtils.unlink(dirPath);
          }
        })
        .then(() => fileUtils.mkdir(dirPath))
        .then(() => {
          let completedPathsJson: CurrentPath[] = [];
          completedPaths.forEach((pathObj: CurrentPath) => {
            completedPathsJson.push(pathObj.path.toCmds());
          });
          return fileUtils.writeFile(
            `${dirPath}/${basename}-paths.json`,
            JSON.stringify(completedPathsJson),
          );
        })
        .then(() => fileUtils.writeFile(`${dirPath}/${basename}.svg`, svg))
        .then(() => {
          return fileUtils.copyFile(
            backgroundImage.localCachePath,
            `${dirPath}/${basename}.jpg`,
          );
        })
        .then(ret => {
          toast.show(`Saved ${basename}`, {
            type: 'success',
          });
        })
        .catch(err => {
          console.warn('error creating dir', err);
          toast.show(`Error saving file!`, {
            type: 'danger',
          });
        });
    }
  };

  const setOpacity = (val: number) => {
    canvasOpacityToggle ? setCanvasOpacity(val) : setBackgroundOpacity(val);
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
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: '#ccc',
      }}>
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

      <Toolbar />

      <View style={{flexDirection: 'row'}}>
        <Text
          style={{
            position: 'absolute',
            textAlign: 'center',
            width: '100%',
            top: -5,
            color: '#333',
            fontSize: 10,
            fontVariant: ['small-caps'],
          }}>
          opacity
        </Text>
        <TouchableOpacity
          style={{
            alignItems: 'center',
            alignSelf: 'center',
            justifyContent: 'center',
          }}
          onPress={newValue => setCanvasOpacityToggle(prev => !prev)}>
          <Icon size={30} name={canvasOpacityToggle ? 'pen-fancy' : 'image'} />
        </TouchableOpacity>
        <Slider
          style={{width: 200, height: 40}}
          minimumValue={0}
          maximumValue={1}
          value={1}
          // NOTE: don't do this as it creates lots of chugging from re-renders
          // value={canvasOpacityToggle ? canvasOpacity : backgroundOpacity}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
          onSlidingComplete={setOpacity}
          onValueChange={val => {
            // throttle the value change to allow ui updates
            _.throttle(() => {
              setOpacity(val);
            }, 30)();
          }}
        />
      </View>

      {/* Icon for hamburger settings menu */}
      <Icon.Button
        name="bars"
        size={20}
        color="black"
        backgroundColor="transparent"
        onPress={() => {
          toast.show('Settings menu coming soon!');
        }}
      />
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
