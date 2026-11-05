-- Remove legacy MOV- prefix from order codes
UPDATE "Order"
SET "code" = REPLACE("code", 'MOV-', '')
WHERE "code" LIKE 'MOV-%';
