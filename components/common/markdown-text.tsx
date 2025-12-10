'use client';

import { CodeXml, LinkIcon } from 'lucide-react';
import Link from 'next/link';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';

import { CopyClipboard } from './copy-clipboard';

type MarkdownTextProps = {
  className?: string;
  text?: string | null;
};

export const MarkdownText = ({ className, text }: MarkdownTextProps) => {
  const outputText = text?.replace(/\((\[[^\]]+\]\(https?:\/\/[^\)]+\))\)/g, '$1');

  return (
    <div
      className={cn(
        'text-sm prose prose-sm !max-w-none dark:prose-invert prose-a:text-accent-primary prose-a:no-underline hover:prose-a:underline prose-pre:bg-transparent',
        className,
      )}
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');

            return !inline && match ? (
              <div className="flex flex-col">
                <div className="bg-muted h-10 text-muted-foreground  flex items-center justify-between py-2 px-3 rounded-sm">
                  <div className="flex items-center gap-x-2">
                    <CodeXml className="w-4 h-4" />
                    <span className="text-sm font-semibold">{match[1]}</span>
                  </div>
                  <CopyClipboard textToCopy={children} />
                </div>
                <SyntaxHighlighter
                  {...props}
                  PreTag="div"
                  language={match[1]}
                  style={atomDark}
                  wrapLongLines
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code {...props} className={className || ''}>
                {children}
              </code>
            );
          },
          a: ({ children, href }) => {
            return (
              <Link href={href} target="_blank" title={children}>
                <div className="text-xs py-0.5 px-2 rounded-full inline-flex justify-center items-center gap-x-1 text-muted-foreground font-light bg-muted">
                  <LinkIcon className="h-3 w-3" />
                </div>
              </Link>
            );
          },
        }}
      >
        {outputText}
      </Markdown>
    </div>
  );
};
