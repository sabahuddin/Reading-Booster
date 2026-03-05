#!/bin/bash
# ============================================================
# Brisanje kvizova s manje od 20 pitanja
# Pokrenuti: ./scripts/delete-short-quizzes.sh
# ============================================================

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL nije postavljen"
  exit 1
fi

echo "============================================"
echo " PREVIEW: Kvizovi koji imaju < 20 pitanja "
echo "============================================"

psql "$DATABASE_URL" -c "
SELECT 
  q.title AS naslov,
  COUNT(qu.id) AS pitanja
FROM quizzes q
LEFT JOIN questions qu ON qu.quiz_id = q.id
GROUP BY q.id, q.title
HAVING COUNT(qu.id) < 20
ORDER BY COUNT(qu.id) ASC, q.title ASC;
"

TOTAL=$(psql "$DATABASE_URL" -t -A -c "
  SELECT COUNT(*) FROM quizzes q
  WHERE (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) < 20;
")

echo ""
echo "Ukupno za brisanje: $TOTAL kvizova"
echo ""

if [ "$TOTAL" -eq 0 ]; then
  echo "Nema kvizova za brisanje."
  exit 0
fi

read -p "Jeste li sigurni da zelite obrisati ovih $TOTAL kvizova? (upisite 'DA'): " CONFIRM

if [ "$CONFIRM" != "DA" ]; then
  echo "Brisanje otkazano."
  exit 0
fi

echo ""
echo "Brišem kvizove..."

# Koristimo temp tabelu da jednom identifikujemo kvizove, pa brišemo sve
psql "$DATABASE_URL" << 'SQLBLOCK'
BEGIN;

-- Privremena tabela s ID-ovima kratkih kvizova
CREATE TEMP TABLE kratki_kviz_ids AS
  SELECT q.id
  FROM quizzes q
  WHERE (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) < 20;

-- 1. Brisanje pitanja
DELETE FROM questions WHERE quiz_id IN (SELECT id FROM kratki_kviz_ids);

-- 2. Brisanje rezultata kvizova
DELETE FROM quiz_results WHERE quiz_id IN (SELECT id FROM kratki_kviz_ids);

-- 3. Brisanje kvizova
DELETE FROM quizzes WHERE id IN (SELECT id FROM kratki_kviz_ids);

COMMIT;
SQLBLOCK

echo ""
echo "============================================"
echo " GOTOVO! Provjera:"
echo "============================================"

psql "$DATABASE_URL" -c "
SELECT 
  COUNT(*) AS preostali_kvizovi,
  COALESCE(MIN(q_count), 0) AS min_pitanja,
  COALESCE(MAX(q_count), 0) AS max_pitanja,
  COALESCE(ROUND(AVG(q_count), 1), 0) AS avg_pitanja
FROM (
  SELECT COUNT(qu.id) AS q_count
  FROM quizzes q
  LEFT JOIN questions qu ON qu.quiz_id = q.id
  GROUP BY q.id
) t;
"
