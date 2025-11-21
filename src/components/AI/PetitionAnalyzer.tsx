import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { BookOpen, CheckCircle, AlertTriangle, XCircle, Spell, Scale, FileText, Loader2, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { analyzePetitionWithAI } from '@/api/analyze-petition';

interface PetitionAnalysis {
  orthography: {
    score: number;
    errors: Array<{ text: string; suggestion: string; position: number }>;
    corrections: number;
  };
  legal: {
    score: number;
    articles: Array<{ article: string; valid: boolean; suggestion?: string }>;
    adequacy: string;
    concerns: string[];
  };
  structure: {
    score: number;
    missing_elements: string[];
    suggestions: string[];
    format_score: number;
  };
  overall: {
    score: number;
    recommendation: 'approve' | 'review' | 'reject';
    summary: string;
  };
}

interface PetitionAnalyzerProps {
  petitionId: string;
  petitionText: string;
  petitionType: string;
  onApprove: (comments?: string) => void;
  onReject: (comments: string) => void;
  onRequest: (comments: string) => void;
}

export default function PetitionAnalyzer({ petitionId, petitionText, petitionType, onApprove, onReject, onRequest }: PetitionAnalyzerProps) {
  const [analysis, setAnalysis] = useState<PetitionAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState('');
  const [highlightedText, setHighlightedText] = useState('');

  useEffect(() => {
    analyze();
  }, [petitionText]);

  const analyze = async () => {
    setLoading(true);
    const result = await analyzePetitionWithAI(petitionText, petitionType);
    if (result) {
      setAnalysis(result);
      highlightErrors(result);
    }
    setLoading(false);
  };

  const highlightErrors = (analysis: PetitionAnalysis) => {
    let highlighted = petitionText;
    analysis.orthography.errors.forEach(error => {
      highlighted = highlighted.replace(error.text, `<mark class="bg-red-200 text-red-800">${error.text}</mark>`);
    });
    analysis.legal.articles.forEach(article => {
      if (!article.valid) {
        highlighted = highlighted.replace(article.article, `<mark class="bg-yellow-200 text-yellow-800">${article.article}</mark>`);
      }
    });
    setHighlightedText(highlighted);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <div className="space-y-1 text-sm text-gray-600">
            <p>🔍 Verificando ortografia</p>
            <p>⚖️ Analisando aspectos jurídicos</p>
            <p>📋 Estrutura e formatação</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span>Análise Jurídica com IA</span>
            <Badge className="bg-green-100 text-green-800">{analysis.overall.score}%</Badge>
          </CardTitle>
          <CardDescription>{analysis.overall.summary}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            {analysis.overall.recommendation === 'approve' && <CheckCircle className="h-5 w-5 text-green-600" />}
            {analysis.overall.recommendation === 'review' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
            {analysis.overall.recommendation === 'reject' && <XCircle className="h-5 w-5 text-red-600" />}
            <p>{analysis.overall.recommendation === 'approve' ? 'Aprovar' : analysis.overall.recommendation === 'review' ? 'Revisar' : 'Rejeitar'}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Spell className="h-4 w-4" /> <span>Ortografia</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-blue-600">{analysis.orthography.score}%</p>
            <Progress value={analysis.orthography.score} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Scale className="h-4 w-4" /> <span>Juridicidade</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-blue-600">{analysis.legal.score}%</p>
            <Progress value={analysis.legal.score} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <FileText className="h-4 w-4" /> <span>Estrutura</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-blue-600">{analysis.structure.score}%</p>
            <Progress value={analysis.structure.score} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Texto com Destaques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded bg-gray-50 text-sm leading-relaxed max-h-96 overflow-y-auto" dangerouslySetInnerHTML={{ __html: highlightedText }} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comentários do Revisor</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Comentários ou sugestões..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            className="mb-4"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button variant="destructive" onClick={() => onReject(comments)} className="flex items-center space-x-2">
          <ThumbsDown className="h-4 w-4" /> <span>Rejeitar</span>
        </Button>
        <Button variant="outline" onClick={() => onRequest(comments)} className="flex items-center space-x-2">
          <MessageCircle className="h-4 w-4" /> <span>Solicitar Revisão</span>
        </Button>
        <Button onClick={() => onApprove(comments)} className="flex items-center space-x-2 bg-green-600 hover:bg-green-700">
          <ThumbsUp className="h-4 w-4" /> <span>Aprovar</span>
        </Button>
      </div>
    </div>
  );
}
