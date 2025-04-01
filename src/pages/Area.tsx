import React from 'react';
import { useTranslation } from 'react-i18next';
import { ParallaxHero } from '../components/ParallaxHero';
import { Section } from '../components/Section';
import { ScrollReveal } from '../components/ScrollReveal';
import { SectionTitle } from '../components/SectionTitle';
import { ImageSection } from '../components/ImageSection';
import { FeatureGrid } from '../components/FeatureGrid';
import { MapPin, Utensils, Bike, Umbrella, Mountain, Waves } from 'lucide-react';

export const Area = () => {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <ParallaxHero
        title="Airole & Umgebung"
        subtitle="Entdecken Sie die Schönheit Liguriens zwischen Bergen und Meer"
        images={{
          main: "https://images.unsplash.com/photo-1512813389649-acb9131ced20?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
        }}
      />

      {/* Airole History Section */}
      <Section variant="secondary" layered={true}>
        <SectionTitle
          title="Airole - Ein Dorf mit Geschichte"
          subtitle="Entdecken Sie die reiche Vergangenheit dieses mittelalterlichen Juwels"
        />
        
        <ImageSection
          image="https://images.unsplash.com/photo-1518730518541-d0843268c287?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
          title="Eine Reise durch die Zeit"
          description="Airole, gegründet im 10. Jahrhundert, ist ein malerisches Dorf, das auf einem Hügel über dem Roya-Tal thront. Mit seinen engen, gewundenen Gassen, mittelalterlichen Steinbrücken und traditionellen ligurischen Häusern bietet es einen authentischen Einblick in die Vergangenheit. Das Dorf war einst ein wichtiger Handelsposten zwischen der Küste und dem Piemont und hat seine historische Architektur und seinen Charme bewahrt."
        />
        
        <div className="mt-16">
          <ImageSection
            image="https://images.unsplash.com/photo-1499678329028-101435549a4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
            title="Leben in Airole"
            description="Heute ist Airole ein ruhiges Dorf, in dem die Zeit langsamer zu vergehen scheint. Die Einheimischen pflegen ihre Traditionen und die lokale Küche. Jeden Sommer erwacht das Dorf zum Leben mit dem 'Festa di San Giovanni Battista', einem traditionellen Fest zu Ehren des Schutzheiligen des Dorfes. Die Bewohner sind bekannt für ihre Gastfreundschaft und ihre Leidenschaft für gutes Essen und Wein."
            reverse={true}
          />
        </div>
      </Section>

      {/* Activities Section */}
      <Section variant="accent" layered={true}>
        <SectionTitle
          title="Aktivitäten & Ausflüge"
          subtitle="Entdecken Sie die vielfältigen Möglichkeiten in und um Airole"
        />
        
        <FeatureGrid
          features={[
            {
              icon: Bike,
              title: "Radfahren & Wandern",
              description: "Erkunden Sie die malerischen Bergpfade und Radwege entlang des Roya-Tals."
            },
            {
              icon: Umbrella,
              title: "Strände",
              description: "Besuchen Sie die wunderschönen Strände von Ventimiglia und der Côte d'Azur, nur 20 Minuten entfernt."
            },
            {
              icon: Utensils,
              title: "Kulinarische Erlebnisse",
              description: "Genießen Sie lokale Spezialitäten in den traditionellen Trattorien von Airole."
            },
            {
              icon: Mountain,
              title: "Bergabenteuer",
              description: "Entdecken Sie die beeindruckenden Berge der Seealpen mit atemberaubenden Aussichten."
            },
            {
              icon: MapPin,
              title: "Kulturelle Ausflüge",
              description: "Besuchen Sie historische Städte wie Dolceacqua, Apricale und Sanremo."
            },
            {
              icon: Waves,
              title: "Wassersport",
              description: "Genießen Sie Schwimmen, Kajakfahren und andere Wassersportarten im Roya-Fluss oder am Mittelmeer."
            }
          ]}
        />
      </Section>

      {/* Surroundings Section */}
      <Section variant="secondary" layered={true}>
        <SectionTitle
          title="Umgebung erkunden"
          subtitle="Entdecken Sie die Schätze der ligurischen Küste und des Hinterlandes"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ScrollReveal>
            <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Dolceacqua" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-display mb-2">Dolceacqua</h3>
                <p className="text-primary/80 mb-4">
                  Ein malerisches mittelalterliches Dorf mit einer beeindruckenden Brücke, die von Claude Monet gemalt wurde. Bekannt für seine engen Gassen, die Doria-Burg und den lokalen Rossese-Wein.
                </p>
                <p className="text-sm text-primary/60">Entfernung: 15 Minuten mit dem Auto</p>
              </div>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={200}>
            <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Sanremo" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-display mb-2">Sanremo</h3>
                <p className="text-primary/80 mb-4">
                  Die "Stadt der Blumen" mit ihrem berühmten Casino, eleganten Jugendstilgebäuden und dem historischen Stadtteil La Pigna. Genießen Sie das Einkaufen, die Strände und die lebhafte Atmosphäre.
                </p>
                <p className="text-sm text-primary/60">Entfernung: 35 Minuten mit dem Auto</p>
              </div>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={400}>
            <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1534359265607-b2e5c7c67f18?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Nizza" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-display mb-2">Nizza</h3>
                <p className="text-primary/80 mb-4">
                  Die Perle der Côte d'Azur mit ihrer berühmten Promenade des Anglais, dem lebhaften Altstadtviertel und zahlreichen Museen. Genießen Sie französisches Flair und mediterrane Lebensart.
                </p>
                <p className="text-sm text-primary/60">Entfernung: 45 Minuten mit dem Auto</p>
              </div>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={600}>
            <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1597040663342-45b6af3d9a72?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Monaco" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-display mb-2">Monaco</h3>
                <p className="text-primary/80 mb-4">
                  Das glamouröse Fürstentum mit dem berühmten Casino von Monte Carlo, dem Fürstenpalast und dem exquisiten Hafen voller Luxusyachten. Erleben Sie Luxus und Eleganz pur.
                </p>
                <p className="text-sm text-primary/60">Entfernung: 50 Minuten mit dem Auto</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Section>

      {/* Local Cuisine Section */}
      <Section variant="primary" layered={true}>
        <SectionTitle
          title="Lokale Küche"
          subtitle="Entdecken Sie die Aromen Liguriens und der Provence"
          className="text-secondary"
        />
        
        <ImageSection
          image="https://images.unsplash.com/photo-1498579150354-977475b7ea0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
          title="Kulinarische Traditionen"
          description="Die ligurische Küche ist bekannt für ihre frischen, einfachen Zutaten und intensiven Aromen. Probieren Sie lokale Spezialitäten wie Pesto alla Genovese, frische Meeresfrüchte, Focaccia und Farinata. In Airole und den umliegenden Dörfern finden Sie authentische Trattorien, die traditionelle Gerichte mit lokalen Weinen servieren."
          className="text-secondary"
        />
      </Section>
    </div>
  );
};
