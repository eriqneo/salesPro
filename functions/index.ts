import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

/**
 * Every evening at 7 PM EAT: check which agents haven't submitted reports
 * Send push notification reminder
 */
export const dailyReportReminder = functions.pubsub
  .schedule('0 19 * * *')
  .timeZone('Africa/Nairobi')
  .onRun(async (context) => {
    const db = admin.firestore();
    const today = new Date().toISOString().split('T')[0];
    
    // Get all agents
    const agentsSnapshot = await db.collection('users').where('role', '==', 'agent').get();
    
    // Get today's reports
    const reportsSnapshot = await db.collection('daily_reports').where('date', '==', today).get();
    const submittedAgentIds = new Set(reportsSnapshot.docs.map(doc => doc.data().agentId));
    
    const reminders: Promise<any>[] = [];
    
    agentsSnapshot.forEach(agentDoc => {
      const agent = agentDoc.data();
      if (!submittedAgentIds.has(agentDoc.id)) {
        // Send push notification
        const message = {
          notification: {
            title: 'Report Reminder',
            body: `Hi ${agent.name}, you haven't submitted your daily report yet. Please do so before 8 PM.`,
          },
          token: agent.fcmToken, // Assuming we store FCM token in user profile
        };
        
        if (agent.fcmToken) {
          reminders.push(admin.messaging().send(message));
        }
      }
    });
    
    await Promise.all(reminders);
    console.log(`Sent ${reminders.length} reminders`);
    return null;
  });

/**
 * Every Monday: email admin a weekly summary PDF
 */
export const weeklyAdminSummary = functions.pubsub
  .schedule('0 8 * * 1')
  .timeZone('Africa/Nairobi')
  .onRun(async (context) => {
    // In a real implementation, this would:
    // 1. Query last week's sales and reports
    // 2. Generate a PDF using a library like pdfkit
    // 3. Send email via SendGrid or Firebase Extensions
    console.log('Generating weekly summary PDF...');
    return null;
  });

/**
 * Monthly: auto-generate agent performance report
 */
export const monthlyPerformanceReport = functions.pubsub
  .schedule('0 0 1 * *')
  .timeZone('Africa/Nairobi')
  .onRun(async (context) => {
    console.log('Generating monthly performance reports...');
    return null;
  });
