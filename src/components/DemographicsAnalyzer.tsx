import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Users, MapPin, Calendar, Download } from 'lucide-react';
import type { GoogleReview } from '@/services/google-reviews';

interface DemographicsAnalyzerProps {
  reviews: GoogleReview[];
  onAnalysisComplete: (analysis: unknown) => void;
}

interface DemographicData {
  ageDistribution: { age: string; count: number }[];
  genderDistribution: { gender: string; count: number }[];
  locationDistribution: { location: string; count: number }[];
  sentimentDistribution: { sentiment: string; count: number }[];
  averageRating: number;
  totalReviews: number;
  topKeywords: { word: string; count: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function DemographicsAnalyzer({
  reviews,
  onAnalysisComplete,
}: DemographicsAnalyzerProps) {
  const [analysis, setAnalysis] = useState<DemographicData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (reviews.length > 0) {
      analyzeDemographics();
    }
  }, [reviews, analyzeDemographics]);

  const analyzeDemographics = useCallback(async () => {
    setIsAnalyzing(true);

    // Simuloidaan demografian analyysi
    const mockAnalysis: DemographicData = {
      ageDistribution: [
        { age: '18-25', count: 15 },
        { age: '26-35', count: 28 },
        { age: '36-45', count: 22 },
        { age: '46-55', count: 12 },
        { age: '55+', count: 8 },
      ],
      genderDistribution: [
        { gender: 'Naiset', count: 58 },
        { gender: 'Miehet', count: 42 },
      ],
      locationDistribution: [
        { location: 'Helsinki', count: 35 },
        { location: 'Espoo', count: 18 },
        { location: 'Vantaa', count: 12 },
        { location: 'Tampere', count: 15 },
        { location: 'Turku', count: 10 },
        { location: 'Muut', count: 10 },
      ],
      sentimentDistribution: [
        { sentiment: 'Positiivinen', count: 65 },
        { sentiment: 'Neutraali', count: 20 },
        { sentiment: 'Negatiivinen', count: 15 },
      ],
      averageRating: 4.2,
      totalReviews: reviews.length,
      topKeywords: [
        { word: 'hyvä', count: 23 },
        { word: 'palvelu', count: 18 },
        { word: 'laadukas', count: 15 },
        { word: 'nopea', count: 12 },
        { word: 'suosittelen', count: 10 },
      ],
    };

    setAnalysis(mockAnalysis);
    onAnalysisComplete(mockAnalysis);
    setIsAnalyzing(false);
  }, [reviews, onAnalysisComplete]);

  const exportAnalysis = () => {
    if (!analysis) return;

    const dataStr = JSON.stringify(analysis, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'demographics-analysis.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Demographics Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            {isAnalyzing ? (
              <div className='space-y-2'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
                <p className='text-muted-foreground'>
                  Analyzing demographics...
                </p>
              </div>
            ) : (
              <p className='text-muted-foreground'>No reviews to analyze</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              Demographics Analysis
            </div>
            <Button variant='outline' size='sm' onClick={exportAnalysis}>
              <Download className='h-4 w-4 mr-2' />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Summary Stats */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <Card className='p-4'>
              <div className='flex items-center gap-2'>
                <Users className='h-4 w-4 text-blue-500' />
                <div>
                  <p className='text-sm text-muted-foreground'>Total Reviews</p>
                  <p className='text-2xl font-bold'>{analysis.totalReviews}</p>
                </div>
              </div>
            </Card>
            <Card className='p-4'>
              <div className='flex items-center gap-2'>
                <TrendingUp className='h-4 w-4 text-green-500' />
                <div>
                  <p className='text-sm text-muted-foreground'>Avg Rating</p>
                  <p className='text-2xl font-bold'>
                    {analysis.averageRating.toFixed(1)}
                  </p>
                </div>
              </div>
            </Card>
            <Card className='p-4'>
              <div className='flex items-center gap-2'>
                <MapPin className='h-4 w-4 text-purple-500' />
                <div>
                  <p className='text-sm text-muted-foreground'>Top Location</p>
                  <p className='text-lg font-bold'>Helsinki</p>
                </div>
              </div>
            </Card>
            <Card className='p-4'>
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4 text-orange-500' />
                <div>
                  <p className='text-sm text-muted-foreground'>Avg Age</p>
                  <p className='text-lg font-bold'>32v</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Age Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Age Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={200}>
                  <BarChart data={analysis.ageDistribution}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='age' />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey='count' fill='#8884d8' />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gender Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={200}>
                  <PieChart>
                    <Pie
                      data={analysis.genderDistribution}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ gender, percent }) =>
                        `${gender} ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='count'>
                      {analysis.genderDistribution.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Location Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Location Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={200}>
                  <BarChart data={analysis.locationDistribution}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='location' />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey='count' fill='#82ca9d' />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sentiment Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Sentiment Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={200}>
                  <PieChart>
                    <Pie
                      data={analysis.sentimentDistribution}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ sentiment, percent }) =>
                        `${sentiment} ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='count'>
                      {analysis.sentimentDistribution.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Top Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-wrap gap-2'>
                {analysis.topKeywords.map((keyword) => (
                  <Badge key={keyword.word} variant='secondary'>
                    {keyword.word} ({keyword.count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
