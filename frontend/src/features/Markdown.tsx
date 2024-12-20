import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";

export default function Markdown({ message }: { message: string }) {
    const renderers = {
        p: (props: any) => {
            return (
                <p className="prose text-primary-foreground w-full max-w-full text-sm">
                    {props.children}
                </p>
            );
        },
        ul: ({ children }: any) => (
            <ul className="prose text-primary-foreground w-full max-w-full text-sm">
                {children}
            </ul>
        ),
        ol: ({ children }: any) => (
            <ol className="prose text-primary-foreground w-full max-w-full text-sm">
                {children}
            </ol>
        ),
        li: ({ children }: any) => (
            <li className="prose text-primary-foreground w-full max-w-full text-sm">
                {children}
            </li>
        ),
        h1: ({ children }: any) => (
            <h1 className="prose text-primary-foreground w-full max-w-full">
                {children}
            </h1>
        ),
        h2: ({ children }: any) => (
            <h2 className="prose text-primary-foreground w-full max-w-full">
                {children}
            </h2>
        ),
        h3: ({ children }: any) => (
            <h3 className="prose text-primary-foreground w-full max-w-full">
                {children}
            </h3>
        ),
        h4: ({ children }: any) => (
            <h4 className="prose text-primary-foreground w-full max-w-full">
                {children}
            </h4>
        ),
        h5: ({ children }: any) => (
            <h5 className="prose text-primary-foreground w-full max-w-full">
                {children}
            </h5>
        ),
        h6: ({ children }: any) => (
            <h6 className="prose text-primary-foreground w-full max-w-full">
                {children}
            </h6>
        ),
        a: ({
            href,
            children,
        }: {
            href?: string;
            children: React.ReactNode;
        }) => (
            <a href={href} target="_blank">
                {children}
            </a>
        ),
        blockquote: ({ children }: any) => (
            <blockquote className="prose text-primary-foreground w-full max-w-full">
                {children}
            </blockquote>
        ),
        em: ({ children }: any) => (
            <i className="prose text-primary-foreground w-full max-w-full text-sm">
                {children}
            </i>
        ),
        strong: ({ node, ...rest }: any) => (
            <strong
                className="prose text-primary-foreground w-full max-w-full text-sm"
                {...rest}
            />
        ),
        hr: () => (
            <hr className="prose text-primary-foreground w-full max-w-full" />
        ),
        br: () => <br />,
        table: ({ children }: any) => (
            <table className="prose text-primary-foreground w-full max-w-full">
                {children}
            </table>
        ),
        tr: ({ children }: any) => (
            <tr className="prose text-primary-foreground text-sm">
                {children}
            </tr>
        ),
        td: ({ children }: any) => (
            <td className="prose text-primary-foreground text-sm">
                {children}
            </td>
        ),
        th: ({ children }: any) => (
            <th className="prose text-primary-foreground text-sm">
                {children}
            </th>
        ),
        pre: ({ children }: any) => (
            <pre className="prose text-primary-foreground text-sm">
                {children}
            </pre>
        ),
    };

    return (
        <ReactMarkdown
            components={renderers}
            remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
            rehypePlugins={[rehypeRaw as any, rehypeKatex as any]}
            className="prose w-full max-w-full"
        >
            {message}
        </ReactMarkdown>
    );
}
