import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ParallaxHero } from '../../components/ParallaxHero';
import { Section } from '../../components/Section';
import { ScrollReveal } from '../../components/ScrollReveal';
import { AvailabilityCalendar } from '../../components/booking/AvailabilityCalendar';
import { BedDouble, Bath, ChefHat, Wifi, Tv, Wind, Maximize, Users, Mountain, Warehouse, Sofa, Coffee, Sun, Dumbbell } from 'lucide-react';
import { ApartmentFeature } from '../../components/apartment/ApartmentFeature';
import { FloorTabs } from '../../components/apartment/FloorTabs';
import { ImageLightbox } from '../../components/apartment/ImageLightbox';

const features = [
  {
    icon: BedDouble,
    title: 'Schlafzimmer',
    details: '2 Doppelbetten & 2 Einzelbetten',
  },
  {
    icon: Bath,
    title: 'Badezimmer',
    details: 'Modern mit Regendusche & extra WC',
  },
  {
    icon: ChefHat,
    title: 'Küche',
    details: 'Voll ausgestattet mit Geschirrspüler',
  },
  {
    icon: Wifi,
    title: 'Internet',
    details: 'Kostenloses Highspeed WLAN',
  },
  {
    icon: Tv,
    title: 'Unterhaltung',
    details: 'Smart TV mit Satellit',
  },
  {
    icon: Wind,
    title: 'Klimatisierung',
    details: 'Heizung & Ventilatoren',
  },
  {
    icon: Maximize,
    title: 'Größe',
    details: '89 m² auf 3 Etagen',
  },
  {
    icon: Users,
    title: 'Gäste',
    details: 'Ideal für 2-5 Erwachsene + Kinder',
  },
  {
    icon: Mountain,
    title: 'Ausblick',
    details: 'Panoramablick von der Dachterrasse',
  },
];

const floors = [
  {
    level: '3. Stock',
    title: 'Eingangsebene',
    description: 'Der perfekte Empfang in Ihrem mediterranen Zuhause mit gemütlichem Kaminzimmer und komfortablen Schlafbereichen.',
    features: [
      { icon: Warehouse, text: 'Eingangsbereich mit Garderobe' },
      { icon: Sofa, text: 'Kaminzimmer mit funktionierendem Kamin und gemütlicher Sitzecke' },
      { icon: BedDouble, text: 'Hauptschlafzimmer mit Doppelbett und Kleiderschrank' },
      { icon: BedDouble, text: 'Separates Nebenzimmer mit eigenem Eingang und Doppelbett' },
      { icon: Bath, text: 'Zusätzliche Toilette mit Waschbecken' },
    ],
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    level: '4. Stock',
    title: 'Wohnebene',
    description: 'Hier verbringen Sie gesellige Stunden beim Kochen und Essen, mit allem Komfort einer modernen Küche.',
    features: [
      { icon: Sun, text: 'Sonnige Terrasse mit Frühstücksplatz' },
      { icon: ChefHat, text: 'Moderne, vollausgestattete Küche mit Geschirrspüler' },
      { icon: Bath, text: 'Großzügiges Duschbad mit Regendusche' },
      { icon: Coffee, text: 'Heller Essbereich für gemeinsame Mahlzeiten' },
    ],
    images: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    level: '5. Stock',
    title: 'Dachterrasse',
    description: 'Die Krönung Ihres Aufenthalts: Eine weitläufige Dachterrasse mit atemberaubendem Panoramablick über Airole und die Berge.',
    features: [
      { icon: Sun, text: 'Weitläufige Dachterrasse mit Loungebereich' },
      { icon: Mountain, text: 'Spektakulärer Panoramablick über Airole und die Berge' },
      { icon: Dumbbell, text: 'Sonnenliegen zum Entspannen und Sonnenbaden' },
    ],
    images: [
      'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    ],
  },
];

export const Apartment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  const handleImageClick = (floorIndex: number, imageIndex: number) => {
    setSelectedFloor(floorIndex);
    setSelectedImage(imageIndex);
  };

  return (
    <div className="min-h-screen">
      <ParallaxHero
        title="Casa di Barbara"
        subtitle="Ihr mediterranes Zuhause in Airole"
        images={{
          main: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
          overlay: "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80&blend=000000&blend-alpha=10",
        }}
      />

      {/* Overview Section */}
      <Section variant="secondary" className="py-24">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display mb-6">
              Willkommen in Ihrem Zuhause
            </h2>
            <p className="text-lg text-primary/80">
              Entdecken Sie unsere charmante 89m² große Ferienwohnung im Herzen von Airole, 
              die sich über drei Etagen erstreckt und einen atemberaubenden Blick über das 
              mittelalterliche Dorf und die umliegenden Berge bietet.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <ApartmentFeature
              key={feature.title}
              {...feature}
              delay={index * 100}
            />
          ))}
        </div>
      </Section>

      {/* Floor Plans Section */}
      <Section variant="primary" className="py-24">
        <FloorTabs
          floors={floors}
          onImageClick={handleImageClick}
        />
      </Section>

      {/* Availability Section */}
      <Section variant="secondary" className="py-24">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-display mb-4">
                Verfügbarkeit prüfen
              </h2>
              <p className="text-lg text-primary/80">
                Finden Sie Ihren perfekten Zeitraum für einen unvergesslichen Aufenthalt
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <AvailabilityCalendar
              selectedRange={dateRange}
              onSelect={setDateRange}
              onPriceCalculated={setCalculatedPrice}
              className="mb-8"
            />

            {dateRange.from && dateRange.to && (
              <div className="text-center">
                <button
                  onClick={() => navigate('/booking', { 
                    state: { 
                      dateRange,
                      calculatedPrice 
                    }
                  })}
                  className="inline-flex items-center gap-2 bg-accent text-secondary px-6 py-3 
                           rounded-lg hover:bg-accent/90 transition-colors"
                >
                  <span>Jetzt buchen</span>
                </button>
              </div>
            )}
          </ScrollReveal>
        </div>
      </Section>

      {/* Lightbox */}
      {selectedFloor !== null && selectedImage !== null && (
        <ImageLightbox
          images={floors[selectedFloor].images}
          initialIndex={selectedImage}
          title={floors[selectedFloor].title}
          onClose={() => {
            setSelectedFloor(null);
            setSelectedImage(null);
          }}
        />
      )}
    </div>
  );
};
