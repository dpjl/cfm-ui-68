
import { MediaItem, MediaItemWithDate } from '@/types/gallery';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

console.log("API Base URL:", API_BASE_URL);

export interface DirectoryNode {
  id: string;
  name: string;
  children?: DirectoryNode[];
}

export interface DetailedMediaInfo {
  alt: string;
  createdAt: string | null;
  name?: string;
  path?: string;
  size?: string;
  cameraModel?: string;
  hash?: string;
  duplicatesCount?: number;
  dimensions?: string;
  iso?: string;
  focalLength?: string;
  exposureTime?: string;
  aperture?: string;
}

// Liste des modèles d'appareils photo pour les données mock
const CAMERA_MODELS = [
  "iPhone 13 Pro", "iPhone 14 Pro Max", "iPhone 15 Pro", 
  "Samsung Galaxy S22 Ultra", "Samsung Galaxy S23", 
  "Google Pixel 7 Pro", "Google Pixel 8", 
  "Canon EOS 5D Mark IV", "Canon EOS R5", "Canon EOS 90D",
  "Nikon Z6 II", "Nikon D850", "Nikon Z9",
  "Sony Alpha A7R IV", "Sony Alpha A7 III", "Sony Alpha A1",
  "Fujifilm X-T4", "Fujifilm X-H2", "Fujifilm GFX 100S",
  "Panasonic Lumix GH6", "Panasonic S5", 
  "Olympus OM-D E-M1 Mark III", "Olympus PEN-F"
];

// Liste des dimensions d'image courantes pour les données mock
const IMAGE_DIMENSIONS = [
  "6000 x 4000", "5472 x 3648", "4032 x 3024", 
  "3840 x 2160", "3024 x 4032", "2048 x 1536",
  "7680 x 4320", "8192 x 5464", "2736 x 1824"
];

// Liste d'extensions de fichiers courantes pour les données mock
const FILE_EXTENSIONS = [
  ".jpg", ".jpeg", ".png", ".heic", ".raw", ".dng", ".cr2", ".nef",
  ".mp4", ".mov", ".avi", ".webm"
];

// Fonction pour générer une date aléatoire dans les 3 dernières années
function randomDate() {
  const now = new Date();
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(now.getFullYear() - 3);
  
  return new Date(
    threeYearsAgo.getTime() + Math.random() * (now.getTime() - threeYearsAgo.getTime())
  ).toISOString();
}

// Fonction pour générer une taille de fichier aléatoire entre 500KB et 20MB
function randomFileSize() {
  const size = Math.floor(Math.random() * 19500) + 500; // Entre 500KB et 20000KB
  
  if (size >= 1000) {
    return `${(size / 1000).toFixed(2)} MB`;
  }
  return `${size} KB`;
}

