-- CreateTable
CREATE TABLE "DocumentRequestTemplate" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "entityType" "ClientEntityType",
    "vatStatus" "ClientVatStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentRequestTemplate_pkey" PRIMARY KEY ("id")
);

-- Seed default onboarding checklist templates
INSERT INTO "DocumentRequestTemplate" ("id", "label", "entityType", "vatStatus") VALUES
  ('drt_gov_id', 'Valid government ID', NULL, NULL),
  ('drt_bir_cor', 'BIR Certificate of Registration (Form 2303)', NULL, NULL),
  ('drt_proof_address', 'Proof of business address', NULL, NULL),
  ('drt_dti', 'DTI Certificate of Registration', 'SOLE_PROP', NULL),
  ('drt_sec', 'SEC Certificate of Incorporation', 'CORP', NULL),
  ('drt_articles', 'Articles of Incorporation and By-laws', 'CORP', NULL),
  ('drt_vat_cert', 'BIR VAT Registration confirmation', NULL, 'VAT'),
  ('drt_percentage_tax', 'Latest percentage tax return (if any)', NULL, 'NON_VAT');
