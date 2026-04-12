import cron from 'node-cron';
import { resetMonthlyBudgets } from '../services/points.service';

export function startBudgetResetCron() {
  // Runs at 00:00 on the 1st of every month
  cron.schedule('0 0 1 * *', async () => {
    try {
      const count = await resetMonthlyBudgets();
      console.info(`[budget-reset] Reset giving budgets for ${count} users`);
    } catch (err) {
      console.error('[budget-reset] Failed to reset giving budgets:', err);
    }
  });
}
