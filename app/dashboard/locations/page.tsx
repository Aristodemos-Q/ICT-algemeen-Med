'use client';

import { useState, useEffect } from 'react';
import { MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { locationService } from '@/lib/bvf-services';
import type { Location } from '@/lib/database-types';

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setIsLoading(true);
      const locationsData = await locationService.getAllLocations();
      setLocations(locationsData);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLocations = locations.filter(location => 
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (location.address && location.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (location.description && location.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-primary">Trainingslocaties</h1>
          <p className="text-muted-foreground">Bekijk alle beschikbare trainingslocaties</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          type="search"
          placeholder="Zoek op naam, adres of beschrijving..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading skeleton
          [...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="bg-gray-100 h-32"></CardHeader>
              <CardContent className="space-y-2 py-4">
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredLocations.length > 0 ? (
          filteredLocations.map(location => (
            <Card key={location.id}>
              <CardHeader>
                <CardTitle className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <div>{location.name}</div>
                    {location.address && (
                      <div className="text-sm font-normal text-muted-foreground mt-1">
                        {location.address}
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              {location.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{location.description}</p>
                </CardContent>
              )}
            </Card>
          ))
        ) : searchTerm ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Geen locaties gevonden voor &quot;{searchTerm}&quot;
          </div>
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nog geen locaties beschikbaar
          </div>
        )}
      </div>
    </div>
  );
}
