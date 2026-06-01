import { BookOpen, CheckCircle2, Clock3, GraduationCap, PlayCircle, TerminalSquare } from "lucide-react";
import { pythonBasicsTrack } from "../../data/tutorials";
import { Section } from "../ui/Section";

const levelTone = {
  Beginner: "border-lime/30 bg-lime/10 text-lime",
  Practice: "border-blue/30 bg-blue/10 text-blue",
  Project: "border-[#ff4fc3]/30 bg-[#ff4fc3]/10 text-[#ff8bd6]",
};

export function LearnWithMe() {
  const featured = pythonBasicsTrack.lessons[0];

  return (
    <Section
      id="learn-page"
      label="course vlog"
      title="Learn With Me"
      copy="A magazine-style learning page for Python basics: part course, part build log, part study vlog."
    >
      <div className="overflow-hidden rounded-2xl border border-line/10 bg-[#070907]/95 shadow-soft">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="relative min-h-[34rem] border-b border-line/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(190,222,74,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,79,195,0.07)_1px,transparent_1px)] [background-size:36px_36px]" />
            <div className="relative">
              <div className="mb-8 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 border border-[#ff4fc3]/40 px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-[#ff8bd6]">
                  <GraduationCap className="h-4 w-4" />
                  {pythonBasicsTrack.subtitle}
                </span>
                <span className="border border-line/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-dim">Python 101</span>
              </div>

              <h3 className="max-w-2xl font-serif text-5xl italic leading-none text-ink sm:text-7xl">{pythonBasicsTrack.title}</h3>
              <p className="mt-6 max-w-xl text-base leading-8 text-muted">{pythonBasicsTrack.description}</p>

              <div className="mt-10 overflow-hidden rounded-xl border border-line/10 bg-black/60">
                <div className="flex items-center justify-between border-b border-line/10 px-4 py-3">
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-lime">
                    <PlayCircle className="h-4 w-4" />
                    featured lesson
                  </div>
                  <span className="font-mono text-xs text-dim">{featured.duration}</span>
                </div>
                <div className="grid gap-5 p-5 md:grid-cols-[0.8fr_1.2fr]">
                  <div>
                    <div className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#ff8bd6]">{featured.eyebrow}</div>
                    <h4 className="mt-2 text-2xl font-semibold text-ink">{featured.title}</h4>
                    <p className="mt-3 text-sm leading-7 text-muted">{featured.summary}</p>
                  </div>
                  <pre className="overflow-x-auto rounded-lg border border-line/10 bg-[#050805] p-4 font-mono text-xs leading-6 text-[#cad6aa]">
                    {featured.code.join("\n")}
                  </pre>
                </div>
              </div>
            </div>
          </article>

          <aside className="p-6 sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-lime">
                <BookOpen className="h-4 w-4" />
                syllabus
              </h4>
              <span className="font-mono text-xs text-dim">{pythonBasicsTrack.lessons.length} lessons</span>
            </div>

            <div className="space-y-4">
              {pythonBasicsTrack.lessons.map((lesson, index) => (
                <article key={lesson.id} className="group rounded-xl border border-line/10 bg-panel/70 p-4 transition hover:-translate-y-1 hover:border-[#ff4fc3]/40">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-dim">
                        {String(index + 1).padStart(2, "0")} / {lesson.eyebrow}
                      </div>
                      <h5 className="mt-2 text-lg font-semibold text-ink">{lesson.title}</h5>
                    </div>
                    <span className={`shrink-0 border px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] ${levelTone[lesson.level]}`}>
                      {lesson.level}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-muted">{lesson.summary}</p>
                  <div className="mt-4 flex items-center gap-4 font-mono text-xs text-dim">
                    <span className="flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {lesson.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <TerminalSquare className="h-3.5 w-3.5" />
                      notebook + CLI
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {lesson.outcomes.slice(0, 4).map((outcome) => (
                      <div key={outcome} className="flex items-center gap-2 text-xs text-muted">
                        <CheckCircle2 className="h-3.5 w-3.5 text-lime" />
                        {outcome}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </Section>
  );
}
