import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import { Link } from 'react-router-dom';
import EventFilters from '@/components/Events/EventFilters';
import EventCard from '@/components/Events/EventCard';
import { eventsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const Events = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    // Get filters from URL params
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const date = searchParams.get('date');
    const priceRange = searchParams.get('price_range');
    const search = searchParams.get('search');
    
    const urlFilters: any = {};
    if (category) urlFilters.category = category;
    if (location) urlFilters.location = location;
    if (date) urlFilters.date = date;
    if (priceRange) urlFilters.price_range = priceRange;
    if (search) urlFilters.search = search;
    
    setFilters(urlFilters);
  }, [searchParams]);

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getAll(filters);
      setEvents(response.data.events || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    
    // Update URL params
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      }
    });
    setSearchParams(newSearchParams);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            All Events
          </h1>
          <p className="text-lg text-gray-600">
            Discover amazing events happening across Nepal
          </p>
        </div>

        {/* Filters */}
        <EventFilters onFilterChange={handleFilterChange} />
        
        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Loading events...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchEvents}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search criteria.</p>
            <button 
              onClick={() => {
                setFilters({});
                setSearchParams({});
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Showing {events.length} event{events.length !== 1 ? 's' : ''}
                {Object.keys(filters).length > 0 && ' with applied filters'}
              </p>
              {user && (
                <Link
                  to="/events/create"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                >
                  Create Event
                </Link>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {events.length > 0 && (
              <div className="text-center mt-12">
                <p className="text-gray-600 mb-4">
                  Can't find what you're looking for?
                </p>
                <button 
                  onClick={() => {
                    setFilters({});
                    setSearchParams({});
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  View All Events
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Events;
