import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Star,
  Download,
  RefreshCw,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { GoogleReviewsService } from '@/services/google-reviews';
import type { GooglePlaceData, GoogleReview } from '@/services/google-reviews';

interface GoogleReviewsCollectorProps {
  onReviewsCollected: (
    reviews: GoogleReview[],
    placeData: GooglePlaceData,
  ) => void;
  apiKey?: string;
}

export function GoogleReviewsCollector({
  onReviewsCollected,
  apiKey,
}: GoogleReviewsCollectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    Array<{ placeId: string; name: string; address: string }>
  >([]);
  const [selectedPlace, setSelectedPlace] = useState<GooglePlaceData | null>(
    null,
  );
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);

  const googleService = new GoogleReviewsService(apiKey || '');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const results = await googleService.searchPlaces(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceSelect = async (placeId: string) => {
    setIsCollecting(true);
    try {
      console.log('🔄 Starting review collection with deep research...');
      const placeData = await googleService.getPlaceData(placeId);
      if (placeData) {
        // Enhanced review collection with LLM deep research
        const reviewsData = await googleService.getReviews(placeId, 10);
        console.log(
          `📊 Collected ${reviewsData.length} reviews with sources:`,
          reviewsData
            .map((r) => r.source)
            .filter((v, i, a) => a.indexOf(v) === i),
        );
        setSelectedPlace(placeData);
        setReviews(reviewsData);
        onReviewsCollected(reviewsData, placeData);
      }
    } catch (error) {
      console.error('Failed to collect reviews:', error);
      alert(
        'Arvioiden hakeminen epäonnistui. Tarkista että Ollama on käynnissä.',
      );
    } finally {
      setIsCollecting(false);
    }
  };

  // Deep research function for additional reviews
  const handleDeepResearch = async () => {
    if (!selectedPlace) return;

    setIsCollecting(true);
    try {
      console.log('🔍 Starting enhanced deep research...');
      // Get additional reviews using enhanced research
      const additionalReviews = await googleService.getReviews(
        selectedPlace.placeId,
        15,
      );
      console.log(
        `🎯 Deep research found ${additionalReviews.length} total reviews`,
      );
      setReviews(additionalReviews);
      onReviewsCollected(additionalReviews, selectedPlace);
    } catch (error) {
      console.error('Deep research failed:', error);
      alert('Syvätutkimus epäonnistui. Tarkista että Ollama on käynnissä.');
    } finally {
      setIsCollecting(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Search className='h-5 w-5' />
            Google Reviews Collector
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex gap-2'>
            <div className='flex-1'>
              <Label htmlFor='search-query'>Search for business</Label>
              <Input
                id='search-query'
                placeholder="e.g., 'Restaurant Helsinki' or 'Tech Company Espoo'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}>
              {isLoading ? (
                <RefreshCw className='h-4 w-4 animate-spin' />
              ) : (
                <Search className='h-4 w-4' />
              )}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className='space-y-2'>
              <Label>Search Results</Label>
              <div className='space-y-2 max-h-60 overflow-y-auto'>
                {searchResults.map((place) => (
                  <Card
                    key={place.placeId}
                    className='p-3 cursor-pointer hover:bg-muted/50'
                    onClick={() => handlePlaceSelect(place.placeId)}>
                    <div className='flex justify-between items-start'>
                      <div>
                        <h4 className='font-medium'>{place.name}</h4>
                        <p className='text-sm text-muted-foreground'>
                          {place.address}
                        </p>
                      </div>
                      <Button variant='ghost' size='sm'>
                        <Download className='h-4 w-4' />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {selectedPlace && (
            <Card className='bg-green-50 border-green-200'>
              <CardHeader>
                <CardTitle className='text-green-800 flex items-center justify-between'>
                  <span>Selected Business</span>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleDeepResearch}
                    disabled={isCollecting}
                    className='bg-white hover:bg-gray-50'>
                    {isCollecting ? (
                      <RefreshCw className='h-4 w-4 animate-spin mr-2' />
                    ) : (
                      <Zap className='h-4 w-4 mr-2' />
                    )}
                    Deep Research
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <h4 className='font-medium'>{selectedPlace.name}</h4>
                    <div className='flex items-center gap-1'>
                      {renderStars(selectedPlace.rating)}
                      <span className='text-sm text-muted-foreground ml-1'>
                        ({selectedPlace.totalReviews} reviews)
                      </span>
                    </div>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    {selectedPlace.address}
                  </p>
                  {selectedPlace.website && (
                    <p className='text-sm text-blue-600'>
                      {selectedPlace.website}
                    </p>
                  )}
                  <div className='flex gap-2'>
                    {selectedPlace.categories.slice(0, 3).map((category) => (
                      <Badge key={category} variant='secondary'>
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {reviews.length > 0 && (
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Label>Collected Reviews ({reviews.length})</Label>
                  <TrendingUp className='h-4 w-4 text-blue-500' />
                </div>
                <div className='flex items-center gap-2'>
                  {/* Show review sources */}
                  <div className='flex gap-1'>
                    {Array.from(new Set(reviews.map((r) => r.source))).map(
                      (source) => (
                        <Badge
                          key={source}
                          variant='outline'
                          className='text-xs'>
                          {source}
                        </Badge>
                      ),
                    )}
                  </div>
                  <Badge variant='outline'>
                    {isCollecting ? 'Collecting...' : 'Ready'}
                  </Badge>
                </div>
              </div>
              <div className='space-y-3 max-h-80 overflow-y-auto'>
                {reviews.map((review) => (
                  <Card key={review.id} className='p-3'>
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium text-sm'>
                            {review.author}
                          </span>
                          <Badge variant='secondary' className='text-xs'>
                            {review.source}
                          </Badge>
                        </div>
                        <div className='flex items-center gap-1'>
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className='text-sm'>{review.text}</p>
                      <div className='flex items-center justify-between text-xs text-muted-foreground'>
                        <div className='flex items-center gap-2'>
                          <span>
                            {new Date(review.date).toLocaleDateString('fi-FI')}
                          </span>
                          {review.demographics && (
                            <span className='text-blue-600'>
                              {review.demographics.age}v,{' '}
                              {review.demographics.location}
                            </span>
                          )}
                        </div>
                        <span>{review.helpful} helpful</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
