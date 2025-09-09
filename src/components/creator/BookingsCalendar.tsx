import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface Booking {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  location: string;
}

export default function BookingsCalendar() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data, error } = await supabase
          .from('crm_bookings')
          .select('id, title, starts_at, ends_at, location')
          .gte('starts_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('starts_at', { ascending: true })
          .limit(10);

        if (error) throw error;
        setBookings(data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Bookings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No upcoming bookings
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card/50">
                <div className="w-2 h-2 rounded-full bg-growth-primary mt-2" />
                <div className="flex-1">
                  <h4 className="font-medium">{booking.title}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(booking.starts_at).toLocaleString()}
                    </div>
                    {booking.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {booking.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}