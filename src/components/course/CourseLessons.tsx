import { PlayCircle, FileDown } from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  videoUrl: string | null;
  materialUrl: string | null;
  durationMinutes: number | null;
};
type Module = { id: string; title: string; lessons: Lesson[] };


export function CourseLessons({ modules }: { modules: Module[] }) {
  return (
    <div className="space-y-6 max-w-2xl">
      {modules.map((module) => (
        <div key={module.id} className="rounded-xl border border-cocoa/10 overflow-hidden">
          <p className="bg-ivory/60 px-5 py-3 font-medium text-cocoa">{module.title}</p>
          <ul className="divide-y divide-cocoa/10">
            {module.lessons.map((lesson) => (
              <li key={lesson.id} className="px-5 py-4">
                <div className="flex items-center gap-3 mb-2">
                  <PlayCircle className="h-4 w-4 text-blush-deep" />
                  <span className="text-sm font-medium text-cocoa">{lesson.title}</span>
                  {lesson.durationMinutes && <span className="text-xs text-ink/40">{lesson.durationMinutes} min</span>}
                </div>
                {lesson.videoUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-ink/5 mb-2">
                    <iframe src={lesson.videoUrl} className="w-full h-full" allowFullScreen title={lesson.title} />
                  </div>
                )}
                {lesson.materialUrl && (
                  <a href={lesson.materialUrl} className="inline-flex items-center gap-1.5 text-xs text-cocoa hover:underline">
                    <FileDown className="h-3.5 w-3.5" /> Descargar material
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {modules.length === 0 && <p className="text-sm text-ink/50">Celeste todavía no cargó el contenido de este curso.</p>}
    </div>
  );
}
