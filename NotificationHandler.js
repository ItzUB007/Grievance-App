import PushNotification from 'react-native-push-notification';

class NotificationHandler {
  onNotification(notification) {
    console.log('Notification received: ', notification);
  }

  onRegister(token) {
    console.log('Token: ', token);
  }

  onAction(notification) {
    console.log('Action: ', notification.action);
  }

  onRegistrationError(err) {
    console.error('Registration Error: ', err.message, err);
  }
}

const handler = new NotificationHandler();

PushNotification.configure({
  onRegister: handler.onRegister,
  onNotification: handler.onNotification,
  onAction: handler.onAction,
  onRegistrationError: handler.onRegistrationError,

  // Android only
  senderID: 'YOUR_SENDER_ID',
  popInitialNotification: true,
  requestPermissions: true,
});

export default handler;
