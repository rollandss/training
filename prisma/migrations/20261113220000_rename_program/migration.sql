-- Data-only: unify product naming ("Сотка" -> "Стоденка") for the seeded program.
UPDATE "Program" SET "name" = 'Стоденка: 100 днів (турнік)' WHERE "slug" = '100-dniv' AND "name" = 'Сотка: 100 днів (турнік)';
