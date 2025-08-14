# ICP Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "ICP Profile",
  "description": "Skeema ideaalisen asiakasprofiilin (ICP) tallentamiseen ja generointiin.",
  "type": "object",
  "properties": {
    "meta": {
      "type": "object",
      "properties": {
        "generated_at": {
          "type": "string",
          "format": "date-time"
        },
        "source_company": {
          "type": "string"
        },
        "source_links": {
          "type": "object",
          "properties": {
            "website": {
              "type": "string"
            },
            "linkedin": {
              "type": "string"
            }
          },
          "additionalProperties": false
        }
      },
      "required": [
        "generated_at",
        "source_company"
      ]
    },
    "icp_id": {
      "type": "string",
      "description": "Yksilöllinen ICP-tunniste"
    },
    "icp_name": {
      "type": "string",
      "description": "Lyhyt nimi, esim. 'Nordic Mid-Market SaaS IT Lead'"
    },
    "business_model": {
      "type": "string",
      "enum": [
        "B2B",
        "B2C",
        "B2B2C"
      ]
    },
    "segments": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Segmenttitunnisteet (esim. 'SaaS', 'Healthcare', 'Nordics', 'SMB')."
    },
    "fit_definition": {
      "type": "object",
      "properties": {
        "company_attributes": {
          "type": "object",
          "properties": {
            "industries": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "company_sizes": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "geographies": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "tech_stack_hints": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "regulatory_context": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          }
        },
        "buyer_personas": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "role": {
                "type": "string"
              },
              "seniority": {
                "type": "string"
              },
              "dept": {
                "type": "string"
              },
              "decision_power": {
                "type": "string",
                "enum": [
                  "user",
                  "influencer",
                  "gatekeeper",
                  "economic buyer",
                  "decision maker"
                ]
              }
            },
            "required": [
              "role"
            ]
          }
        },
        "consumer_persona": {
          "type": "object",
          "properties": {
            "demographics": {
              "type": "object"
            },
            "psychographics": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "lifestyle": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          }
        }
      }
    },
    "needs_pain_goals": {
      "type": "object",
      "properties": {
        "pains": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "jobs_to_be_done": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "desired_outcomes": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    },
    "buying_triggers": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "common_objections": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "value_prop_alignment": {
      "type": "object",
      "properties": {
        "value_prop": {
          "type": "string"
        },
        "unique_features": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "competitive_advantages": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    },
    "offerings_pricing": {
      "type": "object",
      "properties": {
        "main_offerings": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "pricing_model": {
          "type": "string"
        },
        "packaging_notes": {
          "type": "string"
        }
      }
    },
    "go_to_market": {
      "type": "object",
      "properties": {
        "primary_channels": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "messages": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "content_ideas": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    },
    "fit_scoring": {
      "type": "object",
      "properties": {
        "score": {
          "type": "number"
        },
        "score_breakdown": {
          "type": "object"
        }
      }
    },
    "abm_tier": {
      "type": "string",
      "enum": [
        "Tier 1",
        "Tier 2",
        "Tier 3",
        "N/A"
      ]
    }
  },
  "required": [
    "icp_id",
    "icp_name",
    "business_model"
  ]
}
```
