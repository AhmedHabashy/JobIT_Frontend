import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

/**
 * Renders assistant text as Markdown so bold/italics, lists, links, code and
 * tables show formatted instead of raw (**stars**, `backticks`, etc.). Elements
 * are mapped to the app's design tokens rather than relying on a prose plugin.
 * GFM (remark-gfm) adds tables, strikethrough and autolinks.
 */
const components: Components = {
  p: ({ children }) => <p className="mb-sm last:mb-0 leading-relaxed">{children}</p>,
  strong: ({ children }) => <strong className="font-bold text-on-surface">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:text-primary-hover break-words"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="mb-sm last:mb-0 ps-lg list-disc space-y-xs">{children}</ul>,
  ol: ({ children }) => (
    <ol className="mb-sm last:mb-0 ps-lg list-decimal space-y-xs">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => (
    <h1 className="font-title-sm text-title-sm font-bold mt-sm mb-xs first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-title-sm text-title-sm font-bold mt-sm mb-xs first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-body-md text-body-md font-bold mt-sm mb-xs first:mt-0">{children}</h3>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-s-2 border-outline-variant ps-sm my-sm text-on-surface-variant italic">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    // Fenced blocks carry a language- class; inline code has none.
    const isBlock = Boolean(className);
    if (isBlock) {
      return (
        <code className={`${className ?? ""} font-mono text-[0.85em]`}>{children}</code>
      );
    }
    return (
      <code className="rounded bg-surface-container-high px-1 py-[1px] font-mono text-[0.88em]">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-sm overflow-x-auto rounded-lg bg-surface-container-high p-sm text-body-sm">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-md border-outline-variant" />,
  table: ({ children }) => (
    <div className="my-sm overflow-x-auto">
      <table className="w-full border-collapse text-body-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-outline-variant bg-surface-container-high px-sm py-xs text-start font-bold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-outline-variant px-sm py-xs">{children}</td>
  ),
};

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
}
