import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, SafeAreaView, ImageStyle, Alert, Dimensions, Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, FlashMode, CameraRatio } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

// Get screen dimensions
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_RATIO = SCREEN_HEIGHT / SCREEN_WIDTH;

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const [facing, setFacing] = useState<CameraType>('front'); // Default to front camera for selfies
  const [flash, setFlash] = useState<FlashMode>('off');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isMirrored, setIsMirrored] = useState<boolean>(true); // Mirror mode on by default
  const [isFlipped, setIsFlipped] = useState<boolean>(false); // Horizontal flip
  const [isSaving, setIsSaving] = useState<boolean>(false); // Saving state
  const [supportedRatios, setSupportedRatios] = useState<string[]>([]);
  const [selectedRatio, setSelectedRatio] = useState<CameraRatio | undefined>(undefined);
  const cameraRef = useRef<any>(null);
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);

  useEffect(() => {
    // Check media library permissions
    if (!mediaLibraryPermission) {
      requestMediaLibraryPermission();
    }
  }, [mediaLibraryPermission, requestMediaLibraryPermission]);

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View style={styles.container}>
        <Text>Loading camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Permission needed to use the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!mediaLibraryPermission || !mediaLibraryPermission.granted) {
    // Media library permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Gallery permission needed to save photos</Text>
        <TouchableOpacity style={styles.button} onPress={requestMediaLibraryPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'front' ? 'back' : 'front'));
  };

  const toggleFlash = () => {
    setFlash(current => (current === 'off' ? 'on' : 'off'));
  };

  const toggleFlip = () => {
    setIsFlipped(current => !current);
  };

  const takePicture = async () => {
    if (!cameraRef.current) {
      console.error('Camera ref is not available');
      Alert.alert('Error', 'Camera not ready, please try again.');
      return;
    }
    
    try {
      console.log('Taking picture...');
      
      // Use simple photo options to reduce issues
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,  // Reduce quality a bit to prevent performance issues
        exif: false,   // Turn off EXIF data which can cause problems
        skipProcessing: Platform.OS === 'ios' ? true : false // Skip processing on iOS
      });
      
      console.log('Picture taken successfully:', photo.uri);
      console.log('Picture dimensions:', photo.width, 'x', photo.height);
      
      if (!photo.uri) {
        throw new Error('No photo URI was returned');
      }
      
      setCapturedImage(photo.uri);
    } catch (error) {
      console.error('Could not take photo:', error);
      Alert.alert('Error', 'An error occurred while taking the photo: ' + 
        (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  // Save photo to gallery
  const savePicture = async () => {
    if (!capturedImage || !mediaLibraryPermission?.granted) {
      return;
    }

    setIsSaving(true);
    try {
      // If flip is applied, we need to manipulate the image first
      let finalImageUri = capturedImage;
      
      if (isFlipped) {
        // This part requires actual image manipulation, but for a simple demo
        // we'll use the original image (current flip effect is just for display)
        // In a real app, an image processing library would be used here
      }
      
      // Save to gallery
      const asset = await MediaLibrary.createAssetAsync(finalImageUri);
      await MediaLibrary.createAlbumAsync('MirrorCamera', asset, false);
      
      Alert.alert('Success', 'Photo saved to gallery.');
    } catch (error) {
      console.error('Could not save photo:', error);
      Alert.alert('Error', 'An error occurred while saving the photo.');
    } finally {
      setIsSaving(false);
    }
  };

  // Style for the captured image
  const capturedImageStyle: ImageStyle = {
    flex: 1,
    width: '100%',
    height: '100%',
    transform: [
      { scaleX: isFlipped ? -1 : 1 } // Apply flip to the captured photo as well
    ]
  };
  
  // Handle camera ready and get supported ratios
  const handleCameraReady = async () => {
    console.log('Camera ready');
    if (Platform.OS === 'android') {
      try {
        if (cameraRef.current && typeof cameraRef.current.getAvailablePictureSizesAsync === 'function') {
          const ratios = await cameraRef.current.getAvailablePictureSizesAsync("16:9");
          console.log('Supported ratios:', ratios);
          setSupportedRatios(ratios || []);
          
          // Select a common ratio as CameraRatio
          if (ratios && ratios.includes('16:9')) {
            setSelectedRatio('16:9' as CameraRatio);
          } else if (ratios && ratios.length > 0 && 
                    (ratios[0] === '4:3' || ratios[0] === '16:9' || ratios[0] === '1:1')) {
            setSelectedRatio(ratios[0] as CameraRatio);
          }
        } else {
          console.log('getAvailablePictureSizesAsync method not available on camera ref');
        }
      } catch (error) {
        console.error('Error getting supported ratios:', error);
        // Fallback to a standard ratio
        setSelectedRatio('4:3' as CameraRatio);
      }
    }
  };
  
  // Check if the image file exists
  const checkImageExists = async () => {
    if (capturedImage) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(capturedImage);
        console.log('Image file info:', fileInfo);
        if (fileInfo.exists) {
          Alert.alert('File Exists', 'Photo file exists. Size: ' + 
            (fileInfo.size ? (fileInfo.size / 1024).toFixed(2) + ' KB' : 'Unknown'));
        } else {
          Alert.alert('Error', 'Photo file not found.');
        }
      } catch (error) {
        console.error('Error during file check:', error);
        Alert.alert('Error', 'An error occurred during file check.');
      }
    }
  };

  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.capturedImageContainer}>
          {imageLoadError ? (
            // Show error message if image cannot be loaded
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load photo</Text>
              <Text style={styles.errorSubText}>File not found or cannot be read</Text>
            </View>
          ) : (
            <Image 
              source={{ uri: capturedImage }} 
              style={capturedImageStyle} 
              resizeMode="contain" 
              onError={(error) => {
                console.error('Image loading error:', error.nativeEvent.error);
                setImageLoadError(true);
              }} 
              fadeDuration={300}
            />
          )}
          
          {/* Back button - top left corner */}
          <TouchableOpacity 
            style={[styles.iconButton, styles.backButton]} 
            onPress={retakePicture}
          >
            <Text style={styles.iconText}>←</Text>
          </TouchableOpacity>
          
          {/* Save button - bottom right corner */}
          {!imageLoadError && (
            <TouchableOpacity 
              style={[styles.iconButton, styles.saveButton, isSaving && styles.disabledButton]} 
              onPress={savePicture}
              disabled={isSaving}
            >
              <Text style={styles.iconText}>{isSaving ? "⏳" : "💾"}</Text>
            </TouchableOpacity>
          )}
          
          {/* Debug button - only in development mode */}
          {__DEV__ && (
            <TouchableOpacity 
              style={[styles.iconButton, styles.debugButton]} 
              onPress={checkImageExists}
            >
              <Text style={styles.iconText}>🐞</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Define style for camera view
  const cameraContainerStyle = {
    ...styles.cameraContainer,
    transform: [
      { scaleX: isFlipped ? -1 : 1 } // Horizontal flip
    ]
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.cameraOuterContainer}>
        <View style={cameraContainerStyle}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            flash={flash}
            mirror={isMirrored}
            onCameraReady={handleCameraReady}
            onMountError={(error) => {
              console.error('Camera mount error:', error);
              Alert.alert('Camera Error', 'Could not start camera: ' + error.message);
            }}
            // Use ratio only on Android and only if we have a selected ratio
            {...(Platform.OS === 'android' && selectedRatio ? { ratio: selectedRatio } : {})}
          />
        </View>
      </View>

      <View style={styles.topControlsContainer}>
        <TouchableOpacity style={styles.flipButton} onPress={toggleFlip}>
          <Text style={styles.iconText}>↔️</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
          <Text style={styles.iconText}>{flash === 'off' ? "🔦" : "💡"}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
          <Text style={styles.iconText}>🔄</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraOuterContainer: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'center', // For centering
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
    aspectRatio: 9/16, // 16:9 aspect ratio (horizontally 9:16)
    alignSelf: 'center', // For centering
  },
  camera: {
    flex: 1,
  },
  text: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1e88e5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
    marginHorizontal: 10,
  },
  saveButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#4caf50',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  topControlsContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    alignItems: 'flex-end',
  },
  flipButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  disabledButton: {
    backgroundColor: '#757575',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  controlButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  capturedImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  capturedImage: {
    flex: 1,
  },
  capturedButtonsContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorSubText: {
    color: 'white',
    fontSize: 14,
  },
  iconText: {
    fontSize: 24,
    color: 'white',
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  debugButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    backgroundColor: '#ff9800',
  },
}); 