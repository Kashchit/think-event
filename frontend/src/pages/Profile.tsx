import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import MyBookings from '@/components/Profile/MyBookings';
import MyEvents from '@/components/Profile/MyEvents';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Settings, 
  Bell, 
  Shield, 
  Heart,
  Edit3,
  Save,
  X,
  LogOut,
  Camera,
  Upload
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  avatar_url?: string;
  preferences: {
    notifications: boolean;
    marketing_emails: boolean;
    sms_notifications: boolean;
    language: string;
    currency: string;
  };
}

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    avatar_url: '',
    preferences: {
      notifications: true,
      marketing_emails: false,
      sms_notifications: true,
      language: 'English',
      currency: 'NPR'
    }
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get initial tab from URL params
  const initialTab = searchParams.get('tab') || 'personal';
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zip_code: user.zip_code || '',
        avatar_url: user.avatar_url || '',
        preferences: {
          ...prev.preferences,
          ...(user.preferences || {})
        }
      }));
    }
  }, [user]);

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ProfileData],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingImage(true);
      
      // Create FormData
      const formData = new FormData();
      formData.append('avatar', file);

      // Upload to server
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setProfileData(prev => ({
          ...prev,
          avatar_url: data.data.avatar_url
        }));
        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been updated successfully.",
        });
      } else {
        throw new Error(data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log('Saving profile data:', profileData);
      
      // Validate required fields
      if (!profileData.first_name || !profileData.last_name) {
        toast({
          title: "Validation Error",
          description: "First name and last name are required.",
          variant: "destructive",
        });
        return;
      }
      
      await updateProfile(profileData);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      
      let errorMessage = "Failed to update profile. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Profile Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      {profileData.avatar_url ? (
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                          <img 
                            src={profileData.avatar_url} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 w-8 h-8 p-0 rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-gray-600 text-sm">{user.email}</p>
                    {user.is_organizer && (
                      <Badge className="mt-2 bg-purple-100 text-purple-800">
                        Event Organizer
                      </Badge>
                    )}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Member since</span>
                      <span className="font-medium">2024</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Events attended</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total spent</span>
                      <span className="font-medium">₹8,500</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Content - Profile Details */}
            <div className="lg:col-span-3">
              <Tabs defaultValue={initialTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                  <TabsTrigger value="bookings">My Bookings</TabsTrigger>
                  <TabsTrigger value="events">My Events</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                {/* Personal Information Tab */}
                <TabsContent value="personal">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Personal Information</CardTitle>
                          <CardDescription>
                            Update your personal details and contact information
                          </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          {isEditing ? (
                            <>
                              <Button
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                <Save className="w-4 h-4 mr-2" />
                                {loading ? 'Saving...' : 'Save'}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button
                              onClick={() => setIsEditing(true)}
                              variant="outline"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="first_name">First Name</Label>
                          <Input
                            id="first_name"
                            value={profileData.first_name}
                            onChange={(e) => handleInputChange('first_name', e.target.value)}
                            disabled={!isEditing}
                            placeholder="Enter first name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last_name">Last Name</Label>
                          <Input
                            id="last_name"
                            value={profileData.last_name}
                            onChange={(e) => handleInputChange('last_name', e.target.value)}
                            disabled={!isEditing}
                            placeholder="Enter last name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            disabled={!isEditing}
                            placeholder="Enter email"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            disabled={!isEditing}
                            placeholder="Enter phone number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date_of_birth">Date of Birth</Label>
                          <Input
                            id="date_of_birth"
                            type="date"
                            value={profileData.date_of_birth}
                            onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <select
                            id="gender"
                            value={profileData.gender}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                          >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer_not_to_say">Prefer not to say</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Address Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="address">Street Address</Label>
                            <Input
                              id="address"
                              value={profileData.address}
                              onChange={(e) => handleInputChange('address', e.target.value)}
                              disabled={!isEditing}
                              placeholder="Enter street address"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={profileData.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              disabled={!isEditing}
                              placeholder="Enter city"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State/Province</Label>
                            <Input
                              id="state"
                              value={profileData.state}
                              onChange={(e) => handleInputChange('state', e.target.value)}
                              disabled={!isEditing}
                              placeholder="Enter state"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zip_code">ZIP/Postal Code</Label>
                            <Input
                              id="zip_code"
                              value={profileData.zip_code}
                              onChange={(e) => handleInputChange('zip_code', e.target.value)}
                              disabled={!isEditing}
                              placeholder="Enter ZIP code"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences">
                  <Card>
                    <CardHeader>
                      <CardTitle>Preferences & Settings</CardTitle>
                      <CardDescription>
                        Customize your notification preferences and account settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Notification Preferences</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="notifications" className="font-medium">Push Notifications</Label>
                              <p className="text-sm text-gray-600">Receive notifications about events and updates</p>
                            </div>
                            <input
                              type="checkbox"
                              id="notifications"
                              checked={profileData.preferences.notifications}
                              onChange={(e) => handleInputChange('preferences.notifications', e.target.checked.toString())}
                              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="marketing_emails" className="font-medium">Marketing Emails</Label>
                              <p className="text-sm text-gray-600">Receive promotional emails and offers</p>
                            </div>
                            <input
                              type="checkbox"
                              id="marketing_emails"
                              checked={profileData.preferences.marketing_emails}
                              onChange={(e) => handleInputChange('preferences.marketing_emails', e.target.checked.toString())}
                              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="sms_notifications" className="font-medium">SMS Notifications</Label>
                              <p className="text-sm text-gray-600">Receive text messages for important updates</p>
                            </div>
                            <input
                              type="checkbox"
                              id="sms_notifications"
                              checked={profileData.preferences.sms_notifications}
                              onChange={(e) => handleInputChange('preferences.sms_notifications', e.target.checked.toString())}
                              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="language">Language</Label>
                          <select
                            id="language"
                            value={profileData.preferences.language}
                            onChange={(e) => handleInputChange('preferences.language', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="English">English</option>
                            <option value="Nepali">Nepali</option>
                            <option value="Hindi">Hindi</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="currency">Currency</Label>
                          <select
                            id="currency"
                            value={profileData.preferences.currency}
                            onChange={(e) => handleInputChange('preferences.currency', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="NPR">NPR (Nepalese Rupee)</option>
                            <option value="USD">USD (US Dollar)</option>
                            <option value="INR">INR (Indian Rupee)</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Bookings Tab */}
                <TabsContent value="bookings">
                  <MyBookings />
                </TabsContent>

                {/* My Events Tab */}
                <TabsContent value="events">
                  <MyEvents />
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security & Privacy</CardTitle>
                      <CardDescription>
                        Manage your account security and privacy settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Shield className="w-5 h-5 text-green-600" />
                            <div>
                              <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                            </div>
                          </div>
                          <Button variant="outline">Enable</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Bell className="w-5 h-5 text-blue-600" />
                            <div>
                              <h4 className="font-medium text-gray-900">Login Notifications</h4>
                              <p className="text-sm text-gray-600">Get notified of new login attempts</p>
                            </div>
                          </div>
                          <Button variant="outline">Configure</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Heart className="w-5 h-5 text-red-600" />
                            <div>
                              <h4 className="font-medium text-gray-900">Data Privacy</h4>
                              <p className="text-sm text-gray-600">Manage your data and privacy preferences</p>
                            </div>
                          </div>
                          <Button variant="outline">Manage</Button>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Danger Zone</h4>
                        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-red-900">Delete Account</h5>
                              <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                            </div>
                            <Button variant="destructive">Delete Account</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Logout Button */}
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
