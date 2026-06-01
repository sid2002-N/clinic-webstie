import { Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { profile } from "../../data/profile";
import { Button } from "../ui/Button";
import { Section } from "../ui/Section";

export function Contact() {
  const [sent, setSent] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    setSent(true);
  };

  return (
    <Section id="contact" label="deploy_message" title="Get In Touch" copy="Use the form to compose a local mailto draft or reach out directly by email.">
      <div className="grid overflow-hidden rounded-xl border border-line/10 bg-panel/80 shadow-soft lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border-b border-line/10 p-8 lg:border-b-0 lg:border-r">
          <h3 className="font-display text-5xl leading-none text-ink sm:text-6xl">
            LET'S BUILD
            <br />
            <span className="font-serif italic text-lime">SOMETHING</span>
            <br />
            USEFUL.
          </h3>
          <p className="mt-6 text-sm leading-7 text-muted">{profile.bio}</p>
          <a className="mt-6 inline-block font-mono text-sm text-blue transition hover:text-ink" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </div>
        <form className="space-y-5 p-8" onSubmit={submit}>
          {[
            ["name", "Your name", "text"],
            ["email", "your@email.com", "email"],
          ].map(([name, placeholder, type]) => (
            <label key={name} className="block">
              <span className="mb-2 block font-mono text-[0.68rem] uppercase tracking-[0.16em] text-dim">--{name}</span>
              <input
                required
                name={name}
                type={type}
                placeholder={placeholder}
                className="w-full rounded-md border border-line/10 bg-canvas px-4 py-3 font-mono text-sm text-ink outline-none transition placeholder:text-dim focus:border-blue focus:ring-2 focus:ring-blue/20"
              />
            </label>
          ))}
          <label className="block">
            <span className="mb-2 block font-mono text-[0.68rem] uppercase tracking-[0.16em] text-dim">--message</span>
            <textarea
              required
              name="message"
              rows={5}
              placeholder="Tell me what you are building..."
              className="w-full resize-y rounded-md border border-line/10 bg-canvas px-4 py-3 font-mono text-sm text-ink outline-none transition placeholder:text-dim focus:border-blue focus:ring-2 focus:ring-blue/20"
            />
          </label>
          <Button type="submit" className="w-full" icon={<Send className="h-4 w-4" />}>
            {sent ? "Message Ready" : "Send"}
          </Button>
          {sent ? <p className="font-mono text-xs text-lime">Thanks. Use your mail client to send this to {profile.email}.</p> : null}
        </form>
      </div>
    </Section>
  );
}
