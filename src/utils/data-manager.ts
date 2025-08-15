import { companyDataService } from '@/services/company-data-service';
import type { OwnCompany } from '@/services/project-service';

export class DataManager {
  /**
   * Save current company data to file
   */
  static async saveData(): Promise<void> {
    try {
      await companyDataService.saveToFile();
      console.log('✅ Data saved successfully');
    } catch (error) {
      console.error('❌ Failed to save data:', error);
    }
  }

  /**
   * Load company data from file
   */
  static async loadData(): Promise<void> {
    try {
      await companyDataService.loadFromFile();
      console.log('✅ Data loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load data:', error);
    }
  }

  /**
   * Reset all company data
   */
  static async resetData(): Promise<void> {
    try {
      await companyDataService.resetData();
      console.log('✅ Data reset successfully');
    } catch (error) {
      console.error('❌ Failed to reset data:', error);
    }
  }

  /**
   * Get current data status
   */
  static async getStatus(): Promise<{
    progress: { filled: number; total: number; percentage: number };
    canGenerateICPs: boolean;
    nextField: string | null;
  }> {
    try {
      const progress = await companyDataService.getCompletionProgress();
      const data = await companyDataService.getCurrentData();

      return {
        progress,
        canGenerateICPs: progress.filled >= 5,
        nextField: data.nextField,
      };
    } catch (error) {
      console.error('❌ Failed to get status:', error);
      return {
        progress: { filled: 0, total: 18, percentage: 0 },
        canGenerateICPs: false,
        nextField: null,
      };
    }
  }

  /**
   * Export data for ICP generation
   */
  static async exportForICP(): Promise<OwnCompany> {
    try {
      const data = await companyDataService.exportForICP();
      console.log('✅ Data exported for ICP generation');
      return data;
    } catch (error) {
      console.error('❌ Failed to export data:', error);
      return {} as OwnCompany;
    }
  }

  /**
   * Set test data for development
   */
  static async setTestData(): Promise<void> {
    try {
      console.log(
        '⚠️ Test data functionality removed - all data now comes from server',
      );
    } catch (error) {
      console.error('❌ Failed to set test data:', error);
    }
  }

  /**
   * View current data in console
   */
  static async viewData(): Promise<void> {
    try {
      const data = await companyDataService.getCurrentData();
      const status = await this.getStatus();

      console.log('📊 Current Company Data:');
      console.log('========================');
      console.log(
        `Progress: ${status.progress.filled}/${status.progress.total} (${status.progress.percentage}%)`,
      );
      console.log(
        `Can Generate ICPs: ${status.canGenerateICPs ? 'Yes' : 'No'}`,
      );
      console.log(`Next Field: ${status.nextField || 'All complete'}`);
      console.log('\nFilled Fields:');

      for (const field of data.filledFields) {
        const value = data.currentData[field];
        console.log(`  ${field}: ${value}`);
      }

      console.log('\nEmpty Fields:');
      const emptyFields = Object.keys(data.currentData).filter(
        (key) => !data.filledFields.includes(key as keyof OwnCompany),
      );

      if (emptyFields.length > 0) {
        emptyFields.forEach((field) => console.log(`  ${field}: (empty)`));
      } else {
        console.log('  All fields are filled!');
      }
    } catch (error) {
      console.error('❌ Failed to view data:', error);
    }
  }
}
