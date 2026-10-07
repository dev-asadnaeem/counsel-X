const cron = require('node-cron');
const CounselingSession = require('../model/counselingSession');
const Notification = require('../model/Notification');
const User = require('../model/User');
const moment = require('moment');

exports.initCronJobs = (io) => {
  console.log("Initializing Cron Jobs for Notifications...");

  // Helper function to create and emit notification
  const createNotification = async (recipientId, message, type, sessionId) => {
    try {
      const notification = await Notification.create({
        recipient: recipientId,
        message,
        type,
        relatedSession: sessionId
      });
      io.to(`user_${recipientId.toString()}`).emit('newNotification', notification);
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  const notifyAdmins = async (message, type, sessionId) => {
    try {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
         const adminNotif = await Notification.create({
            recipient: admin._id,
            message: `[Admin Alert] ${message}`,
            type: 'system_update',
            relatedSession: sessionId
         });
         io.to(`user_${admin._id.toString()}`).emit('newNotification', adminNotif);
      }
    } catch (error) {
      console.error("Error notifying admins:", error);
    }
  };

  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = moment().utc();
      const oneMinuteFromNow = moment(now).add(1, 'minutes');
      const tenMinutesFromNow = moment(now).add(10, 'minutes');

      // 1. 10 minutes before start
      const sessions10Min = await CounselingSession.find({
        startDate: {
          $gte: moment(tenMinutesFromNow).startOf('minute').toDate(),
          $lt: moment(tenMinutesFromNow).endOf('minute').toDate(),
        }
      });

      for (const session of sessions10Min) {
        const msg = `Reminder: A counseling session will start in 10 minutes.`;
        await createNotification(session.studentId, msg, 'meeting_reminder', session._id);
        await createNotification(session.counselorId, msg, 'meeting_reminder', session._id);
        await notifyAdmins(msg, 'meeting_reminder', session._id);
      }

      // 2. Just before start (1 min)
      const sessions1Min = await CounselingSession.find({
        startDate: {
          $gte: moment(oneMinuteFromNow).startOf('minute').toDate(),
          $lt: moment(oneMinuteFromNow).endOf('minute').toDate(),
        }
      });

      for (const session of sessions1Min) {
        const msg = `A counseling session is starting now!`;
        await createNotification(session.studentId, msg, 'meeting_start', session._id);
        await createNotification(session.counselorId, msg, 'meeting_start', session._id);
        await notifyAdmins(msg, 'meeting_start', session._id);
      }

      // 3. Nearing end time (2 mins before)
      const sessionsNearingEnd = await CounselingSession.find({
        endDate: {
          $gte: moment(now).add(2, 'minutes').startOf('minute').toDate(),
          $lt: moment(now).add(2, 'minutes').endOf('minute').toDate(),
        }
      });

      for (const session of sessionsNearingEnd) {
        const msg = `Notice: A counseling session will end in 2 minutes.`;
        await createNotification(session.studentId, msg, 'meeting_nearing_end', session._id);
        await createNotification(session.counselorId, msg, 'meeting_nearing_end', session._id);
        await notifyAdmins(msg, 'meeting_nearing_end', session._id);
      }

      // 4. At end time
      const sessionsEnded = await CounselingSession.find({
        endDate: {
          $gte: moment(now).startOf('minute').toDate(),
          $lt: moment(now).endOf('minute').toDate(),
        }
      });

      for (const session of sessionsEnded) {
        const msg = `A counseling session has ended.`;
        await createNotification(session.studentId, msg, 'meeting_end', session._id);
        await createNotification(session.counselorId, msg, 'meeting_end', session._id);
        await notifyAdmins(msg, 'meeting_end', session._id);
      }

    } catch (error) {
      console.error("Cron job error:", error);
    }
  });
};
