# ICP Rules & Mappings

## Core ICP Characteristics

### B2B ICP Characteristics

- **Industry**: The specific industry or niche your ideal customer operates in
- **Company Size**: Number of employees, annual revenue, or other relevant size metrics
- **Location/Geography**: Where your ideal customer is based
- **Budget/Spending Power**: Their ability and willingness to spend on your product or service
- **Pain Points/Challenges**: Specific problems your product or service solves
- **Goals and Objectives**: What your ideal customer is trying to achieve
- **Decision-Maker/Buyer Persona**: Identifying the key people involved in the purchase
- **Buying Process Insights**: Understanding how they typically go from problem to purchase

### B2C ICP Characteristics

- **Demographics**: Age, gender, education level, marital status
- **Income Range**: Economic status and purchasing power
- **Buying Behavior**: Loyalty, product usage frequency, and shopping preferences
- **Geographic Location**: Their location and how it might influence their choices

### Other Considerations

- **Company Culture and Values**: Does their culture align with your brand?
- **Technology Stack**: What tools are they already using?
- **Growth Stage**: Are they a startup, a scaling company, or established?
- **Customer Lifetime Value**: Consider the long-term value of these customers

## How to Use Your ICP

### Targeting

Focus your marketing and sales efforts on prospects that match your ICP

### Personalization

Tailor your messaging and content to resonate with their specific needs and pain points

### Lead Qualification/Disqualification

Use the ICP to identify leads that are a good fit and those that are not

### Content Creation

Develop content that addresses their specific challenges and goals

### Reporting

Track your results and see how well your marketing and sales efforts are performing with your ideal customers

## Data Mapping Rules

```json
{
  "mapping": {
    "Company Name": "meta.source_company",
    "Website URL": "meta.source_links.website",
    "LinkedIn": "meta.source_links.linkedin",
    "Location": "fit_definition.company_attributes.geographies",
    "Global": "fit_definition.company_attributes.geographies",
    "Industry/Sector": "fit_definition.company_attributes.industries",
    "Company Size": "fit_definition.company_attributes.company_sizes",
    "Target Market": "segments",
    "Value Proposition": "value_prop_alignment.value_prop",
    "Main Offerings": "offerings_pricing.main_offerings",
    "Pricing Model": "offerings_pricing.pricing_model",
    "Unique Features/Advantages": "value_prop_alignment.unique_features",
    "Market Segment": "segments",
    "Competitive Advantages": "value_prop_alignment.competitive_advantages",
    "Current Customer Base": "fit_definition.company_attributes.industries",
    "Success Stories/Testimonials": "go_to_market.content_ideas",
    "Pain Points Solved": "needs_pain_goals.pains",
    "Customer Goals": "needs_pain_goals.desired_outcomes",
    "Current Marketing Channels": "go_to_market.primary_channels",
    "Marketing Messaging": "go_to_market.messages"
  },
  "derivations": {
    "business_model": {
      "logic": "If Target Market contains organizations/professional titles -> B2B. If contains consumer groups -> B2C. If both -> B2B2C.",
      "examples": [
        {
          "target_market": "Small businesses in Finland",
          "business_model": "B2B"
        },
        {
          "target_market": "Healthcare professionals",
          "business_model": "B2B"
        },
        {
          "target_market": "Consumers in Nordics",
          "business_model": "B2C"
        },
        {
          "target_market": "Retailers and their end-customers",
          "business_model": "B2B2C"
        }
      ]
    },
    "segments_normalization": [
      "Split Target Market and Market Segment by commas/conjunctions.",
      "Map to standard tags: geography (Nordics, EU, Global), industry (SaaS, Manufacturing, Healthcare), size (SMB, Mid-Market, Enterprise)."
    ],
    "personas": {
      "b2b_default_roles": [
        "Economic Buyer (e.g., CEO/CFO)",
        "Decision Maker (e.g., VP/Director)",
        "Influencer (e.g., Team Lead)",
        "User (daily user)",
        "Gatekeeper (IT/Legal/Procurement)"
      ],
      "b2c_default_persona_fields": [
        "Demographics (age, income level, family status)",
        "Psychographics (values, motivations)",
        "Lifestyle (hobbies, media consumption)"
      ]
    },
    "buying_triggers": [
      "New regulation or certification requirement",
      "Budget cycle start or cost pressure",
      "Technical migration/legacy system end-of-life",
      "Rapid growth or market expansion",
      "Quality/safety incident or audit"
    ],
    "common_objections": [
      "Price/ROI uncertainty",
      "Integration and implementation effort",
      "Security and compliance concerns",
      "Vendor lock-in",
      "Resource shortage for user training"
    ],
    "fit_scoring": {
      "formula": "score = 0.35*industry_fit + 0.2*size_fit + 0.15*geo_fit + 0.15*pain_alignment + 0.15*goal_alignment",
      "scales": {
        "industry_fit": "0–100 (100 = industry matches perfectly)",
        "size_fit": "0–100 (100 = company size matches perfectly)",
        "geo_fit": "0–100 (100 = geography matches perfectly)",
        "pain_alignment": "0–100 (100 = solved pains match customer pains perfectly)",
        "goal_alignment": "0–100 (100 = strongly support goals)"
      },
      "tiers": {
        "Tier 1": "score >= 80",
        "Tier 2": "60 <= score < 80",
        "Tier 3": "40 <= score < 60",
        "N/A": "< 40"
      }
    },
    "go_to_market": {
      "channel_hints": {
        "B2B": [
          "LinkedIn Ads",
          "ABM emails",
          "Webinars",
          "Partner network",
          "Trade shows"
        ],
        "B2C": [
          "Meta/TikTok Ads",
          "Influencer marketing",
          "SEO/UGC reviews",
          "Email campaigns"
        ],
        "B2B2C": [
          "Partnership and co-marketing",
          "Marketplaces",
          "User incentives"
        ]
      },
      "message_templates": [
        "Value + Result + Time: 'Reduce [cost] [X %] [Y days] without [risk]'",
        "Proof + Social proof: 'Trusted by over [N] companies in [industry]'",
        "Differentiation: 'The only solution that [unique benefit]'"
      ]
    }
  },
  "outputs": {
    "short_card": [
      "icp_name",
      "business_model",
      "segments",
      "fit_scoring.score",
      "abm_tier"
    ],
    "one_pager_sections": [
      "Fit definition",
      "Needs/Pain/Goals",
      "Buying triggers & objections",
      "Value prop & offerings",
      "GTM: channels, messages, content",
      "KPIs & next steps"
    ]
  }
}
```

## ICP Generation Guidelines

### Template Selection Criteria

1. **Industry Alignment**: How well does the template match the company's industry?
2. **Company Size Fit**: Does the template match the company's size (startup/SMB/mid-market/enterprise)?
3. **Target Market Match**: Does the template align with the company's target market?
4. **Value Proposition Alignment**: Does the template fit the company's value proposition?
5. **Business Model Compatibility**: Does the template work with the company's business model?
6. **Market Segment Relevance**: Does the template match the company's market segment?

### Content Requirements

- All content must be in English
- Generate detailed, actionable insights for marketing, sales, and product teams
- Focus on specific, measurable characteristics
- Include practical go-to-market strategies
- Provide clear value propositions and competitive advantages
