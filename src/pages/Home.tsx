import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ParallaxHero } from '../components/ParallaxHero';
import { Section } from '../components/Section';
import { ScrollReveal } from '../components/ScrollReveal';
import { AvailabilityCalendar } from '../components/booking/AvailabilityCalendar';
import { MapPin, Calendar, Mountain, Waves, Castle } from 'lucide-react';
import { SectionTitle } from '../components/SectionTitle';
import { ImageSection } from '../components/ImageSection';

export const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ 
    from: undefined, 
    to: undefined 
  });
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  return (
    <div className="relative">
      <ParallaxHero
        title={t('home.title')}
        subtitle={t('home.subtitle')}
        images={{
          main: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
        }}
      />

      {/* Features Section */}
      <Section variant="secondary" layered={true}>
        <SectionTitle 
          title={t('home.features.title')}
          subtitle={t('home.features.subtitle')}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              icon: MapPin,
              title: t('home.features.location.title'),
              description: t('home.features.location.description'),
            },
            {
              icon: () => (
                <div className="relative w-12 h-12">
                  <img
                    src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80"
                    alt=""
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              ),
              title: t('home.features.comfort.title'),
              description: t('home.features.comfort.description'),
            },
            {
              icon: () => (
                <div className="relative w-12 h-12">
                  <img
                    src="https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80"
                    alt=""
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              ),
              title: t('home.features.experience.title'),
              description: t('home.features.experience.description'),
            },
          ].map((feature, index) => (
            <ScrollReveal key={index} delay={index * 200}>
              <div className="text-center group">
                <div className="transform transition-transform duration-500 group-hover:scale-110">
                  {typeof feature.icon === 'function' ? (
                    <feature.icon />
                  ) : (
                    <feature.icon className="w-12 h-12 text-accent mx-auto mb-4" />
                  )}
                </div>
                <h3 className="text-xl font-display text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-primary/80">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
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
                  <Calendar className="w-5 h-5" />
                  <span>Jetzt buchen</span>
                </button>
              </div>
            )}
          </ScrollReveal>
        </div>
      </Section>

      {/* Explore Section */}
      <Section variant="accent" layered={true}>
        <SectionTitle
          title={t('home.explore.title')}
          subtitle={t('home.explore.description')}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Waves,
              text: 'beaches',
              image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            },
            {
              icon: Mountain,
              text: 'mountains',
              image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            },
            {
              icon: Castle,
              text: 'villages',
              image: 'https://images.unsplash.com/photo-1512813389649-acb9131ced20?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            }
          ].map((item, index) => (
            <ScrollReveal key={item.text} delay={index * 200}>
              <div className="group relative overflow-hidden rounded-lg shadow-lg">
                <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/0 transition-colors duration-500" />
                <img
                  src={item.image}
                  alt=""
                  className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-6">
                  <div className="text-secondary transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <item.icon className="w-8 h-8 mb-2" />
                    <h3 className="text-xl font-display">{t(`home.explore.${item.text}`)}</h3>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={600}>
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/area')}
              className="inline-block bg-accent text-secondary px-6 py-3 rounded-md 
                       text-lg font-semibold hover:bg-accent/90 transition-all 
                       duration-300 transform hover:scale-105"
            >
              {t('home.explore.viewAll')}
            </button>
          </div>
        </ScrollReveal>
      </Section>

      {/* Airole Teaser Section */}
      <Section variant="secondary" layered={true}>
        <SectionTitle
          title="Entdecken Sie Airole"
          subtitle="Ein verborgenes Juwel in den ligurischen Bergen"
        />
        
        <ImageSection
          image="https://images.unsplash.com/photo-1512813389649-acb9131ced20?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
          title="Airole - Ein Dorf voller Charme"
          description="Eingebettet in die ligurischen Berge, ist Airole ein Zeuge der Zeit. Von den Ligurern gegründet, erlebte es die römische Eroberung und blühte im Mittelalter auf. Entdecken Sie die engen, gepflasterten Gassen und die alten Steinhäuser des Dorfes, die von seiner langen und bewegten Geschichte zeugen."
        />
        
        <div className="text-center mt-12">
          <ScrollReveal>
            <button
              onClick={() => navigate('/area')}
              className="inline-block bg-accent text-secondary px-6 py-3 rounded-md 
                       text-lg font-semibold hover:bg-accent/90 transition-all 
                       duration-300 transform hover:scale-105"
            >
              Mehr über Airole & Umgebung erfahren
            </button>
          </ScrollReveal>
        </div>
      </Section>
    </div>
  );
};
