import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Calendar, Building, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '@/services/api';

interface SearchResult {
  id: number;
  title: string;
  type: 'event' | 'venue';
  category?: string;
  location?: string;
  date?: string;
  image?: string;
}

const SearchDropdown = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showDropdown) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          } else if (query.trim()) {
            // Navigate to search results page
            navigate(`/events?search=${encodeURIComponent(query.trim())}`);
            setShowDropdown(false);
          }
          break;
        case 'Escape':
          setShowDropdown(false);
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDropdown, results, selectedIndex, query, navigate]);

  useEffect(() => {
    const searchEvents = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        const response = await eventsAPI.getAll({ search: query.trim(), limit: 5 });
        const events = response.data.events || [];
        
        const searchResults: SearchResult[] = events.slice(0, 5).map(event => ({
          id: event.id,
          title: event.title,
          type: 'event' as const,
          category: event.category_name,
          location: event.venue_city,
          date: event.start_date,
          image: event.images?.[0]
        }));

        // Add venue results from API
        const venuesResponse = await eventsAPI.getVenues({ search: query.trim(), limit: 3 });
        const venues = venuesResponse.data?.venues || [];
        
        const venueResults: SearchResult[] = venues.map(venue => ({
          id: venue.id,
          title: venue.name,
          type: 'venue' as const,
          location: venue.city,
          image: venue.images?.[0] || 'photo-1493397212122-2b85dda8106b'
        }));

        setResults([...searchResults, ...venueResults]);
        setShowDropdown(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchEvents, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'event') {
      navigate(`/event/${result.id}`);
    } else {
      navigate(`/venues?venue=${result.id}`);
    }
    setShowDropdown(false);
    setQuery('');
    setSelectedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'venue': return <Building className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md mx-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Search events, venues..."
          value={query}
          onChange={handleInputChange}
          className="pl-10 pr-10 border-gray-200 focus:border-purple-300 focus:ring-purple-300"
          onFocus={() => {
            if (results.length > 0) setShowDropdown(true);
          }}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 transition-colors ${
                    index === selectedIndex ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {result.image ? (
                        <img 
                          src={`https://images.unsplash.com/${result.image}?w=40&h=40&fit=crop`}
                          alt={result.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          {getResultIcon(result.type)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          result.type === 'event' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {result.type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        {result.category && (
                          <span>{result.category}</span>
                        )}
                        {result.location && (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{result.location}</span>
                          </div>
                        )}
                        {result.date && (
                          <span>{formatDate(result.date)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              
              {query.trim() && (
                <div className="border-t border-gray-200 px-4 py-2">
                  <button
                    onClick={() => {
                      navigate(`/events?search=${encodeURIComponent(query.trim())}`);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    View all results for "{query}"
                  </button>
                </div>
              )}
            </div>
          ) : query.trim().length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              No results found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
