import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CheckBox from '@react-native-community/checkbox';
import Slider from '@react-native-community/slider';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import {useToast} from 'react-native-toast-notifications';
import _ from 'lodash';

import Toolbar from './toolbar';
import {CurrentPath, useDrawingContext} from '../store';
import utils from '../drawing/utils';
import fileUtils from '../utils/file';
import constants from '../drawing/constants';
import {generateBackgroundImage} from '../drawing';

const SideMenu = () => {
  const {MET_SEARCH_URL, MET_OBJECT_URL} = constants;

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
    setUsePencil,
    usePencil,
    setMenuOpen,
    menuOpen,
    setBackgroundImage,
  } = useDrawingContext();
  const [searchText, setSearchText] = useState('');
  const [paginationSize, setPaginationSize] = useState(50);
  const [searchResults, setSearchResults] = useState([]);
  const [thumbnails, setThumbnails] = useState([]); // [uri, uri, uri
  const [canvasOpacityToggle, setCanvasOpacityToggle] = useState(false);
  const toast = useToast();

  const getThumbnail = (objectID: Number) =>
    fetch(MET_OBJECT_URL + objectID)
      .then(res => res.json())
      .then(data => {
        // console.log(`got objectID data:`, JSON.stringify(data, null, 2));
        const {primaryImage, primaryImageSmall} = data;
        if (primaryImageSmall || primaryImage) {
          let uri = primaryImageSmall || primaryImage;
          uri = uri.replace('http:', 'https:');
          // console.log(`got uri: ${uri}`);
          return uri;
        } else {
          // toast.show('No image found', {
          //   type: 'danger',
          // });
        }
        return null;
      });

  const search = async () => {
    let objectIds = '';
    fetch(MET_SEARCH_URL + searchText).then(async res => {
      res
        .json()
        .then(async data => {
          setSearchResults(data.objectIDs);
          console.log(
            `searched for ${searchText} and got ${data.total} results`,
            JSON.stringify(data),
          );
          if (data.total === 0) {
            toast.show('No results found', {
              type: 'danger',
            });
          } else {
            objectIds = data.objectIDs.slice(0, paginationSize);
            return Promise.all(
              _.map(objectIds, async (oid: Number) => {
                const uri = await getThumbnail(oid);
                return {
                  oid,
                  uri,
                };
              }),
            );
          }
        })
        .then(newThumbs => {
          // filter nulls
          // newThumbs = _.filter(newThumbs, (thumb: any) => thumb.uri);
          // // filter for anything not a string and without https://
          // newThumbs = _.filter(newThumbs, (thumb: any) =>
          //   thumb.uri.includes('https://'),
          // );
          console.log(
            `newThumbs: ${newThumbs?.length} from ${objectIds.length} q: ${searchText}`,
          );
          setThumbnails(newThumbs || []);
        });
    });
  };

  useEffect(() => {
    if (searchText.length > 0) {
      _.throttle(search, 800, {leding: true})();
    }
  }, [searchText]);

  return (
    <View
      style={{
        ...styles.container,
        right: menuOpen ? 0 : -300,
      }}>
      <View style={styles.searchHeader}>
        <View style={styles.section}>
          <Text style={styles.label}>Search:</Text>
          <TextInput
            style={styles.input}
            value={searchText}
            onChangeText={val => setSearchText(val)}
          />
          <TouchableOpacity
          onPress={() => setSearchText('')}
          >
            {/* x icon to clear the input box away */}
            <Icon name="close" size={30} />
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text>Filters and jazz coming next</Text>
        </View>
      </View>
      <View style={[styles.section, {flexDirection: 'column'}]}>
        <View style={{width: '100%'}}>
          <Text>Search found: {searchResults?.length}</Text>
        </View>
        <View style={{flex: 1, width: '100%'}}>
          <ScrollView>
            {thumbnails.map((thumb: any) => (
              <TouchableOpacity
                key={thumb.oid}
                onPress={() => {
                  // alert user we got the oid they want to load
                  const newBg = generateBackgroundImage({
                    name: thumb.oid,
                    sourceUrl: thumb.uri,
                  });
                  const msg = `Loading ${JSON.stringify(newBg, null, 2)}`;
                  toast.show(msg);
                  console.log(msg)
                  setBackgroundImage(newBg);
                }}>
                <Image
                  style={styles.thumbnail}
                  source={{
                    uri: thumb.uri,
                  }}
                />
                {/* debugging line to see the json value */}
                {/* <Text>{JSON.stringify(thumb)}</Text> */}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 300,
    backgroundColor: '#ccccff',
    paddingTop: 60,
    zIndex: 100,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  searchHeader: {
    backgroundColor: '#cccccc',
    // flex: 1,
    width: '100%',
    flexDirection: 'column',
    padding: 12,
  },
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
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 4,
    borderColor: 'black',
  },
  thumbnail: {
    width: 100,
    height: 100,
    margin: 4,
  },
});

export default SideMenu;
