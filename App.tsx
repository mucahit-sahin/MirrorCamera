import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front'); // Default to front camera for selfies
  const [flash, setFlash] = useState<FlashMode>('off');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View style={styles.container}>
        <Text>Kamera izinleri yükleniyor...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Kamera kullanmak için izin gerekiyor</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>İzin Ver</Text>
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

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setCapturedImage(photo.uri);
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.capturedImageContainer}>
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
          <View style={styles.capturedButtonsContainer}>
            <TouchableOpacity style={styles.button} onPress={retakePicture}>
              <Text style={styles.buttonText}>Tekrar Çek</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
        mirror={true} // Enable mirroring for front camera
      >
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
            <Text style={styles.icon}>{flash === 'off' ? '🔦' : '💡'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
            <Text style={styles.icon}>🔄</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
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
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.2)',
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
  icon: {
    fontSize: 24,
  },
  capturedImageContainer: {
    flex: 1,
  },
  capturedImage: {
    flex: 1,
  },
  capturedButtonsContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 