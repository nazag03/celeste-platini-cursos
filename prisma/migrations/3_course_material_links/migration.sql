-- Un curso puede tener varios links de material (PDF, video, carpeta...).
ALTER TABLE "Course" ADD COLUMN "materialLinks" JSONB NOT NULL DEFAULT '[]';

-- El link de Drive que ya estaba cargado pasa a ser el primero de la lista.
UPDATE "Course"
SET "materialLinks" = jsonb_build_array(jsonb_build_object('label', '', 'url', "driveUrl"))
WHERE "driveUrl" IS NOT NULL AND "driveUrl" <> '';

-- "driveUrl" queda sin usar (no se borra para que la versión anterior del
-- sitio siga andando mientras se publica esta).
