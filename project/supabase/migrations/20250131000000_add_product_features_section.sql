-- Add product features section to products page
-- This adds a new section type and inserts the section for the products page

-- First, update the CHECK constraint to include the new section type
ALTER TABLE page_sections 
DROP CONSTRAINT IF EXISTS page_sections_section_type_check;

ALTER TABLE page_sections 
ADD CONSTRAINT page_sections_section_type_check 
CHECK (section_type IN ('text', 'rich_text', 'image', 'card', 'list', 'hero', 'stats', 'testimonial', 'testimonials', 'team_member', 'leadership', 'mission-vision', 'pricing', 'cta', 'call_to_action', 'product-features', 'products'));

-- Insert the product features section for the products page
INSERT INTO page_sections (page_id, section_id, section_name, section_type, default_content, sort_order) VALUES
  ('products', 'product-features', 'Product Features', 'product-features', '{
    "title": "Our AI Products & Features", 
    "subtitle": "Comprehensive solutions designed to transform your business operations with cutting-edge AI technology.",
    "products": [
      {
        "name": "NexusAnalytics",
        "description": "Advanced predictive analytics platform that transforms your data into actionable insights.",
        "features": [
          "Real-time data processing",
          "Customizable dashboards", 
          "Anomaly detection",
          "Trend forecasting",
          "Natural language querying"
        ],
        "icon": "BarChart",
        "image": "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
        "buttonText": "Learn More",
        "buttonUrl": "/products/nexus-analytics"
      },
      {
        "name": "NexusGuard", 
        "description": "AI-powered security solution that identifies and neutralizes threats before they impact your business.",
        "features": [
          "Threat intelligence",
          "Behavioral analysis",
          "Zero-day vulnerability detection", 
          "Automated incident response",
          "24/7 monitoring"
        ],
        "icon": "Shield",
        "image": "https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg",
        "buttonText": "Try Demo",
        "buttonUrl": "/products/nexus-guard"
      },
      {
        "name": "NexusFlow",
        "description": "Intelligent workflow automation that streamlines your business processes and boosts productivity.",
        "features": [
          "Visual workflow builder",
          "AI-powered optimization",
          "Integration with major platforms",
          "Error detection and recovery", 
          "Performance analytics"
        ],
        "icon": "Zap",
        "image": "https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg",
        "buttonText": "Get Started",
        "buttonUrl": "/products/nexus-flow"
      }
    ]
  }', 3)
ON CONFLICT (page_id, section_id) DO UPDATE SET
  section_name = EXCLUDED.section_name,
  section_type = EXCLUDED.section_type,
  default_content = EXCLUDED.default_content,
  sort_order = EXCLUDED.sort_order;

-- Insert default page content for the product features section
INSERT INTO page_content (page_id, section_id, content, section_type, metadata) 
VALUES (
  'products', 
  'product-features', 
  '{
    "title": "Our AI Products & Features", 
    "subtitle": "Comprehensive solutions designed to transform your business operations with cutting-edge AI technology.",
    "products": [
      {
        "name": "NexusAnalytics",
        "description": "Advanced predictive analytics platform that transforms your data into actionable insights for better decision-making.",
        "features": [
          "Real-time data processing and analysis",
          "Customizable interactive dashboards", 
          "Advanced anomaly detection algorithms",
          "Predictive trend forecasting",
          "Natural language querying interface",
          "Multi-source data integration"
        ],
        "icon": "BarChart",
        "image": "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
        "buttonText": "Learn More",
        "buttonUrl": "/products/nexus-analytics"
      },
      {
        "name": "NexusGuard", 
        "description": "AI-powered cybersecurity solution that proactively identifies and neutralizes threats before they impact your business operations.",
        "features": [
          "Advanced threat intelligence gathering",
          "Behavioral analysis and profiling",
          "Zero-day vulnerability detection", 
          "Automated incident response protocols",
          "24/7 continuous monitoring",
          "Compliance reporting and auditing"
        ],
        "icon": "Shield",
        "image": "https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg",
        "buttonText": "Try Demo",
        "buttonUrl": "/products/nexus-guard"
      },
      {
        "name": "NexusFlow",
        "description": "Intelligent workflow automation platform that streamlines your business processes and significantly boosts operational productivity.",
        "features": [
          "Drag-and-drop visual workflow builder",
          "AI-powered process optimization",
          "Seamless integration with major platforms",
          "Intelligent error detection and recovery", 
          "Comprehensive performance analytics",
          "Custom API connectivity"
        ],
        "icon": "Zap",
        "image": "https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg",
        "buttonText": "Get Started",
        "buttonUrl": "/products/nexus-flow"
      },
      {
        "name": "NexusAssist",
        "description": "Conversational AI assistant that enhances customer support and streamlines internal operations with intelligent automation.",
        "features": [
          "Advanced natural language processing",
          "Multi-channel deployment support",
          "Knowledge base integration",
          "Real-time sentiment analysis", 
          "Conversation analytics and insights",
          "Custom training and personalization"
        ],
        "icon": "MessageSquare",
        "image": "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg",
        "buttonText": "Try Free",
        "buttonUrl": "/products/nexus-assist"
      }
    ]
  }', 
  'product-features', 
  '{"section_layout": "grid", "columns": 2, "show_features_list": true}'
)

ON CONFLICT (page_id, section_id) DO UPDATE SET
  content = EXCLUDED.content,
  section_type = EXCLUDED.section_type,
  metadata = EXCLUDED.metadata,
  updated_at = now();
