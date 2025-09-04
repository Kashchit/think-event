
import React, { useState, useEffect } from 'react';
import Header from '@/components/Layout/Header';
import { MapPin, Star, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import VenueBookingForm from '@/components/Venues/VenueBookingForm';
import { eventsAPI } from '@/services/api';

interface Venue {
  id: number;
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  capacity: number;
  description?: string;
  amenities?: string[];
  images?: string[];
  latitude?: number;
  longitude?: number;
}

const Venues = () => {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching venues from API...');
      const response = await eventsAPI.getVenues();
      console.log('Venues API response:', response);
      
      if (response.success) {
        // The API returns data.venues, not data directly
        const venuesData = response.data?.venues || [];
        console.log('Setting venues data:', venuesData);
        setVenues(venuesData);
      } else {
        setError(response.message || 'Failed to load venues');
      }
    } catch (err) {
      console.error('Error fetching venues:', err);
      setError('Failed to load venues. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Loading venues...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchVenues} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Venues</h1>
          <p className="text-gray-600">Discover amazing venues across Nepal</p>
        </div>

        {venues.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No venues found.</p>
            <Button onClick={fetchVenues} className="mt-4">
              Refresh
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <div key={venue.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                <img 
                  src={venue.images?.[0] || `https://images.unsplash.com/photo-1493397212122-2b85dda8106b?w=400&h=200&fit=crop`}
                  alt={venue.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900">{venue.name}</h3>
                    <Badge variant="secondary">
                      {venue.capacity > 10000 ? 'Stadium' : venue.capacity > 1000 ? 'Convention Center' : 'Event Hall'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{venue.city}, {venue.state || venue.country}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Capacity: {venue.capacity?.toLocaleString()}</span>
                    </div>
                    {venue.amenities && venue.amenities.length > 0 && (
                      <div className="flex items-start text-gray-600 text-sm">
                        <Star className="h-4 w-4 mr-2 mt-0.5" />
                        <span>{venue.amenities.slice(0, 3).join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {venue.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {venue.description}
                    </p>
                  )}

                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      setSelectedVenue(venue);
                      setShowBookingForm(true);
                    }}
                  >
                    Book This Venue
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Form Modal */}
        {showBookingForm && selectedVenue && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">Book {selectedVenue.name}</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowBookingForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <VenueBookingForm 
                venue={selectedVenue}
                onClose={() => setShowBookingForm(false)}
                onBookingSubmit={async (bookingData) => {
                  console.log('Venue booking submitted:', bookingData);
                  // Here you would typically send the booking request to your backend
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Venues;
