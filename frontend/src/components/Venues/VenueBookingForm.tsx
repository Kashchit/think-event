import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Users, MapPin, Phone, Mail } from 'lucide-react';

interface VenueBookingFormProps {
  venue: {
    id: number;
    name: string;
    address: string;
    city: string;
    capacity: number;
    description: string;
  };
  onBookingSubmit?: (bookingData: any) => void;
  onClose?: () => void;
}

const VenueBookingForm: React.FC<VenueBookingFormProps> = ({ venue, onBookingSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    eventName: '',
    eventType: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    expectedAttendees: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    eventDescription: '',
    specialRequirements: '',
    budget: ''
  });

  const [loading, setLoading] = useState(false);

  const eventTypes = [
    'Wedding',
    'Corporate Event',
    'Birthday Party',
    'Conference',
    'Concert',
    'Exhibition',
    'Workshop',
    'Sports Event',
    'Cultural Event',
    'Other'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (onBookingSubmit) {
        await onBookingSubmit({
          ...formData,
          venueId: venue.id,
          venueName: venue.name
        });
      }
      
      // Show success message
      alert('Booking request submitted successfully! We will contact you soon.');
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Booking submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Book This Venue</h2>
        <p className="text-gray-600">Fill out the form below to request a booking for {venue.name}</p>
      </div>

      {/* Venue Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Venue Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-purple-600" />
            <span>{venue.address}, {venue.city}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-purple-600" />
            <span>Capacity: {venue.capacity.toLocaleString()} people</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="eventName">Event Name *</Label>
            <Input
              id="eventName"
              value={formData.eventName}
              onChange={(e) => handleInputChange('eventName', e.target.value)}
              placeholder="Enter event name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="eventType">Event Type *</Label>
            <Select value={formData.eventType} onValueChange={(value) => handleInputChange('eventType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="eventDate">Event Date *</Label>
            <Input
              id="eventDate"
              type="date"
              value={formData.eventDate}
              onChange={(e) => handleInputChange('eventDate', e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="startTime">Start Time *</Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="endTime">End Time *</Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expectedAttendees">Expected Attendees *</Label>
            <Input
              id="expectedAttendees"
              type="number"
              value={formData.expectedAttendees}
              onChange={(e) => handleInputChange('expectedAttendees', e.target.value)}
              placeholder="Number of attendees"
              min="1"
              max={venue.capacity}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Max capacity: {venue.capacity.toLocaleString()}</p>
          </div>
          
          <div>
            <Label htmlFor="budget">Budget Range</Label>
            <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select budget range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-50000">रु 0 - 50,000</SelectItem>
                <SelectItem value="50000-100000">रु 50,000 - 1,00,000</SelectItem>
                <SelectItem value="100000-250000">रु 1,00,000 - 2,50,000</SelectItem>
                <SelectItem value="250000-500000">रु 2,50,000 - 5,00,000</SelectItem>
                <SelectItem value="500000+">रु 5,00,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="eventDescription">Event Description</Label>
          <Textarea
            id="eventDescription"
            value={formData.eventDescription}
            onChange={(e) => handleInputChange('eventDescription', e.target.value)}
            placeholder="Describe your event..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="specialRequirements">Special Requirements</Label>
          <Textarea
            id="specialRequirements"
            value={formData.specialRequirements}
            onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
            placeholder="Any special requirements or requests..."
            rows={3}
          />
        </div>

        {/* Contact Information */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="contactName">Contact Name *</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="contactPhone">Phone Number *</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="Your phone number"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="contactEmail">Email Address *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
            {loading ? 'Submitting...' : 'Submit Booking Request'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VenueBookingForm;