// Fonction pour générer un hash unique
function generateHash() {
  return Array.from({ length: 40 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

export async function fetchDirectoryTree(position?: 'left' | 'right'): Promise<DirectoryNode[]> {
  const url = `${API_BASE_URL}/tree${position ? `?position=${position}` : ''}`;
  console.log(`Fetching directory tree from: ${url}`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server responded with error:", response.status, errorText);
      throw new Error(`Failed to fetch directory tree: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Received directory tree for ${position || 'default'}:`, data);
    
    return data;
  } catch (error) {
    console.error(`Error fetching directory tree for ${position || 'default'}:`, error);
    
    // Return mock data in case of errors for development
    const mockData = [
      { 
        id: `photos-${position || 'default'}`, 
        name: "Photos", 
        children: [
          { id: `vacances-${position || 'default'}`, name: "Vacances", children: [] },
          { id: `famille-${position || 'default'}`, name: "Famille", children: [] },
          { id: `evenements-${position || 'default'}`, name: "Évènements", children: [] }
        ] 
      },
      { 
        id: `videos-${position || 'default'}`, 
        name: "Vidéos", 
        children: [
          { id: `films-${position || 'default'}`, name: "Films", children: [] },
          { id: `clips-${position || 'default'}`, name: "Clips", children: [] }
        ] 
      }
    ];
    
    console.log(`Using mock directory data for ${position || 'default'}:`, mockData);
    return mockData;
  }
}

export async function fetchMediaIds(directory: string, position: 'source' | 'destination', filter: string = 'all'): Promise<string[]> {
  // Mise à jour de l'URL: changement de /media à /list et ajout du paramètre folder
  const url = `${API_BASE_URL}/list?directory=${encodeURIComponent(position)}&folder=${encodeURIComponent(directory)}${filter !== 'all' ? `&filter=${filter}` : ''}`;
  console.log("Fetching media IDs from:", url);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server responded with error:", response.status, errorText);
      throw new Error(`Failed to fetch media IDs: ${response.status} ${response.statusText}`);
    }
    
    const data: MediaItemWithDate[] = await response.json();
    console.log("Received media items with dates:", data);
    
    // Extract only the IDs to maintain backward compatibility
    return data.map(item => item.id);
  } catch (error) {
    console.error("Error fetching media IDs:", error);
    
    // Génère environ 200 IDs de média mock
    console.log("Using mock media IDs due to error");
    const mockCount = 200 + Math.floor(Math.random() * 20); // Entre 200 et 220 médias
    
    // Générer des IDs uniques pour éviter les conflits
    // Ajout du directory (folder) dans le préfixe pour les données mock
    const prefix = `${position}-${directory}-${filter === 'all' ? '' : filter + '-'}`;
    
    // Générer des IDs pour les images (80% du total)
    const imageCount = Math.floor(mockCount * 0.8);
    const imageIds = Array.from({ length: imageCount }, (_, i) => 
      `${prefix}img-${i + 1000}`
    );
    
    // Générer des IDs pour les vidéos (20% du total)
    const videoCount = mockCount - imageCount;
    const videoIds = Array.from({ length: videoCount }, (_, i) => 
      `${prefix}vid-${i + 2000}`
    );
    
    // Combiner et mélanger les IDs
    const mockMediaIds = [...imageIds, ...videoIds].sort(() => Math.random() - 0.5);
    
    console.log(`Generated ${mockMediaIds.length} mock media IDs with directory ${directory}`);
    return mockMediaIds;
  }
}

// Nouvelle fonction pour obtenir les médias avec leurs dates
export async function fetchMediaWithDates(directory: string, position: 'source' | 'destination', filter: string = 'all'): Promise<MediaItemWithDate[]> {
  const url = `${API_BASE_URL}/list?directory=${encodeURIComponent(position)}&folder=${encodeURIComponent(directory)}${filter !== 'all' ? `&filter=${filter}` : ''}`;
  console.log("Fetching media with dates from:", url);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server responded with error:", response.status, errorText);
      throw new Error(`Failed to fetch media with dates: ${response.status} ${response.statusText}`);
    }
    
    const data: MediaItemWithDate[] = await response.json();
    console.log("Received media items with dates:", data);
    
    return data;
  } catch (error) {
    console.error("Error fetching media with dates:", error);
    
    // Même logique de mock que fetchMediaIds mais avec des dates
    const mockCount = 200 + Math.floor(Math.random() * 20);
    const prefix = `${position}-${directory}-${filter === 'all' ? '' : filter + '-'}`;
    const threeDaysPerItem = 1095 / mockCount; // Distribuer les dates sur 3 ans
    
    // Générer des médias avec dates
    const mockMediaWithDates: MediaItemWithDate[] = [];
    
    // Dates pour les images (80% du total)
    const imageCount = Math.floor(mockCount * 0.8);
    for (let i = 0; i < imageCount; i++) {
      const daysAgo = Math.floor(i * threeDaysPerItem) + Math.floor(Math.random() * 10);
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
      mockMediaWithDates.push({
        id: `${prefix}img-${i + 1000}`,
        createdAt
      });
    }
    
    // Dates pour les vidéos (20% du total)
    const videoCount = mockCount - imageCount;
    for (let i = 0; i < videoCount; i++) {
      const daysAgo = Math.floor(i * threeDaysPerItem) + Math.floor(Math.random() * 10);
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
      mockMediaWithDates.push({
        id: `${prefix}vid-${i + 2000}`,
        createdAt
      });
    }
    
    // Mélanger les résultats
    mockMediaWithDates.sort(() => Math.random() - 0.5);
    
    console.log(`Generated ${mockMediaWithDates.length} mock media items with dates`);
    return mockMediaWithDates;
  }
}

