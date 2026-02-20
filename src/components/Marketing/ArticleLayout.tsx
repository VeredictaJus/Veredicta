import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, ArrowLeft } from 'lucide-react';
import { PUBLIC_PAGE_CLASS } from '@/styles/publicPage';

type Props = {
  categoryLabel: string;
  viewsLabel: string;
  readingTimeLabel: string;
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  children: React.ReactNode;
};

export default function ArticleLayout({
  categoryLabel,
  viewsLabel,
  readingTimeLabel,
  title,
  subtitle,
  backTo = '/central-ajuda',
  backLabel = 'Voltar para Central de Ajuda',
  children,
}: Props) {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${PUBLIC_PAGE_CLASS}`}>
      <section className="border-b border-white/10 bg-slate-900/30">
        <div className="container mx-auto px-4 py-10 max-w-screen-2xl">
          <Button
            variant="ghost"
            onClick={() => navigate(backTo)}
            className="mb-6 text-slate-300 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backLabel}
          </Button>

          <div className="flex items-center gap-4 mb-5 flex-wrap">
            <Badge className="bg-orange-500/15 text-orange-200 border border-orange-500/30">
              {categoryLabel}
            </Badge>
            <div className="flex items-center text-slate-300 text-sm">
              <Eye className="w-4 h-4 mr-1" />
              {viewsLabel}
            </div>
            <div className="flex items-center text-slate-300 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {readingTimeLabel}
            </div>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-white mb-2">{title}</h1>
          {subtitle ? <p className="text-lg text-slate-300 max-w-3xl">{subtitle}</p> : null}
        </div>
      </section>

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

