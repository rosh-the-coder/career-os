# Claim Validation V3

- Validates against `buildEvidenceCorpus(inventory)` only — **never** the generated CV markdown.
- Enforces global prohibited patterns, profile prohibitions, `EvidenceItem.prohibitedClaimsJson`, and project constraints.
- Blocks fabricated RAG / vector DB / Azure OpenAI / OCR / legal-document claims unless truly evidenced (still blocked when evidence only mentions as prohibition).
- Metrics require `approvedForCV`; `needsReview` metrics warn.
- Generation fails only on blocked claims; warnings require human review in Resume Studio.
