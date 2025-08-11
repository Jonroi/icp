import { type CustomerReview } from './types';

export interface ReviewAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  painPoints: string[];
  keyInsights: string[];
  customerSegments: string[];
  rating: number;
  emotions: string[];
  topics: string[];
}

export interface BatchReviewAnalysis {
  totalReviews: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  averageRating: number;
  topPainPoints: Array<{ point: string; frequency: number }>;
  topInsights: Array<{ insight: string; impact: number }>;
  customerSegments: Array<{ segment: string; count: number }>;
  commonTopics: Array<{ topic: string; frequency: number }>;
  emotionalTrends: Array<{ emotion: string; frequency: number }>;
  recommendations: string[];
  // Enhanced demographics from reviewer data
  demographics?: {
    genderDistribution: { male: number; female: number; unknown: number };
    experienceLevels: Array<{
      level: string;
      count: number;
      percentage: number;
    }>;
    localGuideDistribution: {
      guides: number;
      regular: number;
      percentage: number;
    };
    activityPatterns: Array<{ pattern: string; count: number }>;
  };
}

export class ReviewAnalyzer {
  private static readonly SENTIMENT_KEYWORDS = {
    positive: [
      'excellent',
      'amazing',
      'wonderful',
      'fantastic',
      'perfect',
      'love',
      'awesome',
      'outstanding',
      'superb',
      'great',
      'good',
      'nice',
      'helpful',
      'friendly',
      'professional',
      'fast',
      'quick',
      'efficient',
      'reliable',
      'trustworthy',
      'satisfied',
      'happy',
      'pleased',
      'impressed',
      'recommend',
      'exceeded',
      'quality',
      'value',
      'worth',
      'benefit',
      'advantage',
      'pro',
      'expert',
    ],
    negative: [
      'terrible',
      'awful',
      'horrible',
      'bad',
      'poor',
      'worst',
      'hate',
      'disappointing',
      'frustrating',
      'annoying',
      'useless',
      'waste',
      'money',
      'expensive',
      'overpriced',
      'cheap',
      'low quality',
      'broken',
      "doesn't work",
      'failed',
      'error',
      'bug',
      'problem',
      'issue',
      'difficult',
      'hard',
      'slow',
      'delay',
      'late',
      'rude',
      'unhelpful',
      'unprofessional',
      'disappointed',
      'regret',
      'avoid',
      'never again',
    ],
  };

  private static readonly PAIN_POINT_PATTERNS = [
    'customer service',
    'support',
    'wait time',
    'response time',
    'communication',
    'pricing',
    'cost',
    'expensive',
    'overpriced',
    'hidden fees',
    'billing',
    'quality',
    'reliability',
    'durability',
    'performance',
    'functionality',
    'usability',
    'interface',
    'user experience',
    'learning curve',
    'complexity',
    'delivery',
    'shipping',
    'timeline',
    'deadline',
    'availability',
    'stock',
    'refund',
    'return',
    'warranty',
    'guarantee',
    'maintenance',
    'updates',
  ];

  private static readonly CUSTOMER_SEGMENTS = {
    'price-conscious': [
      'expensive',
      'cost',
      'price',
      'cheap',
      'affordable',
      'budget',
    ],
    'quality-focused': [
      'quality',
      'durability',
      'reliability',
      'performance',
      'excellent',
    ],
    'service-oriented': [
      'customer service',
      'support',
      'helpful',
      'friendly',
      'professional',
    ],
    'convenience-seekers': [
      'fast',
      'quick',
      'easy',
      'convenient',
      'simple',
      'efficient',
    ],
    'tech-savvy': [
      'interface',
      'app',
      'digital',
      'online',
      'mobile',
      'technology',
    ],
    traditional: ['personal', 'human', 'face-to-face', 'local', 'traditional'],
  };

