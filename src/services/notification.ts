// 通知服务
export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.init();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async init() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    this.permission = Notification.permission;
    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    this.permission = await Notification.requestPermission();
    return this.permission === 'granted';
  }

  public async scheduleNotification(title: string, options: NotificationOptions = {}) {
    if (!('Notification' in window) || this.permission !== 'granted') {
      return;
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });

    return notification;
  }

  public async scheduleReflectionReminder(question: string, frequency: 'daily' | 'weekly' | 'custom') {
    const title = '反思提醒';
    const body = `是时候思考这个问题了：${question}`;

    // 根据频率设置提醒
    switch (frequency) {
      case 'daily':
        // 每天提醒
        this.scheduleNotification(title, { body });
        break;
      case 'weekly':
        // 每周提醒
        this.scheduleNotification(title, { body });
        break;
      case 'custom':
        // 自定义提醒逻辑可以在这里实现
        break;
    }
  }
} 