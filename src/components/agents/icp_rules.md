# ICP Rules & Mappings

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
      "logic": "Jos Target Market sisältää organisaatioita/ammattinimikkeitä -> B2B. Jos sisältää kuluttajaryhmiä -> B2C. Jos molempia -> B2B2C.",
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
      "Pilkotaan Target Market ja Market Segment pilkuista/konjunktioista.",
      "Kartoitetaan standardi-tageiksi: maantiede (Nordics, EU, Global), toimiala (SaaS, Manufacturing, Healthcare), kokoluokka (SMB, Mid-Market, Enterprise)."
    ],
    "personas": {
      "b2b_default_roles": [
        "Economic Buyer (esim. CEO/CFO)",
        "Decision Maker (esim. VP/Director)",
        "Influencer (esim. Team Lead)",
        "User (päivittäinen käyttäjä)",
        "Gatekeeper (IT/Legal/Procurement)"
      ],
      "b2c_default_persona_fields": [
        "Demographics (ikä, tulotaso, perhetilanne)",
        "Psychographics (arvot, motivaatiot)",
        "Lifestyle (harrastukset, media)"
      ]
    },
    "buying_triggers": [
      "Uusi regulaatio tai sertifiointi-vaatimus",
      "Budjettikauden alku tai säästöpaineet",
      "Tekninen migraatio/vanhan järjestelmän elinkaaren päättyminen",
      "Nopea kasvu tai markkinalaajennus",
      "Laatu-/turvallisuusincidentti tai auditointi"
    ],
    "common_objections": [
      "Hinta/ROI-epävarmuus",
      "Integraatiot ja käyttöönoton vaiva",
      "Tietoturva ja vaatimustenmukaisuus",
      "Vendor lock-in",
      "Resurssipula käyttäjäkoulutukseen"
    ],
    "fit_scoring": {
      "formula": "score = 0.35*industry_fit + 0.2*size_fit + 0.15*geo_fit + 0.15*pain_alignment + 0.15*goal_alignment",
      "scales": {
        "industry_fit": "0–100 (100 = toimiala täsmää)",
        "size_fit": "0–100 (100 = kokoluokka täsmää)",
        "geo_fit": "0–100 (100 = geografia täsmää)",
        "pain_alignment": "0–100 (100 = ratkaistut kivut vastaavat asiakkaan kipuja)",
        "goal_alignment": "0–100 (100 = tuet tavoitteita vahvasti)"
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
          "ABM-emailit",
          "Webinaarit",
          "Partneriverkosto",
          "Messut"
        ],
        "B2C": [
          "Meta/TikTok Ads",
          "Influencer-markkinointi",
          "SEO/UGC-arvostelut",
          "Sähköpostikampanjat"
        ],
        "B2B2C": [
          "Kumppanuus- ja co-marketing",
          "Markkinapaikat",
          "Käyttäjäkannustimet"
        ]
      },
      "message_templates": [
        "Arvo + Tulos + Aika: 'Vähennä [kustannus] [X %] [Y päivässä] ilman [riskiä]'",
        "Todiste + Sosiaalinen näyttö: 'Luotettu yli [N] yrityksen toimesta [toimialalla]'",
        "Erotus: 'Ainoa ratkaisu, joka [uniikki hyöty]'"
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
