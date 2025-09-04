
import React, { useState } from 'react';
import { Calendar, MapPin, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface EventFiltersProps {
  onFilterChange: (filters: any) => void;
}

const EventFilters: React.FC<EventFiltersProps> = ({ onFilterChange }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'Concerts', 'Festivals', 'Conferences', 'Sports', 'Theatre', 'Comedy', 'Workshops', 'Cultural'
  ];

  const locations = [
    'Kathmandu', 'Pokhara', 'Chitwan', 'Butwal', 'Biratnagar', 'Dharan', 'Hetauda', 'Nepalgunj'
  ];

  const toggleCategory = (category: string) => {
    const newCategories = selectedCategories.includes(category) 
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newCategories);
    updateFilters(newCategories, selectedLocation, selectedDate, priceRange, searchQuery);
  };

  const updateFilters = (categories: string[], location: string, date: string, price: string, search: string) => {
    const filters: any = {};
    
    if (categories.length > 0) {
      filters.category = categories.map(c => c.toLowerCase()).join(',');
    }
    if (location) {
      filters.location = location;
    }
    if (date) {
      filters.date = date;
    }
    if (price) {
      filters.price_range = price;
    }
    if (search) {
      filters.search = search;
    }
    
    onFilterChange(filters);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedLocation('');
    setSelectedDate('');
    setPriceRange('');
    setSearchQuery('');
    onFilterChange({});
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filter Events
        </h2>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear All
        </Button>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search events, artists, venues..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              updateFilters(selectedCategories, selectedLocation, selectedDate, priceRange, e.target.value);
            }}
          />
        </div>

        {/* Date and Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <Input 
              type="date" 
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                updateFilters(selectedCategories, selectedLocation, e.target.value, priceRange, searchQuery);
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <Select value={selectedLocation} onValueChange={(value) => {
              setSelectedLocation(value);
              updateFilters(selectedCategories, value, selectedDate, priceRange, searchQuery);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
            <Select value={priceRange} onValueChange={(value) => {
              setPriceRange(value);
              updateFilters(selectedCategories, selectedLocation, selectedDate, value, searchQuery);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select price range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="0-500">रु 0 - 500</SelectItem>
                <SelectItem value="500-1000">रु 500 - 1,000</SelectItem>
                <SelectItem value="1000-2500">रु 1,000 - 2,500</SelectItem>
                <SelectItem value="2500+">रु 2,500+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Badge
                key={category}
                variant={selectedCategories.includes(category) ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  selectedCategories.includes(category) 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'hover:bg-purple-50'
                }`}
                onClick={() => toggleCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {(selectedCategories.length > 0 || selectedLocation || selectedDate || priceRange) && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map(category => (
                <Badge key={category} variant="secondary" className="bg-purple-100 text-purple-800">
                  {category}
                </Badge>
              ))}
              {selectedLocation && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <MapPin className="h-3 w-3 mr-1" />
                  {selectedLocation}
                </Badge>
              )}
              {selectedDate && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Calendar className="h-3 w-3 mr-1" />
                  {selectedDate}
                </Badge>
              )}
              {priceRange && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {priceRange}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventFilters;
