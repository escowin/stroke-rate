# Frequently Asked Questions (FAQ)

## General Questions

### What is Stroke Rate?
Stroke Rate is a web-based heart rate monitoring application designed specifically for rowing crews. It allows coaches and rowers to monitor real-time heart rate data from multiple heart rate monitors simultaneously during training sessions.

### Who can use Stroke Rate?
- **Rowing Coaches**: Monitor multiple rowers' heart rates during training
- **Rowing Crews**: Track individual and team performance
- **Fitness Enthusiasts**: Use for general heart rate monitoring
- **Sports Teams**: Any team sport requiring heart rate monitoring

### Is Stroke Rate free to use?
Yes, Stroke Rate is completely free to use. There are no subscription fees or hidden costs.

### Do I need to create an account?
No account creation is required. The app works entirely in your browser with local data storage.

## Device and Compatibility

### What devices are supported?
- **Android**: Chrome browser (recommended)
- **iOS**: Safari (limited features), Chrome/Edge (full features)
- **Desktop**: Chrome, Edge, Firefox, Safari
- **Tablets**: All supported mobile browsers

### What heart rate monitors work with Stroke Rate?
Any Bluetooth-enabled heart rate monitor that supports the standard heart rate service, including:
- **Garmin**: HRM-Pro, HRM-Dual, HRM-Tri
- **Polar**: H10, H9, OH1, Verity Sense
- **Wahoo**: TICKR, TICKR X
- **Suunto**: Smart Sensor
- **Generic**: Most Bluetooth heart rate straps

