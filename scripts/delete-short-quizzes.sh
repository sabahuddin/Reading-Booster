#!/bin/bash
# ============================================================
# Brisanje kvizova koji ne ispunjavaju standard minimuma pitanja
# po starosnoj skupini:
#   R1 → min 15 pitanja
#   R4 → min 25 pitanja
#   R7 → min 30 pitanja
#   O  → min 30 pitanja
#   A  → min 30 pitanja
# Pokrenuti: ./scripts/delete-short-quizzes.sh
# ============================================================

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL nije postavljen"
  exit 1
fi

echo "============================================================"
echo " PREVIEW: Kvizovi ispod standarda po starosnoj skupini"
echo "============================================================"

psql "$DATABASE_URL" -c "
SELECT
  b.age_group AS grupa,
  q.title AS naslov,
  COUNT(qu.id) AS pitanja,
  CASE b.age_group
    WHEN 'R1' THEN 15
    WHEN 'R4' THEN 25
    WHEN 'R7' THEN 30
    WHEN 'O'  THEN 30
    WHEN 'A'  THEN 30
    ELSE 30
  END AS minimum_standard
FROM quizzes q
JOIN books b ON q.book_id = b.id
LEFT JOIN questions qu ON qu.quiz_id::text = q.id::text
GROUP BY q.id, q.title, b.age_group
HAVING COUNT(qu.id) < CASE b.age_group
    WHEN 'R1' THEN 15
    WHEN 'R4' THEN 25
    WHEN 'R7' THEN 30
    WHEN 'O'  THEN 30
    WHEN 'A'  THEN 30
    ELSE 30
  END
ORDER BY b.age_group, COUNT(qu.id) ASC;
"

TOTAL=$(psql "$DATABASE_URL" -t -A -c "
  SELECT COUNT(*) FROM quizzes q
  JOIN books b ON q.book_id = b.id
  JOIN (SELECT quiz_id, COUNT(*) as cnt FROM questions GROUP BY quiz_id) qc ON qc.quiz_id = q.id::text
  WHERE qc.cnt < CASE b.age_group
      WHEN 'R1' THEN 15
      WHEN 'R4' THEN 25
      WHEN 'R7' THEN 30
      WHEN 'O'  THEN 30
      WHEN 'A'  THEN 30
      ELSE 30
    END;
")

echo ""
echo "Ukupno za brisanje: $TOTAL kvizova"
echo ""

if [ "$TOTAL" -eq 0 ]; then
  echo "Nema kvizova za brisanje. Svi kvizovi ispunjavaju standard."
  exit 0
fi

read -p "Jeste li sigurni da zelite obrisati ovih $TOTAL kvizova? (upisite 'DA'): " CONFIRM

if [ "$CONFIRM" != "DA" ]; then
  echo "Brisanje otkazano."
  exit 0
fi

echo ""
echo "Brišem kvizove..."

psql "$DATABASE_URL" << 'SQLBLOCK'
BEGIN;

-- Sakupljamo ID-ove ispod standarda
CREATE TEMP TABLE kratki_kviz_ids AS
  SELECT q.id
  FROM quizzes q
  JOIN books b ON q.book_id = b.id
  JOIN (SELECT quiz_id, COUNT(*) as cnt FROM questions GROUP BY quiz_id) qc ON qc.quiz_id = q.id::text
  WHERE qc.cnt < CASE b.age_group
      WHEN 'R1' THEN 15
      WHEN 'R4' THEN 25
      WHEN 'R7' THEN 30
      WHEN 'O'  THEN 30
      WHEN 'A'  THEN 30
      ELSE 30
    END;

-- 1. Brisanje pitanja
DELETE FROM questions WHERE quiz_id::text IN (SELECT id::text FROM kratki_kviz_ids);

-- 2. Brisanje rezultata kvizova
DELETE FROM quiz_results WHERE quiz_id::text IN (SELECT id::text FROM kratki_kviz_ids);

-- 3. Brisanje kvizova
DELETE FROM quizzes WHERE id IN (SELECT id FROM kratki_kviz_ids);

COMMIT;
SQLBLOCK

echo ""
echo "============================================================"
echo " GOTOVO! Stanje po starosnoj skupini:"
echo "============================================================"

psql "$DATABASE_URL" -c "
SELECT
  b.age_group AS grupa,
  COUNT(DISTINCT q.id) AS kvizova,
  MIN(qc.cnt) AS min_pitanja,
  MAX(qc.cnt) AS max_pitanja,
  CASE b.age_group
    WHEN 'R1' THEN 15
    WHEN 'R4' THEN 25
    WHEN 'R7' THEN 30
    WHEN 'O'  THEN 30
    WHEN 'A'  THEN 30
    ELSE 30
  END AS standard_min
FROM quizzes q
JOIN books b ON q.book_id = b.id
JOIN (SELECT quiz_id, COUNT(*) as cnt FROM questions GROUP BY quiz_id) qc ON qc.quiz_id = q.id::text
GROUP BY b.age_group
ORDER BY b.age_group;
"
