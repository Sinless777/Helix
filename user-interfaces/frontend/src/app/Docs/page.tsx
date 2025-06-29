// src/app/Docs/page.tsx (Client Component)
'use client';
import DocsContent from './docs.mdx';
import DocsLayout from "@/components/Docs/wrapper";


export default function DocsPage() { 
    return (
        <DocsLayout>
            <DocsContent />
        </DocsLayout>   
    )
}