### Why doesn't my heart rate monitor connect?
Common causes and solutions:
- **Bluetooth disabled**: Enable Bluetooth on your device
- **Device not in pairing mode**: Put your heart rate monitor in pairing mode
- **Permission denied**: Grant Bluetooth permissions when prompted
- **Battery low**: Charge or replace the battery
- **Distance too far**: Keep devices within 3 feet of each other
- **iOS Safari**: Use Chrome or Edge instead (Safari doesn't support Web Bluetooth)

### Can I use multiple heart rate monitors at once?
Yes, Stroke Rate supports up to 4 heart rate monitors simultaneously, one for each rower seat.

### What if I have more than 4 rowers?
The app is designed for 4-person crews, but you can:
- Monitor different groups of 4 rowers in separate sessions
- Use the app for the most important rowers
- Export data and combine with other monitoring tools

## Setup and Configuration

### How do I set up my first session?
1. Open the app in a supported browser
2. Go to "Setup" and add your rowers
3. Scan for and connect heart rate monitors
4. Assign devices to rowers
5. Start your first training session

### How do I add a new rower?
1. Go to "Setup" page
2. Click "Add Rower"
3. Enter name and select seat number
4. Optionally set target heart rate zones
5. Save the rower

### How do I connect a heart rate monitor?
1. Ensure the device is on and in pairing mode
2. Click "Scan for Devices"
3. Select your device from the list
4. Click "Connect"
5. Assign to a rower

### Can I save rower profiles?
Yes, rower information is saved locally on your device and will be available for future sessions.

## Training Sessions

### How do I start a training session?
1. Ensure all heart rate monitors are connected
2. Click "Start Session" on the Dashboard
3. Monitor real-time heart rate data
4. Click "End Session" when finished

### What happens if a device disconnects during a session?
The app will attempt to automatically reconnect. If reconnection fails:
- A warning will be displayed
- You can manually reconnect the device
- Session data will continue to be recorded for other connected devices

### Can I pause a session?
Yes, you can pause and resume sessions as needed. The session timer will pause during breaks.

### How long can a session last?
There's no technical limit to session duration. Sessions are limited only by:
- Device battery life
- Available storage space
- Practical training considerations

### What if I forget to end a session?
The app will automatically end the session if no heart rate data is received for an extended period, but it's best to manually end sessions when finished.

## Data and Storage

### Where is my data stored?
All data is stored locally on your device using browser storage. No data is sent to external servers.

### How long is my data kept?
Data is stored indefinitely on your device until you manually delete it or clear browser data.

### Can I export my data?
Yes, you can export session data in CSV or JSON format from the Export page.

### What data is exported?
Exported data includes:
- Session information (date, duration, rowers)
- Heart rate data (timestamps, BPM, zones)
- Device information (battery levels, connection status)
- Performance metrics (averages, peaks, zone distribution)

### Can I import data from other apps?
Currently, Stroke Rate only supports data export. Import functionality may be added in future versions.

### Is my data secure?
Yes, your data is stored locally and is not transmitted to external servers without your explicit consent.

## Heart Rate Zones

### What are heart rate zones?
Heart rate zones are ranges of heart rate that correspond to different training intensities:
- **Recovery Zone** (50-60% max HR): Light intensity, warm-up/cool-down
- **Aerobic Zone** (60-70% max HR): Moderate intensity, base training
- **Threshold Zone** (70-80% max HR): High intensity, lactate threshold
- **Anaerobic Zone** (80-90% max HR): Very high intensity, power training

### How are zones calculated?
Zones are calculated based on maximum heart rate. The default calculation is 220 - age, but you can customize zones for each rower.

### Can I customize heart rate zones?
Yes, you can set custom zones for each rower in the Setup page.

### What if I don't know my maximum heart rate?
You can use the default calculation (220 - age) or consult with a sports medicine professional for accurate testing.

## Troubleshooting

### The app won't load
**Possible causes and solutions:**
- **Internet connection**: Check your internet connection
- **Browser cache**: Clear browser cache and cookies
- **Browser compatibility**: Use a supported browser (Chrome, Edge, Safari)
- **JavaScript disabled**: Enable JavaScript in your browser
- **Ad blocker**: Disable ad blockers that might block the app

### Heart rate data is not updating
**Possible causes and solutions:**
- **Device disconnected**: Check connection status and reconnect if needed
- **Poor signal**: Ensure heart rate strap is properly positioned and moist
- **Battery low**: Check device battery level
- **Bluetooth issues**: Restart Bluetooth on your device
- **App refresh**: Refresh the app page

### Session data is missing
**Possible causes and solutions:**
- **Browser storage full**: Clear browser data or use a different browser
- **Session not ended properly**: Always end sessions manually
- **Browser crash**: Export data regularly as backup
- **Storage permissions**: Ensure browser has permission to store data

### App is slow or unresponsive
**Possible causes and solutions:**
- **Too many browser tabs**: Close unnecessary tabs
- **Low memory**: Restart your device
- **Browser issues**: Try a different browser
- **Large dataset**: Export old data to free up space

### Can't connect to heart rate monitor
**Possible causes and solutions:**
- **Bluetooth disabled**: Enable Bluetooth
- **Device not in pairing mode**: Put device in pairing mode
- **Permission denied**: Grant Bluetooth permissions
- **Device already connected**: Disconnect from other apps first
- **Distance too far**: Keep devices close together
- **iOS Safari**: Use Chrome or Edge instead

## Accessibility

### Is Stroke Rate accessible to users with disabilities?
Yes, Stroke Rate includes comprehensive accessibility features:
- **Screen reader support**: Full compatibility with screen readers
- **Keyboard navigation**: Complete keyboard-only operation
- **High contrast**: High contrast mode for better visibility
- **Voice announcements**: Heart rate updates announced automatically
- **Large text**: Scalable text for better readability

### How do I use Stroke Rate with a screen reader?
The app is fully compatible with screen readers. Heart rate updates and status changes are announced automatically. Use standard screen reader navigation to move through the interface.

### Can I use Stroke Rate with keyboard only?
Yes, all functionality is accessible via keyboard. Use Tab to navigate and Enter/Space to activate controls.

### Are there keyboard shortcuts?
Yes, see the Keyboard Shortcuts section in the User Guide for a complete list.

## Technical Support

### How do I report a bug?
- Check the troubleshooting section first
- Use the built-in compatibility test
- Check browser console for error messages
- Document the steps to reproduce the issue

### How do I request a feature?
Feature requests can be submitted through the app's feedback system or by contacting the development team.

### Where can I get help?
- **User Guide**: Comprehensive documentation
- **FAQ**: This frequently asked questions document
- **Compatibility Test**: Built-in browser compatibility checker
- **Accessibility Test**: Built-in accessibility validator

### Is there a user manual?
Yes, the User Guide provides comprehensive documentation for all features and functionality.

---

*Last updated: [Current Date]*
*Version: 2.0.0*
