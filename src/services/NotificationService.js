import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

class NotificationService {
  constructor() {
    this.configure();
    this.createChannel();
  }

  configure() {
    PushNotification.configure({
      onNotification: function (notification) {
        console.log('NOTIFICATION RECEIVED:', notification);
        // Call finish if required (especially on iOS)
        notification.finish && notification.finish();
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });
  }

  createChannel() {
    PushNotification.createChannel(
      {
        channelId: 'daily-greetings',
        channelName: 'Daily Greetings',
        importance: 3,
      },
      created => {
        if (created) {
          console.log(`Channel 'daily-greetings' created successfully`);
        } else {
          console.log(`Channel 'daily-greetings' already exists`);
        }
      },
    );
  }

  scheduleDailyGreetings() {
    const greetings = [
      { message: 'Good Morning!' },
      { message: 'Good Afternoon!' },
      { message: 'Good Evening!' },
      { message: 'Good Night!' },
    ];

    greetings.forEach((greet, index) => {
      // Schedule each greeting at minute intervals with a delay for clarity
      const date = new Date(Date.now() + index * 60 * 1000); // start immediately, then +1min, +2min etc.
      PushNotification.localNotificationSchedule({
        channelId: 'daily-greetings',
        message: greet.message,
        date,
        allowWhileIdle: true,
        repeatType: 'minute',
        repeatTime: 1,
        // Add an id here for easier debugging
        id: `greet-${index}`,
      });
      console.log(
        `Scheduled notification: "${
          greet.message
        }" at ${date.toLocaleTimeString()}`,
      );
    });
  }

  getNextTriggerDate(hour, minute) {
    const now = new Date();
    let trigger = new Date();
    trigger.setHours(hour);
    trigger.setMinutes(minute);
    trigger.setSeconds(0);

    if (trigger <= now) trigger.setDate(trigger.getDate() + 1);

    return trigger;
  }
}

export default new NotificationService();
