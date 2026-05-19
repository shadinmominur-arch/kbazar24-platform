import Link from 'next/link';

export interface EducationSection {
  heading: string;
  body: string;
}

export interface EducationFaq {
  q: string;
  a: string;
}

export interface EducationContentEntry {
  slug: string;
  name: string;
  intro: string;
  sections: EducationSection[];
  faq: EducationFaq[];
}

const linkPattern = /\[\[LINK:([^|]+)\|([^\]]+)\]\]/g;

function renderLinkedText(text: string) {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(text)) !== null) {
    const [placeholder, href, label] = match;
    const index = match.index;

    if (index > lastIndex) {
      nodes.push(text.slice(lastIndex, index));
    }

    nodes.push(
      <Link key={`${href}-${index}`} href={href} className="font-semibold text-accent hover:underline">
        {label}
      </Link>,
    );

    lastIndex = index + placeholder.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export default function EducationContent({ content }: { content: EducationContentEntry }) {
  return (
    <article className="mb-10 border-y border-hairline bg-white py-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-base leading-8 text-muted">{renderLinkedText(content.intro)}</p>

        <div className="mt-8 space-y-7">
          {content.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-bold text-ink">{section.heading}</h2>
              <p className="mt-3 text-sm leading-7 text-muted sm:text-base sm:leading-8">
                {renderLinkedText(section.body)}
              </p>
            </section>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">Frequently Asked Questions</h2>
          <div className="mt-4 divide-y divide-hairline border-y border-hairline">
            {content.faq.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink marker:hidden">
                  <span>{item.q}</span>
                  <span className="text-lg leading-none text-accent transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-7 text-muted">{renderLinkedText(item.a)}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
