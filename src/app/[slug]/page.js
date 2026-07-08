import { redirect } from 'next/navigation';
import { getProjectBySlug } from '@/data/projects';

export async function generateMetadata({ params }) {
  const project = getProjectBySlug(params.slug);
  if (!project) return { title: 'Not Found' };

  return {
    title: `${project.title} — About Me`,
    description: project.body.split('\n')[0],
    openGraph: {
      title: project.title,
      description: project.body.split('\n')[0],
      images: [{ url: project.art, width: 800, height: 600 }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.body.split('\n')[0],
      images: [project.art],
    },
  };
}

export function generateStaticParams() {
  return [
    { slug: 'saelit' },
    { slug: 'kaplan' },
    { slug: 'aarete' },
    { slug: 'tomea' },
    { slug: 'marlts' },
  ];
}

export default function ProjectPage() {
  redirect('/');
}