  private static readonly EMOTION_KEYWORDS = {
    frustrated: ['frustrating', 'annoying', 'irritating', 'mad', 'angry'],
    disappointed: ['disappointing', 'let down', 'expectations', 'hope'],
    satisfied: ['satisfied', 'happy', 'pleased', 'content', 'fulfilled'],
    excited: ['excited', 'thrilled', 'amazed', 'impressed', 'wow'],
    confused: ['confused', 'unclear', 'complicated', 'complex', 'difficult'],
    grateful: ['thankful', 'appreciate', 'grateful', 'blessed', 'fortunate'],
  };

  /**
   * Analyze a single review for sentiment, pain points, and insights
   */
  static analyzeReview(review: CustomerReview): ReviewAnalysis {
    const text = review.text.toLowerCase();
    const words = text.split(/\s+/);

    // Sentiment analysis
    const positiveScore = this.calculateKeywordScore(
      text,
      this.SENTIMENT_KEYWORDS.positive,
    );
    const negativeScore = this.calculateKeywordScore(
      text,
      this.SENTIMENT_KEYWORDS.negative,
    );
    const sentiment = this.determineSentiment(positiveScore, negativeScore);
    const confidence =
      Math.abs(positiveScore - negativeScore) /
      Math.max(positiveScore, negativeScore, 1);

    // Pain point extraction
    const painPoints = this.extractPainPoints(text);

    // Key insights extraction
    const keyInsights = this.extractKeyInsights(review);

    // Customer segment identification
    const customerSegments = this.identifyCustomerSegments(text);

    // Emotion detection
    const emotions = this.detectEmotions(text);

    // Topic extraction
    const topics = this.extractTopics(text);

    return {
      sentiment,
      confidence: Math.min(confidence, 1),
      painPoints,
      keyInsights,
      customerSegments,
      rating: review.rating || 0,
      emotions,
      topics,
    };
  }

