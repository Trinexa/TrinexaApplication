import { DynamicHero, DynamicStats, DynamicTextSection, DynamicMissionVision, DynamicLeadershipTeam, DynamicValues, DynamicCEOMessage } from '../components/common/DynamicSections';
import { useDynamicContent } from '../hooks/useDynamicContent';

const AboutPage = () => {
  const { content, loading, error } = useDynamicContent('about');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading about page content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.warn('Using fallback content due to error:', error);
  }

  console.log('📄 AboutPage content loaded:', content);

  return (
    <>
      {/* Hero Section - Section ID: hero */}
      {content.hero && <DynamicHero content={content.hero} />}

      {/* Our Story Section - Section ID: story */}
      {content.story && <DynamicTextSection content={content.story} />}

      {/* Mission & Vision Section - Section ID: mission-vision */}
      {content['mission-vision'] && <DynamicMissionVision content={content['mission-vision']} />}

      {/* Our Values Section - Section ID: values */}
      {content.values && <DynamicValues content={content.values} />}

      {/* Leadership Team Section - Section ID: leadership */}
      {content.leadership && <DynamicLeadershipTeam content={content.leadership} />}

      {/* CEO Message Section - Section ID: ceo-message */}
      {content['ceo-message'] && <DynamicCEOMessage content={content['ceo-message']} />}

      {/* Company Stats Section - Section ID: stats */}
      {content.stats && <DynamicStats content={content.stats} />}
    </>
  );
};

export default AboutPage;