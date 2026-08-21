// Each cluster's GALLERY — as many local photos as you want per cluster,
// matched to the backend cluster by NAME (case-insensitive), same as before.
//
// To add more photos for a cluster: drop the image file in /public and add
// its path to that cluster's array below. Nothing else needs to change —
// ClusterDetailPage renders however many images are in the array.
const clusterGalleryImages = {
  'finance': [
    '/close-up-shot-business-study-essentials-white-desk-work-study-aesthetics.jpg',
    '/black-businessman-using-computer-laptop.jpg',
  ],
  'technology': [
    '/ai-nuclear-energy-future-innovation-disruptive-technology.jpg',
    '/data-center-developer-uses-vr-headset-ai-technology-machine-learning.jpg',
  ],
  'hospitality': [
    '/beautiful-aerial-shot-city.jpg',
    '/high-view-toy-model-house-keys.jpg',
  ],
  'power': [
    '/medium-shot-smiley-engineer-holding-tablet.jpg',
    '/engineer-electric-woman-checking-maintenance-solar-cells.jpg',
  ],
  'energy': [
    '/sun-setting-silhouette-electricity-pylons.jpg',
    '/african-american-technician-checks-maintenance-solar-panels-group-three-black-engineers-meeting-solar-station.jpg',
  ],
  'real estate': [
    '/beautiful-aerial-shot-city.jpg',
    '/high-view-toy-model-house-keys.jpg',
  ],
  'manufacturing': ['/manufacturing.png',
    '/engineer.jpg', '/engineer-technician.jpg'
  ],
  'healthcare': ['/Healthcareimg.jpg', '/general-practitioner.jpg', '/Surgeons.jpg'],
  'agriculture': ['/agricultureimg.jpg',
    '/gardener.jpg'
  ],
  'education': ['/Educationimg.jpg', '/academic-cap-with-books-pencils.jpg', '/college-students-different-ethnicities-cramming.jpg'],
  'investment': ['/Investmentimg.jpg', '/investor.jpg', '/financial-analyst.jpg'],
};

const DEFAULT_FALLBACK = ['/beautiful-aerial-shot-city.jpg'];

export const getClusterGalleryByName = (name, fallback = DEFAULT_FALLBACK) => {
  if (!name) return fallback;
  const key = name.trim().toLowerCase();
  return clusterGalleryImages[key]?.length ? clusterGalleryImages[key] : fallback;
};

// Kept for anything else already importing the old singular helper
// (e.g. Sectors.jsx / LearnAboutUs.jsx use this for a single hero photo) —
// just returns the first photo in that cluster's gallery.
export const getClusterImageByName = (name, fallback = '/beautiful-aerial-shot-city.jpg') =>
  getClusterGalleryByName(name, [fallback])[0];

export default clusterGalleryImages;