  /**
   * Analyze a batch of reviews for comprehensive insights
   */
  static analyzeBatch(reviews: CustomerReview[]): BatchReviewAnalysis {
    const analyses = reviews.map((review) => this.analyzeReview(review));

    // Sentiment distribution
    const sentimentDistribution = {
      positive: analyses.filter((a) => a.sentiment === 'positive').length,
      negative: analyses.filter((a) => a.sentiment === 'negative').length,
      neutral: analyses.filter((a) => a.sentiment === 'neutral').length,
    };

    // Average rating
    const ratings = analyses.filter((a) => a.rating > 0).map((a) => a.rating);
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

    // Top pain points
    const painPointCounts = new Map<string, number>();
    analyses.forEach((analysis) => {
      analysis.painPoints.forEach((point) => {
        painPointCounts.set(point, (painPointCounts.get(point) || 0) + 1);
      });
    });
    const topPainPoints = Array.from(painPointCounts.entries())
      .map(([point, frequency]) => ({ point, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    // Top insights
    const insightCounts = new Map<string, number>();
    analyses.forEach((analysis) => {
      analysis.keyInsights.forEach((insight) => {
        insightCounts.set(insight, (insightCounts.get(insight) || 0) + 1);
      });
    });
    const topInsights = Array.from(insightCounts.entries())
      .map(([insight, frequency]) => ({ insight, impact: frequency }))
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 10);

    // Customer segments
    const segmentCounts = new Map<string, number>();
    analyses.forEach((analysis) => {
      analysis.customerSegments.forEach((segment) => {
        segmentCounts.set(segment, (segmentCounts.get(segment) || 0) + 1);
      });
    });
    const customerSegments = Array.from(segmentCounts.entries())
      .map(([segment, count]) => ({ segment, count }))
      .sort((a, b) => b.count - a.count);

    // Common topics
    const topicCounts = new Map<string, number>();
    analyses.forEach((analysis) => {
      analysis.topics.forEach((topic) => {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
      });
    });
    const commonTopics = Array.from(topicCounts.entries())
      .map(([topic, frequency]) => ({ topic, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    // Emotional trends
    const emotionCounts = new Map<string, number>();
    analyses.forEach((analysis) => {
      analysis.emotions.forEach((emotion) => {
        emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);
      });
    });
    const emotionalTrends = Array.from(emotionCounts.entries())
      .map(([emotion, frequency]) => ({ emotion, frequency }))
      .sort((a, b) => b.frequency - a.frequency);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      analyses,
      sentimentDistribution,
      topPainPoints,
    );

    // Enhanced demographics analysis (if reviewer data is available)
    const demographics = this.analyzeEnhancedDemographics(reviews);

    return {
      totalReviews: reviews.length,
      sentimentDistribution,
      averageRating,
      topPainPoints,
      topInsights,
      customerSegments,
      commonTopics,
      emotionalTrends,
      recommendations,
      demographics,
    };
  }

  /**
   * Extract ICP-relevant insights from reviews
   */
  static extractICPInsights(reviews: CustomerReview[]): {
    demographics: string[];
    psychographics: string[];
    painPoints: string[];
    goals: string[];
    preferredChannels: string[];
    purchasingBehavior: string[];
  } {
    const batchAnalysis = this.analyzeBatch(reviews);

    return {
      demographics: this.extractDemographics(reviews),
      psychographics: this.extractPsychographics(batchAnalysis),
      painPoints: batchAnalysis.topPainPoints.map((p) => p.point),
      goals: this.extractGoals(reviews),
      preferredChannels: this.extractPreferredChannels(reviews),
      purchasingBehavior: this.extractPurchasingBehavior(reviews),
    };
  }

  private static calculateKeywordScore(
    text: string,
    keywords: string[],
  ): number {
    return keywords.reduce((score, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      return score + (matches ? matches.length : 0);
    }, 0);
  }

  private static determineSentiment(
    positiveScore: number,
    negativeScore: number,
  ): 'positive' | 'negative' | 'neutral' {
    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }

  private static extractPainPoints(text: string): string[] {
    return this.PAIN_POINT_PATTERNS.filter((pattern) =>
      text.includes(pattern.toLowerCase()),
    );
  }

  private static extractKeyInsights(review: CustomerReview): string[] {
    const insights: string[] = [];
    const sentences = review.text
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 20);

    sentences.forEach((sentence) => {
      const sentenceLower = sentence.toLowerCase();
      const hasPositive = this.SENTIMENT_KEYWORDS.positive.some((k) =>
        sentenceLower.includes(k),
      );
      const hasNegative = this.SENTIMENT_KEYWORDS.negative.some((k) =>
        sentenceLower.includes(k),
      );
      const hasPainPoint = this.PAIN_POINT_PATTERNS.some((p) =>
        sentenceLower.includes(p),
      );

      if (
        (hasPositive || hasNegative || hasPainPoint) &&
        sentence.trim().length > 30
      ) {
        insights.push(sentence.trim());
      }
    });

    return insights.slice(0, 3); // Limit to top 3 insights per review
  }

  private static identifyCustomerSegments(text: string): string[] {
    const segments: string[] = [];

    Object.entries(this.CUSTOMER_SEGMENTS).forEach(([segment, keywords]) => {
      if (keywords.some((keyword) => text.includes(keyword))) {
        segments.push(segment);
      }
    });

    return segments;
  }

  private static detectEmotions(text: string): string[] {
    const emotions: string[] = [];

    Object.entries(this.EMOTION_KEYWORDS).forEach(([emotion, keywords]) => {
      if (keywords.some((keyword) => text.includes(keyword))) {
        emotions.push(emotion);
      }
    });

    return emotions;
  }

  private static extractTopics(text: string): string[] {
    const topics: string[] = [];
    const topicKeywords = [
      'price',
      'quality',
      'service',
      'delivery',
      'support',
      'product',
      'experience',
      'time',
      'money',
      'value',
      'features',
      'design',
      'technology',
      'app',
      'website',
      'customer',
      'staff',
      'location',
    ];

    topicKeywords.forEach((topic) => {
      if (text.includes(topic)) {
        topics.push(topic);
      }
    });

    return topics;
  }

  private static generateRecommendations(
    analyses: ReviewAnalysis[],
    sentimentDistribution: {
      positive: number;
      negative: number;
      neutral: number;
    },
    topPainPoints: Array<{ point: string; frequency: number }>,
  ): string[] {
    const recommendations: string[] = [];
    const totalReviews = analyses.length;

    // Sentiment-based recommendations
    const negativePercentage =
      (sentimentDistribution.negative / totalReviews) * 100;
    if (negativePercentage > 30) {
      recommendations.push(
        'Address customer service issues - high negative sentiment detected',
      );
    }

    // Pain point-based recommendations
    topPainPoints.slice(0, 3).forEach(({ point, frequency }) => {
      if (frequency > totalReviews * 0.1) {
        // More than 10% of reviews mention this
        recommendations.push(
          `Focus on improving ${point} - mentioned in ${frequency} reviews`,
        );
      }
    });

    // Rating-based recommendations
    const lowRatedReviews = analyses.filter((a) => a.rating < 3).length;
    if (lowRatedReviews > totalReviews * 0.2) {
      recommendations.push(
        'Implement quality improvement initiatives - 20%+ reviews rated below 3 stars',
      );
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  private static extractDemographics(reviews: CustomerReview[]): string[] {
    // This would typically require more sophisticated NLP
    // For now, return basic insights based on review content
    const demographics: string[] = [];
    const allText = reviews.map((r) => r.text.toLowerCase()).join(' ');

    if (allText.includes('family') || allText.includes('children')) {
      demographics.push('Families with children');
    }
    if (allText.includes('business') || allText.includes('professional')) {
      demographics.push('Business professionals');
    }
    if (allText.includes('student') || allText.includes('college')) {
      demographics.push('Students');
    }
    if (allText.includes('senior') || allText.includes('elderly')) {
      demographics.push('Seniors');
    }

    return demographics;
  }

  private static extractPsychographics(
    batchAnalysis: BatchReviewAnalysis,
  ): string[] {
    const psychographics: string[] = [];

    batchAnalysis.customerSegments.forEach(({ segment }) => {
      switch (segment) {
        case 'price-conscious':
          psychographics.push('Value-oriented consumers');
          break;
        case 'quality-focused':
          psychographics.push('Quality-conscious buyers');
          break;
        case 'service-oriented':
          psychographics.push('Customer service focused');
          break;
        case 'convenience-seekers':
          psychographics.push('Convenience-driven customers');
          break;
        case 'tech-savvy':
          psychographics.push('Technology adopters');
          break;
      }
    });

    return psychographics;
  }

  private static extractGoals(reviews: CustomerReview[]): string[] {
    const goals: string[] = [];
    const allText = reviews.map((r) => r.text.toLowerCase()).join(' ');

    if (allText.includes('save time') || allText.includes('efficient')) {
      goals.push('Save time and increase efficiency');
    }
    if (allText.includes('save money') || allText.includes('cost-effective')) {
      goals.push('Save money and reduce costs');
    }
    if (allText.includes('quality') || allText.includes('reliable')) {
      goals.push('Get high-quality, reliable products/services');
    }
    if (allText.includes('convenient') || allText.includes('easy')) {
      goals.push('Convenient and easy experience');
    }

    return goals;
  }

  private static extractPreferredChannels(reviews: CustomerReview[]): string[] {
    const channels: string[] = [];
    const allText = reviews.map((r) => r.text.toLowerCase()).join(' ');

    if (
      allText.includes('online') ||
      allText.includes('website') ||
      allText.includes('app')
    ) {
      channels.push('Online/Digital channels');
    }
    if (allText.includes('phone') || allText.includes('call')) {
      channels.push('Phone support');
    }
    if (allText.includes('email')) {
      channels.push('Email communication');
    }
    if (
      allText.includes('in-person') ||
      allText.includes('store') ||
      allText.includes('location')
    ) {
      channels.push('In-person/Physical locations');
    }

    return channels;
  }

  private static extractPurchasingBehavior(
    reviews: CustomerReview[],
  ): string[] {
    const behaviors: string[] = [];
    const allText = reviews.map((r) => r.text.toLowerCase()).join(' ');

    if (allText.includes('research') || allText.includes('compare')) {
      behaviors.push('Research and compare before buying');
    }
    if (allText.includes('recommendation') || allText.includes('referral')) {
      behaviors.push('Influenced by recommendations');
    }
    if (allText.includes('impulse') || allText.includes('spontaneous')) {
      behaviors.push('Impulse buyers');
    }
    if (allText.includes('loyal') || allText.includes('repeat')) {
      behaviors.push('Loyal, repeat customers');
    }

    return behaviors;
  }

  /**
   * Analyze enhanced demographics from reviewer data
   */
  static analyzeEnhancedDemographics(reviews: CustomerReview[]): {
    genderDistribution: { male: number; female: number; unknown: number };
    experienceLevels: Array<{
      level: string;
      count: number;
      percentage: number;
    }>;
    localGuideDistribution: {
      guides: number;
      regular: number;
      percentage: number;
    };
    activityPatterns: Array<{ pattern: string; count: number }>;
  } {
    const totalReviews = reviews.length;
    const reviewsWithData = reviews.filter((r) => r.reviewer);

    // Gender analysis from names
    const genderDistribution = { male: 0, female: 0, unknown: 0 };

    // Finnish name patterns for gender detection
    const femaleNames = [
      'maria',
      'anna',
      'liisa',
      'sanna',
      'elina',
      'tarja',
      'päivi',
      'tuula',
      'kaisa',
      'tiina',
    ];
    const maleNames = [
      'jukka',
      'mikael',
      'petri',
      'kari',
      'timo',
      'matti',
      'pekka',
      'juha',
      'antti',
      'ville',
    ];

    reviewsWithData.forEach((review) => {
      if (review.reviewer?.name) {
        const name = review.reviewer.name.toLowerCase();
        const isFemaleName = femaleNames.some((fn) => name.includes(fn));
        const isMaleName = maleNames.some((mn) => name.includes(mn));

        if (isFemaleName && !isMaleName) {
          genderDistribution.female++;
        } else if (isMaleName && !isFemaleName) {
          genderDistribution.male++;
        } else {
          genderDistribution.unknown++;
        }
      } else {
        genderDistribution.unknown++;
      }
    });

    // Experience levels based on review count
    const experienceLevels = [
      { level: 'New Reviewer (1-5 reviews)', count: 0, percentage: 0 },
      { level: 'Regular Reviewer (6-20 reviews)', count: 0, percentage: 0 },
      { level: 'Active Reviewer (21-50 reviews)', count: 0, percentage: 0 },
      { level: 'Super Reviewer (51+ reviews)', count: 0, percentage: 0 },
    ];

    reviewsWithData.forEach((review) => {
      const reviewCount = review.reviewer?.numberOfReviews || 0;
      if (reviewCount <= 5) {
        experienceLevels[0].count++;
      } else if (reviewCount <= 20) {
        experienceLevels[1].count++;
      } else if (reviewCount <= 50) {
        experienceLevels[2].count++;
      } else {
        experienceLevels[3].count++;
      }
    });

    // Calculate percentages
    experienceLevels.forEach((level) => {
      level.percentage =
        totalReviews > 0 ? (level.count / totalReviews) * 100 : 0;
    });

    // Local Guide analysis
    const localGuides = reviewsWithData.filter(
      (r) => r.reviewer?.isLocalGuide,
    ).length;
    const regularUsers = reviewsWithData.length - localGuides;
    const localGuideDistribution = {
      guides: localGuides,
      regular: regularUsers,
      percentage: totalReviews > 0 ? (localGuides / totalReviews) * 100 : 0,
    };

    // Activity patterns
    const activityPatterns = [
      { pattern: 'High Activity (Local Guides)', count: localGuides },
      { pattern: 'Medium Activity (Regular reviewers)', count: regularUsers },
      {
        pattern: 'Has Profile Pictures',
        count: reviewsWithData.filter((r) => r.reviewer?.profilePicture).length,
      },
      {
        pattern: 'Includes Photos in Reviews',
        count: reviews.filter((r) => r.images && r.images.length > 0).length,
      },
    ];

    return {
      genderDistribution,
      experienceLevels,
      localGuideDistribution,
      activityPatterns,
    };
  }
}
