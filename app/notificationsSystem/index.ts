/*  TODO

1. notify one student
2. system works wrong with time setting like 20:00 - 2:00
3. edit notifications if users settings changes
4. user timezone
5. limits: https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this

*/

import * as nodeSchedule from 'node-schedule';

import NotificationsBot from './bot';
import { ILogger } from '../logger';
import { INotification, MentorsNotificationsType, StudentsNotificationsType } from '../models/notification';
import { INotificationsSetting, ITime } from '../models/notificationsSetting';
import { notificationService, notificationsSettingService } from '../services/';

let logger: ILogger;

let bot: NotificationsBot;

export interface INotificaionData {
    dateTime?: number;
    eventId: string;
    eventType: MentorsNotificationsType | StudentsNotificationsType;
    message: string;
    role: string;
}

const getScheduledCallback = (id: string, telegramId: number, message: string) => async () => {
    bot.send(telegramId, message);
    await notificationService.removeById(id);
};

const schedule = (notification: INotification) => {
    nodeSchedule.scheduleJob(
        notification.id,
        new Date(notification.dateTime),
        getScheduledCallback(notification.id, notification.telegramId, notification.message),
    );
};

const isDateTimeInInterval = (dateTime: Date, timeFrom: ITime, timeTo: ITime): boolean => {
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();

    if (hours >= timeFrom.hours && hours <= timeTo.hours) {
        return true;
    } else if (hours === timeFrom.hours && minutes >= timeFrom.minutes) {
        return true;
    } else if (hours === timeTo.hours && minutes <= timeTo.minutes) {
        return true;
    }

    return false;
};

export const notify = async (data: INotificaionData[], courseId: string) => {
    const currentDate = new Date();
    const notificationsSettings = await notificationsSettingService.findByCoureId(courseId, { isEnable: true });

    await notificationsSettings.forEach(async (setting: INotificationsSetting) => {
        const { timeFrom, timeTo, telegramId } = setting;
        const isCurrentTimeInSettingTime = isDateTimeInInterval(currentDate, timeFrom, timeTo);
        const filtered = data.filter((item: INotificaionData) => {
            const isCorrectRole = typeof setting.user === 'object' && item.role === setting.user.role;
            const isDataNotInThePast = !item.dateTime || item.dateTime >= currentDate.valueOf();
            const isTypeInSettings =
                setting.events[0] === 'all' || setting.events.some((event: string) => event === item.eventType);

            return isDataNotInThePast && isCorrectRole && isTypeInSettings;
        });

        await filtered.forEach(async (item: INotificaionData) => {
            const { eventId, eventType, message } = item;

            if (item.dateTime) {
                const dateTime = new Date(item.dateTime);
                const isEventTimeInSettingTime = isDateTimeInInterval(dateTime, timeFrom, timeTo);

                if (!isEventTimeInSettingTime) {
                    return;
                }

                const notification = await notificationService.save({
                    dateTime,
                    eventId,
                    eventType,
                    message,
                    telegramId,
                });

                schedule(notification);
            } else if (isCurrentTimeInSettingTime) {
                bot.send(setting.telegramId, message);
            } else {
                const dateTime = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    currentDate.getDate() + (currentDate.getHours() < timeFrom.hours ? 0 : 1),
                    timeFrom.hours,
                    timeFrom.minutes,
                );

                const notification = await notificationService.save({
                    dateTime,
                    eventId,
                    eventType,
                    message,
                    telegramId,
                });
                schedule(notification);
            }
        });
    });
};

export const update = async (data: INotificaionData[], courseId: string) => {
    await data.forEach(async ({ eventType, eventId }: INotificaionData) => {
        await remove(eventType, eventId);
    });
    await notify(data, courseId);
};

export const remove = async (eventType: MentorsNotificationsType | StudentsNotificationsType, eventId: string) => {
    const removedIds = await notificationService.removeByEvent(eventType, eventId);
    removedIds.forEach((item: string) => {
        if (nodeSchedule.scheduledJobs[item]) {
            nodeSchedule.scheduledJobs[item].cancel();
        }
    });
};

const scheduleAll = async () => {
    const notifications = await notificationService.find();
    notifications.forEach(schedule);
};

export const start = async (notificationsLogger: ILogger) => {
    logger = notificationsLogger;

    bot = new NotificationsBot(logger);
    bot.start();
    logger.info('Notifications sheduling');
    await scheduleAll();
    logger.info('Notifications scheduled');
};
