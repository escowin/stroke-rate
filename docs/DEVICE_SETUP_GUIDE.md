# Device Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Browser Setup](#browser-setup)
3. [Heart Rate Monitor Setup](#heart-rate-monitor-setup)
4. [App Configuration](#app-configuration)
5. [Troubleshooting](#troubleshooting)
6. [Platform-Specific Instructions](#platform-specific-instructions)

## Prerequisites

### Required Hardware
- **Device**: Android phone/tablet, iPhone/iPad, or desktop computer
- **Heart Rate Monitor**: Bluetooth-enabled heart rate strap
- **Internet Connection**: Required for initial setup

### Supported Heart Rate Monitors
- **Garmin**: HRM-Pro, HRM-Dual, HRM-Tri, HRM-Swim
- **Polar**: H10, H9, OH1, Verity Sense, A370
- **Wahoo**: TICKR, TICKR X, TICKR FIT
- **Suunto**: Smart Sensor, Suunto 9
- **Generic**: Most Bluetooth 4.0+ heart rate straps

### System Requirements
- **Android**: 6.0+ with Chrome browser
- **iOS**: 12.0+ with Chrome/Edge browser (Safari has limited support)
- **Desktop**: Windows 10+, macOS 10.14+, or Linux with modern browser
- **Bluetooth**: 4.0+ (BLE - Bluetooth Low Energy)

## Browser Setup

### Chrome (Recommended)
1. **Download**: Install Chrome from [chrome.google.com](https://chrome.google.com)
2. **Update**: Ensure you have the latest version
3. **Permissions**: Grant location and Bluetooth permissions when prompted
4. **Settings**: Enable "Use hardware acceleration when available"

### Edge (Windows/Mac)
1. **Download**: Install Edge from [microsoft.com/edge](https://microsoft.com/edge)
2. **Update**: Ensure you have the latest version
3. **Permissions**: Grant location and Bluetooth permissions when prompted
4. **Settings**: Enable "Use hardware acceleration when available"

### Safari (iOS - Limited Support)
⚠️ **Important**: Safari on iOS does not support Web Bluetooth API
- **Workaround**: Use Chrome or Edge browser on iOS
- **Alternative**: Use the app for data viewing only (no real-time monitoring)

### Firefox (Limited Support)
- **Web Bluetooth**: Limited support, may not work with all devices
- **Recommendation**: Use Chrome or Edge for best compatibility

## Heart Rate Monitor Setup

### Garmin Heart Rate Monitors

#### HRM-Pro, HRM-Dual, HRM-Tri
1. **Moisten the strap**: Wet the electrode areas for better conductivity
2. **Put on the strap**: Position around chest, just below pectoral muscles
3. **Turn on**: The device turns on automatically when worn
4. **Pairing mode**: Hold the device near your phone/computer
5. **Connect**: Select the device in the Stroke Rate app

#### HRM-Swim
1. **Moisten the strap**: Wet the electrode areas
2. **Put on the strap**: Position around chest
3. **Turn on**: Press and hold the button until LED flashes
4. **Pairing mode**: Device enters pairing mode automatically
5. **Connect**: Select the device in the Stroke Rate app

### Polar Heart Rate Monitors

#### H10, H9
1. **Moisten the strap**: Wet the electrode areas
2. **Put on the strap**: Position around chest
3. **Turn on**: The device turns on automatically when worn
4. **Pairing mode**: Hold the device near your phone/computer
5. **Connect**: Select the device in the Stroke Rate app

#### OH1, Verity Sense
1. **Charge the device**: Ensure battery is charged
2. **Turn on**: Press and hold the button until LED flashes
3. **Pairing mode**: Device enters pairing mode automatically
4. **Position**: Wear on upper arm or forearm
5. **Connect**: Select the device in the Stroke Rate app

### Wahoo Heart Rate Monitors

#### TICKR, TICKR X
1. **Moisten the strap**: Wet the electrode areas
2. **Put on the strap**: Position around chest
3. **Turn on**: The device turns on automatically when worn
4. **Pairing mode**: Hold the device near your phone/computer
5. **Connect**: Select the device in the Stroke Rate app

#### TICKR FIT
1. **Charge the device**: Ensure battery is charged
2. **Turn on**: Press and hold the button until LED flashes
3. **Pairing mode**: Device enters pairing mode automatically
4. **Position**: Wear on upper arm
5. **Connect**: Select the device in the Stroke Rate app

### Generic Heart Rate Monitors
1. **Check compatibility**: Ensure device supports Bluetooth 4.0+ (BLE)
2. **Moisten the strap**: Wet the electrode areas
3. **Put on the strap**: Position around chest
4. **Turn on**: Follow manufacturer's instructions
5. **Pairing mode**: Enter pairing mode as instructed
6. **Connect**: Select the device in the Stroke Rate app

## App Configuration

### Initial Setup
1. **Open the app**: Navigate to the Stroke Rate app in your browser
2. **Check compatibility**: The app will automatically check your browser
3. **Grant permissions**: Allow Bluetooth and location access when prompted
4. **Enable Bluetooth**: Ensure Bluetooth is enabled on your device

### Adding Rowers
1. **Go to Setup**: Click "Setup" in the main navigation
2. **Add Rower**: Click "Add Rower" button
3. **Enter details**:
   - **Name**: Rower's full name
   - **Seat**: Select seat number (1-4)
   - **Target Zones**: Set heart rate zones (optional)
4. **Save**: Click "Save Rower" to add to the crew

### Connecting Devices
1. **Scan for devices**: Click "Scan for Devices" button
2. **Select device**: Choose your heart rate monitor from the list
3. **Connect**: Click "Connect" next to your device
4. **Assign to rower**: Select which rower the device belongs to
5. **Test connection**: Verify heart rate data is being received

### Setting Heart Rate Zones
1. **Go to Setup**: Click "Setup" in the main navigation
2. **Select rower**: Click on a rower to edit their settings
3. **Set zones**: Enter custom heart rate zones or use defaults
4. **Save**: Click "Save" to update the rower's settings

## Troubleshooting

### Common Connection Issues

#### Device Not Found
**Symptoms**: Heart rate monitor doesn't appear in scan results
**Solutions**:
- Ensure device is in pairing mode
- Check that Bluetooth is enabled
- Move device closer to phone/computer
- Restart the app and try again
- Check device battery level

#### Connection Failed
**Symptoms**: Device appears but won't connect
**Solutions**:
- Ensure device is not connected to another app
- Disconnect from other devices first
- Restart Bluetooth on your device
- Try connecting again
- Check device compatibility

#### No Heart Rate Data
**Symptoms**: Device connects but shows no data
**Solutions**:
- Check that heart rate strap is properly positioned
- Ensure strap is moist for better conductivity
- Verify device battery is charged
- Try reconnecting the device
- Check device is in range

#### Intermittent Connection
**Symptoms**: Connection drops during use
**Solutions**:
- Keep device within 3 feet of phone/computer
- Avoid interference from other Bluetooth devices
- Check device battery level
- Ensure device is properly positioned
- Try reconnecting the device

### Browser-Specific Issues

#### Chrome Issues
**Problem**: Bluetooth permission denied
**Solution**: Go to Chrome Settings > Privacy and Security > Site Settings > Bluetooth

**Problem**: Location permission required
**Solution**: Grant location permission for Bluetooth scanning

**Problem**: Hardware acceleration disabled
**Solution**: Enable "Use hardware acceleration when available" in Chrome settings

#### Edge Issues
**Problem**: Bluetooth not working
**Solution**: Ensure Windows Bluetooth service is running

**Problem**: Permission denied
**Solution**: Check Windows privacy settings for Bluetooth access

#### iOS Safari Issues
**Problem**: Web Bluetooth not supported
**Solution**: Use Chrome or Edge browser instead

**Problem**: App won't load
**Solution**: Clear Safari cache and try again

### Device-Specific Issues

#### Garmin Devices
**Problem**: Device won't pair
**Solution**: Reset the device by removing battery and reinserting

**Problem**: Poor signal quality
**Solution**: Ensure strap is properly moistened and positioned

#### Polar Devices
**Problem**: Device not detected
**Solution**: Ensure device is in pairing mode (LED flashing)

**Problem**: Connection drops
**Solution**: Check battery level and replace if necessary

#### Wahoo Devices
**Problem**: Device won't turn on
**Solution**: Charge the device for at least 30 minutes

**Problem**: Poor heart rate readings
**Solution**: Ensure strap is properly positioned and moistened

## Platform-Specific Instructions

### Android Setup
1. **Enable Bluetooth**: Go to Settings > Bluetooth and enable
2. **Grant permissions**: Allow location and Bluetooth access
3. **Install Chrome**: Download from Google Play Store
4. **Open app**: Navigate to the Stroke Rate app
5. **Grant permissions**: Allow Bluetooth and location when prompted

### iOS Setup
1. **Enable Bluetooth**: Go to Settings > Bluetooth and enable
2. **Install Chrome**: Download from App Store
3. **Open app**: Navigate to the Stroke Rate app in Chrome
4. **Grant permissions**: Allow Bluetooth and location when prompted
5. **Note**: Safari has limited support, use Chrome for full functionality

### Windows Setup
1. **Enable Bluetooth**: Go to Settings > Devices > Bluetooth and enable
2. **Install Chrome/Edge**: Download from official websites
3. **Open app**: Navigate to the Stroke Rate app
4. **Grant permissions**: Allow Bluetooth and location when prompted
5. **Check drivers**: Ensure Bluetooth drivers are up to date

### macOS Setup
1. **Enable Bluetooth**: Go to System Preferences > Bluetooth and enable
2. **Install Chrome/Edge**: Download from official websites
3. **Open app**: Navigate to the Stroke Rate app
4. **Grant permissions**: Allow Bluetooth and location when prompted
5. **Check compatibility**: Ensure macOS version supports Web Bluetooth

### Linux Setup
1. **Enable Bluetooth**: Use your distribution's Bluetooth manager
2. **Install Chrome**: Download from Google's website
3. **Open app**: Navigate to the Stroke Rate app
4. **Grant permissions**: Allow Bluetooth and location when prompted
5. **Check dependencies**: Ensure all required libraries are installed

## Best Practices

### Device Maintenance
- **Clean regularly**: Wipe down heart rate straps after each use
- **Charge batteries**: Keep devices charged for optimal performance
- **Store properly**: Store devices in a cool, dry place
- **Replace straps**: Replace worn or damaged straps

### Connection Tips
- **Keep devices close**: Maintain within 3 feet for best connection
- **Avoid interference**: Keep away from other Bluetooth devices
- **Moisten straps**: Wet electrode areas for better conductivity
- **Position correctly**: Place straps just below pectoral muscles

### Performance Optimization
- **Close other apps**: Close unnecessary apps to free up memory
- **Update browsers**: Keep browsers updated for best compatibility
- **Clear cache**: Clear browser cache regularly
- **Restart devices**: Restart phones/computers periodically

---

*Last updated: [Current Date]*
*Version: 2.0.0*
