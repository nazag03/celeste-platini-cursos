-- Un curso puede tener varias fotos de portada (van pasando solas en la web).
ALTER TABLE "Course" ADD COLUMN "coverImages" JSONB NOT NULL DEFAULT '[]';

-- La portada que ya estaba cargada pasa a ser la primera de la lista.
UPDATE "Course"
SET "coverImages" = jsonb_build_array("coverImageUrl")
WHERE "coverImageUrl" IS NOT NULL AND "coverImageUrl" <> '';

-- "coverImageUrl" se sigue guardando con la primera foto (la principal).