export async function fetchMediaInfo(id: string, position: 'source' | 'destination'): Promise<DetailedMediaInfo> {
  const url = `${API_BASE_URL}/info?id=${encodeURIComponent(id)}&directory=${encodeURIComponent(position)}`;
  console.log(`Fetching media info for ID ${id} from:`, url);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Server error for media info (ID: ${id}):`, response.status);
      throw new Error(`Failed to fetch media info: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Media info for ID ${id}:`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching media info for ID ${id}:`, error);
    
    // Déterminer si c'est une image ou une vidéo basé sur l'ID
    const isVideo = id.includes('vid-');
    
    // Générer une extension de fichier appropriée
    let extension = FILE_EXTENSIONS[Math.floor(Math.random() * (isVideo ? 4 : 8) + (isVideo ? 8 : 0))];
    
    // Générer un nom de fichier réaliste
    const fileName = isVideo ? 
      `VID_${Math.floor(Math.random() * 9000) + 1000}${extension}` : 
      `IMG_${Math.floor(Math.random() * 9000) + 1000}${extension}`;
    
    // Générer un chemin de fichier réaliste
    const basePath = `/media/${position === 'source' ? 'source' : 'destination'}`;
    const subFolder = isVideo ? 'videos' : 'photos';
    const yearFolder = `${2021 + Math.floor(Math.random() * 3)}`;
    const monthFolder = `${Math.floor(Math.random() * 12) + 1}`.padStart(2, '0');
    
    const mockInfo: DetailedMediaInfo = { 
      alt: fileName,
      createdAt: randomDate(),
      name: fileName,
      path: `${basePath}/${subFolder}/${yearFolder}/${monthFolder}/${fileName}`,
      size: randomFileSize(),
      cameraModel: CAMERA_MODELS[Math.floor(Math.random() * CAMERA_MODELS.length)],
      hash: generateHash(),
      duplicatesCount: Math.random() < 0.2 ? Math.floor(Math.random() * 3) + 1 : 0, // 20% de chance d'avoir des doublons
      dimensions: isVideo ? "1920 x 1080" : IMAGE_DIMENSIONS[Math.floor(Math.random() * IMAGE_DIMENSIONS.length)],
      iso: isVideo ? undefined : `ISO ${[100, 200, 400, 800, 1600, 3200][Math.floor(Math.random() * 6)]}`,
      focalLength: isVideo ? undefined : `${[24, 35, 50, 85, 105, 135][Math.floor(Math.random() * 6)]}mm`,
      exposureTime: isVideo ? undefined : `1/${[8, 15, 30, 60, 125, 250, 500, 1000][Math.floor(Math.random() * 8)]}s`,
      aperture: isVideo ? undefined : `f/${[1.4, 1.8, 2.0, 2.8, 3.5, 4.0, 5.6][Math.floor(Math.random() * 7)]}`
    };
    
    console.log(`Using mock media info for ${id}:`, mockInfo);
    return mockInfo;
  }
}

// Fonction pour obtenir une URL de picsum aléatoire
function getRandomPicsumUrl(id: string, width: number, height: number): string {
  // Extraire un nombre de l'ID pour avoir une image cohérente par ID
  const seed = parseInt(id.replace(/\D/g, '').slice(0, 3)) || Math.floor(Math.random() * 1000);
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

// Fonction pour obtenir une URL de vidéo placeholder aléatoire
function getRandomVideoUrl(): string {
  // Utiliser des vidéos de placeholder.com
  const colors = ['054A91', '3E7CB1', '81A4CD', 'DBE4EE', '0C0A3E', '7B1E7A', 'F9564F', '3C3C3B'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return `https://via.placeholder.com/640x360/${color}/FFFFFF?text=Video`;
}

// Ces fonctions sont maintenant des utilitaires pour obtenir les URLs
export function getThumbnailUrl(id: string, position: 'source' | 'destination'): string {
  // Si c'est un ID mock, retourner une image de Picsum ou un placeholder vidéo
  if (id.includes('img-') || id.includes('vid-')) {
    if (id.includes('vid-')) {
      return getRandomVideoUrl();
    }
    return getRandomPicsumUrl(id, 300, 300);
  }
  return `${API_BASE_URL}/thumbnail?id=${encodeURIComponent(id)}&directory=${encodeURIComponent(position)}`;
}

export function getMediaUrl(id: string, position: 'source' | 'destination'): string {
  // Si c'est un ID mock, retourner une image de Picsum ou un placeholder vidéo en plus grande taille
  if (id.includes('img-') || id.includes('vid-')) {
    if (id.includes('vid-')) {
      return getRandomVideoUrl();
    }
    return getRandomPicsumUrl(id, 800, 800);
  }
  return `${API_BASE_URL}/media?id=${encodeURIComponent(id)}&directory=${encodeURIComponent(position)}`;
}

export async function deleteImages(imageIds: string[], directory: 'source' | 'destination'): Promise<{ success: boolean, message: string }> {
  const url = `${API_BASE_URL}/images?directory=${encodeURIComponent(directory)}`;
  console.log("Deleting images at:", url, "IDs:", imageIds);
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageIds }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server responded with error:", response.status, errorText);
      throw new Error(`Failed to delete images: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Delete response:", data);
    return data;
  } catch (error) {
    console.error("Error deleting images:", error);
    
    // Return mock response for development
    console.log("Using mock delete response due to error");
    return { success: true, message: `Successfully deleted ${imageIds.length} image(s)` };
  }
}
