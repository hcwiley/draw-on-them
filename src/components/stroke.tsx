import React from 'react';
import {GestureResponderEvent, TouchableOpacity, View} from 'react-native';

const Stroke = ({
  onPress,
  stroke,
  color,
}: {
  onPress?: (event: GestureResponderEvent) => void;
  stroke: number;
  color: string;
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      style={{
        height: 35,
        width: 35,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <View
        style={{
          width: 25,
          backgroundColor: color,
          height: stroke,
          borderRadius: 10,
          transform: [
            {
              rotateZ: '-45deg',
            },
          ],
        }}></View>
    </TouchableOpacity>
  );
};

export default Stroke;
