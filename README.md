# MirrorCamera 🪞📱

MirrorCamera is a mobile application built with Expo React Native that allows you to see yourself as others see you. It provides a mirrored camera view, letting you take photos that match how you appear to others in real life.

## Features

- **Mirror View:** See yourself as others see you (when you raise your left hand, it appears as a right hand in the view)
- **Flip Toggle:** Switch between normal and mirrored camera views
- **Camera Controls:** 
  - Front/back camera toggle
  - Flash control
  - Photo capture with correct perspective
- **Photo Saving:** Save your captured photos directly to your device gallery
- **Proper Aspect Ratio:** What you see in the preview is what you get in the photo

## Getting Started

1. Install dependencies
   ```bash
   npm install
   ```

2. Start the app
   ```bash
   npx expo start
   ```

3. You can run the app on:
   - Physical device using Expo Go
   - Android emulator
   - iOS simulator
   - Development build

## Usage

- **Taking Photos:** Tap the large circular button in the center to capture a photo
- **Toggle Camera:** Tap the 🔄 button to switch between front and back cameras
- **Toggle Flash:** Tap the 🔦/💡 button to turn flash on/off
- **Flip View:** Tap the ↔️ button at the top to toggle between normal and mirrored views
- **Save Photo:** After taking a photo, tap the 💾 button to save it to your gallery

## Permissions

The app requires the following permissions:
- Camera access
- Microphone access
- Photo gallery access (to save photos)

## Technology Stack

- Expo
- React Native
- expo-camera
- expo-media-library
- expo-router

## Development

The main code for the camera interface is located in `app/index.tsx`.

To modify the app:
1. Edit the camera interface in `app/index.tsx`
2. Update the app configuration in `app.json`
3. Run the app with `npx expo start`

## Building for Production

To create a production build:

```bash
npx expo prebuild
npx expo build:android
npx expo build:ios
```

## License

This project is open source and available under the MIT license.
