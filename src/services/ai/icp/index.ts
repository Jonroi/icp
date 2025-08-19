// Export all ICP modules
export * from './templates';
export * from './rules/business-model';
export * from './generator/template-selector';
export * from './generator/icp-builder';

// Main ICP Generator class
import type { ICP } from '@/services/ai/core/types';
import { determineBusinessModel } from '@/services/ai/icp/rules/business-model';
import { TemplateSelector } from '@/services/ai/icp/generator/template-selector';
import { ICPBuilder } from '@/services/ai/icp/generator/icp-builder';

export class ICPGenerator {
  private templateSelector: TemplateSelector;
  private icpBuilder: ICPBuilder;

  constructor() {
    this.templateSelector = new TemplateSelector();
    this.icpBuilder = new ICPBuilder();
  }

  /**
   * Generate comprehensive ICP profiles using company data
   */
  async generateICPs(companyData: any): Promise<ICP[]> {
    console.log('🎯 Starting comprehensive ICP generation...');
    console.log('🎯 Company data received:', {
      name: companyData.name,
      industry: companyData.industry,
      targetMarket: companyData.targetMarket,
      valueProposition: companyData.valueProposition,
    });

    try {
      // Step 1: Determine business model
      const businessModel = determineBusinessModel(companyData);
      console.log(`📊 Business Model: ${businessModel}`);

      // Step 2: Select best-fitting ICP templates
      const selectedTemplates =
        await this.templateSelector.selectBestFittingTemplates(
          companyData,
          businessModel,
        );
      console.log(`🎯 Selected ${selectedTemplates.length} ICP templates`);

      // Step 3: Generate ICP profiles for selected templates
      const icps: ICP[] = [];
      for (const template of selectedTemplates) {
        const icp = await this.icpBuilder.generateICPFromTemplate(
          companyData,
          template,
          businessModel,
        );
        icps.push(icp);
      }

      console.log(`✅ Generated ${icps.length} ICP profiles`);
      return icps;
    } catch (error) {
      console.error('❌ ICP generation failed:', error);
      throw error;
    }
  }
}
