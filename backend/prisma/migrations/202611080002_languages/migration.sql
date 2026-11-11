ALTER TABLE "User" ADD COLUMN "locale" VARCHAR(5) NOT NULL DEFAULT 'en';
ALTER TABLE "User" ADD CONSTRAINT "User_locale_check" CHECK ("locale" IN ('en','fa-AF','ps-AF'));
ALTER TABLE "Category" ADD COLUMN "nameFa" VARCHAR(80), ADD COLUMN "namePs" VARCHAR(80);
CREATE TABLE "OpportunityTranslation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "opportunityId" TEXT NOT NULL REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "locale" VARCHAR(5) NOT NULL CHECK ("locale" IN ('fa-AF','ps-AF')),
  "title" VARCHAR(200) NOT NULL,
  "organization" VARCHAR(200) NOT NULL,
  "location" VARCHAR(200) NOT NULL,
  "description" TEXT NOT NULL,
  "requirements" TEXT[] NOT NULL,
  "tags" TEXT[] NOT NULL,
  UNIQUE ("opportunityId","locale")
);
CREATE INDEX "OpportunityTranslation_locale_title_idx" ON "OpportunityTranslation"("locale","title");
