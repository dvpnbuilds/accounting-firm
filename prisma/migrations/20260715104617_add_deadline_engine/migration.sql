-- AlterTable
ALTER TABLE "Deadline" ADD COLUMN     "reminderSentAt" TIMESTAMP(3);

-- Seed PH compliance deadline templates (verified 2026-07-15, sources logged in PROGRESS.md decision log)
INSERT INTO "DeadlineTemplate" ("id", "name", "entityType", "vatStatus", "frequency", "dueRule") VALUES
  ('dlt_2551q', 'BIR 2551Q — Quarterly Percentage Tax', NULL, 'NON_VAT', 'QUARTERLY', 'QUARTERLY:MONTHS=4,7,10,1:DAY=25'),
  ('dlt_2550q', 'BIR 2550Q — Quarterly VAT Return', NULL, 'VAT', 'QUARTERLY', 'QUARTERLY:MONTHS=4,7,10,1:DAY=25'),
  ('dlt_1701q', 'BIR 1701Q — Quarterly Income Tax (Individual)', 'SOLE_PROP', NULL, 'QUARTERLY', 'QUARTERLY:MONTHS=5,8,11:DAY=15'),
  ('dlt_sss', 'SSS Contribution', NULL, NULL, 'MONTHLY', 'MONTHLY:OFFSET=1:DAY=LAST'),
  ('dlt_philhealth', 'PhilHealth Contribution', NULL, NULL, 'MONTHLY', 'MONTHLY:OFFSET=1:DAY=20'),
  ('dlt_pagibig', 'Pag-IBIG Contribution', NULL, NULL, 'MONTHLY', 'MONTHLY:OFFSET=1:DAY=10');
