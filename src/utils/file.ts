import RNFS from 'react-native-fs';

/**
 * Function to save text to a file
 */
export const saveTextToFile = (
  text: string,
  fileName: string,
  encoding: string = 'utf8',
) => {
  const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;
  return RNFS.writeFile(path, text, encoding);
};
