import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Building,
  Globe,
  BarChart3,
  MessageSquare,
  FileText,
  Star,
  Calendar,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import type { ICP } from '@/services/ai/types';

interface ICPDetailsModalProps {
  icp: ICP | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ICPDetailsModal({
  icp,
  isOpen,
  onClose,
}: ICPDetailsModalProps) {
  if (!icp) return null;

  const profileData = icp.profileData || icp;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-2xl'>
            <Target className='h-6 w-6 text-primary' />
            {profileData.icp_name || profileData.name || 'ICP Profile Details'}
          </DialogTitle>
          <DialogDescription>
            Comprehensive analysis of your Ideal Customer Profile
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Header Information */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg'>
            <div className='flex items-center gap-2'>
              <Building className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium'>Business Model:</span>
              <Badge variant='outline'>
                {profileData.business_model || 'N/A'}
              </Badge>
            </div>
            <div className='flex items-center gap-2'>
              <Star className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium'>ABM Tier:</span>
              <Badge variant='secondary'>{profileData.abm_tier || 'N/A'}</Badge>
            </div>
            <div className='flex items-center gap-2'>
              <BarChart3 className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium'>Fit Score:</span>
              <Badge variant='default'>{profileData.fit_score || 'N/A'}</Badge>
            </div>
          </div>

          {/* Confidence Level */}
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium'>Confidence Level:</span>
            <Badge
              variant={
                (profileData.confidence || 'medium') === 'high'
                  ? 'default'
                  : (profileData.confidence || 'medium') === 'medium'
                  ? 'secondary'
                  : 'outline'
              }>
              {profileData.confidence || 'medium'}
            </Badge>
          </div>

          <Separator />

          {/* Customer Segments */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <Users className='h-5 w-5 text-primary' />
              Customer Segments
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
              {(
                profileData.segments ||
                profileData.customer_segments ||
                []
              ).map((segment: string, index: number) => (
                <Badge key={index} variant='outline' className='justify-start'>
                  <Target className='h-3 w-3 mr-1' />
                  {segment}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Pain Points */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5 text-destructive' />
              Pain Points
            </h3>
            <div className='space-y-2'>
              {(
                profileData.needs_pain_goals?.pains ||
                profileData.pain_points ||
                []
              ).map((pain: string, index: number) => (
                <div
                  key={index}
                  className='flex items-start gap-2 p-3 bg-destructive/5 rounded-lg border border-destructive/10'>
                  <AlertTriangle className='h-4 w-4 text-destructive mt-0.5 flex-shrink-0' />
                  <span className='text-sm'>{pain}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Jobs to be Done */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <CheckCircle className='h-5 w-5 text-green-600' />
              Jobs to be Done
            </h3>
            <div className='space-y-2'>
              {(
                profileData.needs_pain_goals?.jobs_to_be_done ||
                profileData.jobs_to_be_done ||
                []
              ).map((job: string, index: number) => (
                <div
                  key={index}
                  className='flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200'>
                  <CheckCircle className='h-4 w-4 text-green-600 mt-0.5 flex-shrink-0' />
                  <span className='text-sm'>{job}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Desired Outcomes */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <TrendingUp className='h-5 w-5 text-blue-600' />
              Desired Outcomes
            </h3>
            <div className='space-y-2'>
              {(
                profileData.needs_pain_goals?.desired_outcomes ||
                profileData.desired_outcomes ||
                []
              ).map((outcome: string, index: number) => (
                <div
                  key={index}
                  className='flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200'>
                  <TrendingUp className='h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0' />
                  <span className='text-sm'>{outcome}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Buying Triggers */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <Target className='h-5 w-5 text-orange-600' />
              Buying Triggers
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
              {(profileData.buying_triggers || []).map(
                (trigger: string, index: number) => (
                  <Badge
                    key={index}
                    variant='outline'
                    className='justify-start'>
                    <Target className='h-3 w-3 mr-1' />
                    {trigger}
                  </Badge>
                ),
              )}
            </div>
          </div>

          <Separator />

          {/* Common Objections */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <XCircle className='h-5 w-5 text-red-600' />
              Common Objections
            </h3>
            <div className='space-y-2'>
              {(profileData.common_objections || []).map(
                (objection: string, index: number) => (
                  <div
                    key={index}
                    className='flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200'>
                    <XCircle className='h-4 w-4 text-red-600 mt-0.5 flex-shrink-0' />
                    <span className='text-sm'>{objection}</span>
                  </div>
                ),
              )}
            </div>
          </div>

          <Separator />

          {/* Value Proposition */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <MessageSquare className='h-5 w-5 text-purple-600' />
              Value Proposition
            </h3>
            <div className='p-4 bg-purple-50 rounded-lg border border-purple-200'>
              <p className='text-sm leading-relaxed'>
                {profileData.value_prop_alignment?.value_prop ||
                  profileData.value_proposition ||
                  'No value proposition defined'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Features */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <CheckCircle className='h-5 w-5 text-green-600' />
              Unique Features
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
              {(
                profileData.value_prop_alignment?.unique_features ||
                profileData.unique_features ||
                []
              ).map((feature: string, index: number) => (
                <Badge key={index} variant='outline' className='justify-start'>
                  <CheckCircle className='h-3 w-3 mr-1' />
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Competitive Advantages */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <Star className='h-5 w-5 text-yellow-600' />
              Competitive Advantages
            </h3>
            <div className='space-y-2'>
              {(
                profileData.value_prop_alignment?.competitive_advantages ||
                profileData.competitive_advantages ||
                []
              ).map((advantage: string, index: number) => (
                <div
                  key={index}
                  className='flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200'>
                  <Star className='h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0' />
                  <span className='text-sm'>{advantage}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Go-to-Market Strategy */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <TrendingUp className='h-5 w-5 text-blue-600' />
              Go-to-Market Strategy
            </h3>

            {/* Channels */}
            <div className='space-y-2'>
              <h4 className='font-medium text-sm text-muted-foreground'>
                Primary Channels:
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                {(
                  profileData.go_to_market?.primary_channels ||
                  profileData.primary_channels ||
                  []
                ).map((channel: string, index: number) => (
                  <Badge
                    key={index}
                    variant='outline'
                    className='justify-start'>
                    <ExternalLink className='h-3 w-3 mr-1' />
                    {channel}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className='space-y-2'>
              <h4 className='font-medium text-sm text-muted-foreground'>
                Key Messages:
              </h4>
              <div className='space-y-2'>
                {(
                  profileData.go_to_market?.messages ||
                  profileData.messages ||
                  []
                ).map((message: string, index: number) => (
                  <div
                    key={index}
                    className='flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200'>
                    <MessageSquare className='h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0' />
                    <span className='text-sm'>{message}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Ideas */}
            <div className='space-y-2'>
              <h4 className='font-medium text-sm text-muted-foreground'>
                Content Ideas:
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                {(
                  profileData.go_to_market?.content_ideas ||
                  profileData.content_ideas ||
                  []
                ).map((content: string, index: number) => (
                  <Badge
                    key={index}
                    variant='outline'
                    className='justify-start'>
                    <FileText className='h-3 w-3 mr-1' />
                    {content}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Fit Definition */}
          {profileData.fit_definition && (
            <>
              <div className='space-y-3'>
                <h3 className='text-lg font-semibold flex items-center gap-2'>
                  <BarChart3 className='h-5 w-5 text-indigo-600' />
                  Fit Definition
                </h3>

                {/* Company Attributes */}
                <div className='space-y-2'>
                  <h4 className='font-medium text-sm text-muted-foreground'>
                    Company Attributes:
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <span className='text-xs font-medium text-muted-foreground'>
                        Industries:
                      </span>
                      <div className='flex flex-wrap gap-1 mt-1'>
                        {profileData.fit_definition.company_attributes?.industries?.map(
                          (industry: string, index: number) => (
                            <Badge
                              key={index}
                              variant='outline'
                              className='text-xs'>
                              {industry}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                    <div>
                      <span className='text-xs font-medium text-muted-foreground'>
                        Company Sizes:
                      </span>
                      <div className='flex flex-wrap gap-1 mt-1'>
                        {profileData.fit_definition.company_attributes?.company_sizes?.map(
                          (size: string, index: number) => (
                            <Badge
                              key={index}
                              variant='outline'
                              className='text-xs'>
                              {size}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buyer Personas */}
                <div className='space-y-2'>
                  <h4 className='font-medium text-sm text-muted-foreground'>
                    Buyer Personas:
                  </h4>
                  <div className='space-y-2'>
                    {profileData.fit_definition.buyer_personas?.map(
                      (persona: any, index: number) => (
                        <div
                          key={index}
                          className='p-3 bg-indigo-50 rounded-lg border border-indigo-200'>
                          <div className='grid grid-cols-2 md:grid-cols-4 gap-2 text-xs'>
                            <div>
                              <span className='font-medium'>Role:</span>{' '}
                              {persona.role}
                            </div>
                            <div>
                              <span className='font-medium'>Seniority:</span>{' '}
                              {persona.seniority}
                            </div>
                            <div>
                              <span className='font-medium'>Department:</span>{' '}
                              {persona.dept}
                            </div>
                            <div>
                              <span className='font-medium'>
                                Decision Power:
                              </span>{' '}
                              {persona.decision_power}
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Fit Scoring */}
          {profileData.fit_scoring && (
            <div className='space-y-3'>
              <h3 className='text-lg font-semibold flex items-center gap-2'>
                <BarChart3 className='h-5 w-5 text-green-600' />
                Fit Scoring
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='p-4 bg-green-50 rounded-lg border border-green-200'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-green-600'>
                      {profileData.fit_scoring.score || 'N/A'}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      Overall Score
                    </div>
                  </div>
                </div>
                <div className='space-y-2'>
                  {profileData.fit_scoring.score_breakdown &&
                    Object.entries(profileData.fit_scoring.score_breakdown).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className='flex justify-between items-center'>
                          <span className='text-sm capitalize'>
                            {key.replace('_', ' ')}:
                          </span>
                          <Badge variant='outline'>{value}</Badge>
                        </div>
                      ),
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Meta Information */}
          {profileData.meta && (
            <>
              <Separator />
              <div className='space-y-3'>
                <h3 className='text-lg font-semibold flex items-center gap-2'>
                  <Calendar className='h-5 w-5 text-gray-600' />
                  Meta Information
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                  <div>
                    <span className='font-medium'>Generated:</span>{' '}
                    {profileData.meta.generated_at
                      ? new Date(profileData.meta.generated_at).toLocaleString()
                      : 'N/A'}
                  </div>
                  <div>
                    <span className='font-medium'>Source Company:</span>{' '}
                    {profileData.meta.source_company || 'N/A'}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className='flex justify-end pt-4'>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
