import RNFS from 'react-native-fs';
import ImageResizer from '@bam.tech/react-native-image-resizer';

/**
 *  slugify function to remove non-word chars
 *  */
const slugify = (text: string) => text.replace(/[\W]/gi, '-');

const sketchImageDir = `${RNFS.DocumentDirectoryPath}/sketches`;

export default {
  slugify,
  createResizedImage: ImageResizer.createResizedImage,
  sketchImageDir,
  ...RNFS,
};
