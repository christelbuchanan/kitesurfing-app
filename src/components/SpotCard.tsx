import { Wind, Waves, Calendar, Droplet, Clock, Globe, DollarSign, Languages, MapPin, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { KiteSpot } from '../types';
import { WeatherInfo } from './WeatherInfo';
import { WeatherForecast } from './WeatherForecast';
import { getLocationImages } from '../services/images';

interface SpotCardProps {
  spot: KiteSpot;
}

export const SpotCard: React.FC<SpotCardProps> = ({ spot }) => {
  const [dynamicImage, setDynamicImage] = useState<string | null>(null);
  const [photographer, setPhotographer] = useState<{ name: string; url: string } | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showExpandedInfo, setShowExpandedInfo] = useState(false);

  useEffect(() => {
    const loadDynamicImage = async () => {
      // If spot already has dynamic images from parent component, use those
      if (spot.dynamicImages && spot.dynamicImages.length > 0) {
        setDynamicImage(spot.dynamicImages[0].url);
        setPhotographer({
          name: spot.dynamicImages[0].photographer,
          url: spot.dynamicImages[0].photographerUrl
        });
        return;
      }

      // Otherwise try to fetch a new image
      setImageLoading(true);
      try {
        const images = await getLocationImages(`${spot.name} ${spot.location}`);
        if (images.length > 0) {
          setDynamicImage(images[0].url);
          setPhotographer({
            name: images[0].photographer,
            url: images[0].photographerUrl
          });
        }
      } catch (error) {
        console.error('Failed to load dynamic image:', error);
        setImageError(true);
      } finally {
        setImageLoading(false);
      }
    };

    loadDynamicImage();
  }, [spot]);

  const handleImageError = () => {
    console.log(`Image failed to load for ${spot.name}`);
    setImageError(true);
    // Use fallback image from our images service
    getLocationImages(`kitesurfing ${spot.location}`, 1).then(images => {
      if (images.length > 0) {
        setDynamicImage(images[0].url);
        setPhotographer({
          name: images[0].photographer,
          url: images[0].photographerUrl
        });
      }
    });
  };

  const difficultyColor = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-orange-100 text-orange-800',
    expert: 'bg-red-100 text-red-800'
  }[spot.difficulty];

  const getWaveTypeIcon = (type: string) => {
    switch (type) {
      case 'flat':
        return <span className="text-blue-400">≈</span>;
      case 'choppy':
        return <span className="text-blue-500">∿</span>;
      case 'small':
        return <span className="text-blue-600">∼</span>;
      case 'medium':
        return <span className="text-blue-700">∽</span>;
      case 'large':
        return <span className="text-blue-800">≋</span>;
      default:
        return <span className="text-blue-400">≈</span>;
    }
  };

  const toggleExpandedInfo = () => {
    setShowExpandedInfo(!showExpandedInfo);
  };

  return (
    <motion.div 
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      layout
    >
      <div 
        className="relative h-48 overflow-hidden cursor-pointer"
        onClick={toggleExpandedInfo}
      >
        {spot.trending && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Trending
            </span>
          </div>
        )}
        
        {spot.isBeginnerFriendly && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Beginner Friendly
            </span>
          </div>
        )}
        
        {spot.isHiddenGem && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Hidden Gem
            </span>
          </div>
        )}
        
        <motion.img 
          src={dynamicImage || spot.imageUrl} 
          alt={spot.name} 
          className="w-full h-full object-cover transition-transform duration-500"
          whileHover={{ scale: 1.05 }}
          onError={handleImageError}
          loading="lazy"
        />
        
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {photographer && (
          <a 
            href={photographer.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="absolute bottom-1 right-1 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded"
            onClick={(e) => e.stopPropagation()}
          >
            Photo: {photographer.name}
          </a>
        )}

        {/* Expand indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 rounded-full p-1">
          <motion.div
            animate={{ y: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            {showExpandedInfo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </motion.div>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-bold">{spot.name}</h3>
            <p className="text-gray-600">{spot.location}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColor}`}>
            {spot.difficulty.charAt(0).toUpperCase() + spot.difficulty.slice(1)}
          </span>
        </div>
        
        <div className="mb-4">
          <p className={`text-gray-700 ${showFullDescription ? '' : 'line-clamp-2'}`}>
            {spot.description}
          </p>
          {spot.description.length > 100 && (
            <button 
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-xs text-blue-500 mt-1 hover:underline"
            >
              {showFullDescription ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
        
        {spot.specialFeature && (
          <div className="mb-4 p-2 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-sm text-purple-800">
              <span className="font-semibold">What makes it special: </span>
              {spot.specialFeature}
            </p>
          </div>
        )}
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Wind size={18} className="text-blue-500" />
              <span className="text-sm text-gray-600 font-medium">Current Conditions</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={12} />
              <span>Next 24h</span>
            </div>
          </div>
          <WeatherInfo lat={spot.coordinates.lat} lng={spot.coordinates.lng} />
        </div>
        
        {spot.waveInfo && (
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-700">
            <Waves size={16} className="text-blue-500" />
            <div className="flex items-center">
              <span className="font-medium">{spot.waveInfo.averageHeight}m</span>
              <span className="mx-1 text-gray-400">|</span>
              <span>{spot.waveInfo.direction}</span>
              <span className="mx-1 text-gray-400">|</span>
              <div className="flex items-center">
                {getWaveTypeIcon(spot.waveInfo.type)}
                <span className="ml-1">{spot.waveInfo.type}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <Calendar size={16} />
          <span>Best time: {spot.bestMonths.slice(0, 3).join(', ')}...</span>
        </div>
        
        {/* Expanded Information Section */}
        <AnimatePresence>
          {showExpandedInfo && spot.localInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                <Globe size={16} className="mr-2" />
                Local Information
              </h4>
              
              <div className="space-y-3">
                {spot.localInfo.languages && (
                  <div className="flex items-start">
                    <Languages size={16} className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Languages</p>
                      <p className="text-sm">{spot.localInfo.languages.join(', ')}</p>
                    </div>
                  </div>
                )}
                
                {spot.localInfo.currency && (
                  <div className="flex items-start">
                    <DollarSign size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Currency</p>
                      <p className="text-sm">{spot.localInfo.currency}</p>
                    </div>
                  </div>
                )}
                
                {spot.localInfo.timeZone && (
                  <div className="flex items-start">
                    <Clock size={16} className="text-purple-500 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Time Zone</p>
                      <p className="text-sm">{spot.localInfo.timeZone}</p>
                    </div>
                  </div>
                )}
                
                {spot.localInfo.funFact && (
                  <div className="flex items-start">
                    <Info size={16} className="text-amber-500 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Fun Fact</p>
                      <p className="text-sm">{spot.localInfo.funFact}</p>
                    </div>
                  </div>
                )}
                
                {spot.localInfo.localTips && (
                  <div className="flex items-start">
                    <MapPin size={16} className="text-red-500 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Local Tips</p>
                      <p className="text-sm">{spot.localInfo.localTips}</p>
                    </div>
                  </div>
                )}
                
                {spot.localInfo.localFood && (
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 mt-1 mr-2 flex-shrink-0">
                      <path d="M15 11h.01"></path>
                      <path d="M11 15h.01"></path>
                      <path d="M16 16h.01"></path>
                      <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16"></path>
                      <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4"></path>
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Local Food</p>
                      <p className="text-sm">{spot.localInfo.localFood}</p>
                    </div>
                  </div>
                )}
                
                {spot.localInfo.visaRequirements && (
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 mt-1 mr-2 flex-shrink-0">
                      <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                      <line x1="2" x2="22" y1="10" y2="10"></line>
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Visa Requirements</p>
                      <p className="text-sm">{spot.localInfo.visaRequirements}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                onClick={toggleExpandedInfo}
                className="w-full mt-4 text-sm text-blue-500 hover:text-blue-700 transition-colors flex items-center justify-center gap-1"
              >
                Show less
                <ChevronUp size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Forecast Toggle Button */}
        <button 
          onClick={() => setShowForecast(!showForecast)}
          className="w-full text-sm text-blue-500 hover:text-blue-700 transition-colors flex items-center justify-center gap-1 mt-1"
        >
          {showForecast ? 'Hide forecast' : 'Show 3-day forecast'}
          <span className={`transition-transform duration-300 ${showForecast ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        
        {/* Forecast Panel */}
        {showForecast && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 pt-3 border-t border-gray-200"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">3-Day Forecast</span>
              <span className="text-xs text-gray-500">12:00 PM local time</span>
            </div>
            <WeatherForecast lat={spot.coordinates.lat} lng={spot.coordinates.lng} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
