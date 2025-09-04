import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import { eventsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const EventsEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [event, setEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    venue_id: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    price: '',
    currency: 'NPR',
    total_seats: '',
    tags: '',
    status: 'upcoming'
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (id) {
      loadEventData();
    }
  }, [id, user, authLoading, navigate]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      const [eventRes, catsRes, venuesRes] = await Promise.all([
        eventsAPI.getById(id),
        eventsAPI.getCategories(),
        eventsAPI.getVenues(),
      ]);

      if (eventRes.success) {
        const eventData = eventRes.data;
        
        // Check if user is the organizer
        if (eventData.organizer_id !== user?.id) {
          setError('You can only edit your own events');
          return;
        }
        
        setEvent(eventData);
        
        // Populate form with existing data
        setForm({
          title: eventData.title || '',
          description: eventData.description || '',
          category_id: eventData.category_id || '',
          venue_id: eventData.venue_id || '',
          start_date: eventData.start_date ? eventData.start_date.split('T')[0] : '',
          end_date: eventData.end_date ? eventData.end_date.split('T')[0] : '',
          start_time: eventData.start_time || '',
          end_time: eventData.end_time || '',
          price: eventData.price || '',
          currency: eventData.currency || 'NPR',
          total_seats: eventData.total_seats || '',
          tags: Array.isArray(eventData.tags) ? eventData.tags.join(', ') : '',
          status: eventData.status || 'upcoming'
        });
      } else {
        setError('Event not found');
      }

      setCategories(catsRes.data || []);
      setVenues(venuesRes.data?.venues || []);
    } catch (err) {
      console.error('Error loading event data:', err);
      setError('Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.title || !form.category_id || !form.venue_id || !form.start_date || !form.start_time || !form.total_seats) {
      return 'Please fill all required fields';
    }
    const sd = new Date(form.start_date);
    const ed = form.end_date ? new Date(form.end_date) : sd;
    if (ed < sd) return 'End date cannot be before start date';
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const data = await eventsAPI.update(id, {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      });
      
      if (data.success) {
        toast({
          title: "Event Updated",
          description: "Your event has been updated successfully.",
        });
        navigate('/profile?tab=events');
      } else {
        setError(data.message || 'Failed to update event');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Loading event...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/profile?tab=events')}>
              Back to My Events
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
        <Button 
          variant="ghost" 
          onClick={() => navigate('/profile?tab=events')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Events
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-purple-100 text-purple-700">✏️</span>
              Edit Event
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input 
                  id="title"
                  name="title" 
                  value={form.title} 
                  onChange={handleChange} 
                  placeholder="e.g. Music Night" 
                  required
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  name="description" 
                  value={form.description} 
                  onChange={handleChange} 
                  className="h-28"
                  placeholder="Describe your event..."
                />
              </div>

              <div>
                <Label htmlFor="category_id">Category *</Label>
                <select 
                  id="category_id"
                  name="category_id" 
                  value={form.category_id} 
                  onChange={handleChange} 
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="venue_id">Venue *</Label>
                <select 
                  id="venue_id"
                  name="venue_id" 
                  value={form.venue_id} 
                  onChange={handleChange} 
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select venue</option>
                  {venues.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input 
                  id="start_date"
                  type="date" 
                  name="start_date" 
                  value={form.start_date} 
                  onChange={handleChange} 
                  required
                />
              </div>

              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input 
                  id="end_date"
                  type="date" 
                  name="end_date" 
                  value={form.end_date} 
                  onChange={handleChange} 
                />
              </div>

              <div>
                <Label htmlFor="start_time">Start Time *</Label>
                <Input 
                  id="start_time"
                  type="time" 
                  name="start_time" 
                  value={form.start_time} 
                  onChange={handleChange} 
                  required
                />
              </div>

              <div>
                <Label htmlFor="end_time">End Time</Label>
                <Input 
                  id="end_time"
                  type="time" 
                  name="end_time" 
                  value={form.end_time} 
                  onChange={handleChange} 
                />
              </div>

              <div>
                <Label htmlFor="price">Ticket Price (NPR)</Label>
                <Input 
                  id="price"
                  name="price" 
                  type="number" 
                  value={form.price} 
                  onChange={handleChange} 
                  placeholder="0 for free events"
                />
              </div>

              <div>
                <Label htmlFor="total_seats">Total Seats *</Label>
                <Input 
                  id="total_seats"
                  name="total_seats" 
                  type="number" 
                  value={form.total_seats} 
                  onChange={handleChange} 
                  required
                />
              </div>

              <div>
                <Label htmlFor="status">Event Status</Label>
                <select 
                  id="status"
                  name="status" 
                  value={form.status} 
                  onChange={handleChange} 
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input 
                  id="tags"
                  name="tags" 
                  value={form.tags} 
                  onChange={handleChange} 
                  placeholder="music, live, outdoor"
                />
              </div>

              {error && (
                <div className="col-span-1 md:col-span-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">
                  {error}
                </div>
              )}

              <div className="col-span-1 md:col-span-2 flex space-x-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/profile?tab=events')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={submitting} 
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {submitting ? 'Updating...' : 'Update Event'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventsEdit;