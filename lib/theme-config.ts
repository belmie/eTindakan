export interface VisualThemeSettings {
  // Top Header Banner
  headerBgType: 'gradient' | 'islamic_pattern' | 'geometry_gold' | 'mosque' | 'emerald' | 'custom';
  headerCustomUrl: string;
  headerOpacity: number; // 0.1 to 1.0
  headerOverlayColor: string; // e.g. '#0b3d5c'

  // Sidebar Navigasi
  sidebarBgType: 'navy_gradient' | 'slate_dark' | 'emerald_dark' | 'islamic_pattern' | 'custom';
  sidebarCustomUrl: string;
  sidebarOpacity: number; // 0.1 to 1.0

  // App Canvas Background
  appBgType: 'islamic_pattern' | 'subtle_mesh' | 'clean' | 'mains_watermark' | 'custom';
  appCustomUrl: string;
  appOpacity: number; // 0.05 to 1.0

  // Login Screen
  loginBgType: 'mains_gradient' | 'geometric_pattern' | 'mosque_dusk' | 'custom';
  loginCustomUrl: string;
  loginOpacity: number;
}

export const DEFAULT_VISUAL_THEME: VisualThemeSettings = {
  headerBgType: 'gradient',
  headerCustomUrl: '',
  headerOpacity: 0.95,
  headerOverlayColor: '#0b3d5c',

  sidebarBgType: 'navy_gradient',
  sidebarCustomUrl: '',
  sidebarOpacity: 0.98,

  appBgType: 'islamic_pattern',
  appCustomUrl: '',
  appOpacity: 0.15,

  loginBgType: 'mains_gradient',
  loginCustomUrl: '',
  loginOpacity: 0.95
};

// Preset images & patterns (royalty free high-res architectural & vector patterns)
export const THEME_PRESETS = {
  header: [
    {
      id: 'gradient',
      name: 'Gradien Korporat MAINS (Asal)',
      desc: 'Kombinasi warna rasmi Deep Navy, Royal Blue dan Emerald Teal',
      previewGradient: 'linear-gradient(110deg, #0b3d5c 0%, #0f4f74 45%, #0aa3a3 100%)',
      style: {
        background: 'linear-gradient(110deg, #0b3d5c 0%, #0f4f74 45%, #0aa3a3 100%)'
      }
    },
    {
      id: 'islamic_pattern',
      name: 'Corak Arabesque Geometrik',
      desc: 'Corak bintang 8-penjuru Islamik klasik dengan lapisan biru gelap',
      previewGradient: 'linear-gradient(135deg, #06324f 0%, #0b507a 100%)',
      style: {
        background: 'linear-gradient(110deg, #093450 0%, #0b4a70 50%, #0d6e8a 100%)',
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(10, 163, 163, 0.25) 0%, transparent 70%), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' stroke='%2338bdf8' stroke-opacity='.18' stroke-width='1'%3E%3Crect x='15' y='15' width='30' height='30'/%3E%3Crect x='15' y='15' width='30' height='30' transform='rotate(45 30 30)'/%3E%3Ccircle cx='30' cy='30' r='5'/%3E%3C/g%3E%3C/svg%3E")`
      }
    },
    {
      id: 'geometry_gold',
      name: 'Emas Diraja & Samudera',
      desc: 'Nuansa mewah hitam keemasan mencerminkan prestij institusi Islam',
      previewGradient: 'linear-gradient(110deg, #0f172a 0%, #1e293b 50%, #b45309 100%)',
      style: {
        background: 'linear-gradient(110deg, #0f172a 0%, #1e293b 50%, #92400e 100%)',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='%23f59e0b' stroke-opacity='.15' stroke-width='1'%3E%3Cpolygon points='40,0 80,40 40,80 0,40'/%3E%3Cpolygon points='40,10 70,40 40,70 10,40'/%3E%3Ccircle cx='40' cy='40' r='8'/%3E%3C/g%3E%3C/svg%3E")`
      }
    },
    {
      id: 'emerald',
      name: 'Zamrud Syariah (Emerald)',
      desc: 'Warna hijau zamrud ketenangan sunnah dan kemakmuran ummah',
      previewGradient: 'linear-gradient(110deg, #064e3b 0%, #065f46 50%, #0d9488 100%)',
      style: {
        background: 'linear-gradient(110deg, #064e3b 0%, #065f46 50%, #0d9488 100%)',
        backgroundImage: `radial-gradient(circle at 80% 20%, rgba(52, 211, 153, 0.2) 0%, transparent 60%)`
      }
    },
    {
      id: 'mosque',
      name: 'Seni Bina Masjid & Kubah',
      desc: 'Latar belakang bayang kubah dan arsitektur Islamik kontemporari',
      previewGradient: 'linear-gradient(110deg, #0b253a 0%, #134e6f 60%, #107085 100%)',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
      style: {
        background: 'linear-gradient(110deg, rgba(11, 37, 58, 0.92) 0%, rgba(19, 78, 111, 0.88) 100%), url("https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center 35%'
      }
    }
  ],

  sidebar: [
    {
      id: 'navy_gradient',
      name: 'Biru Kelasi MAINS (Asal)',
      desc: 'Gradien menegak biru kelasi korporat MAINS',
      previewGradient: 'linear-gradient(180deg, #0b3d5c 0%, #0c4a6b 100%)',
      style: {
        background: 'linear-gradient(180deg, #0b3d5c 0%, #0c4a6b 100%)'
      }
    },
    {
      id: 'islamic_pattern',
      name: 'Tekstur Geometrik Arabesque',
      desc: 'Latar biru gelap dengan ukiran motif geometri halus',
      previewGradient: 'linear-gradient(180deg, #072a40 0%, #0a3d5c 100%)',
      style: {
        background: 'linear-gradient(180deg, #072a40 0%, #0a3d5c 100%)',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Cg fill='none' stroke='%2338bdf8' stroke-opacity='.12' stroke-width='.8'%3E%3Crect x='10' y='10' width='30' height='30'/%3E%3Crect x='10' y='10' width='30' height='30' transform='rotate(45 25 25)'/%3E%3C/g%3E%3C/svg%3E")`
      }
    },
    {
      id: 'slate_dark',
      name: 'Arang Moden (Dark Slate)',
      desc: 'Tema profesional gelap moden dengan aksen teal',
      previewGradient: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      style: {
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)'
      }
    },
    {
      id: 'emerald_dark',
      name: 'Hutan Zamrud Gelap',
      desc: 'Nuansa hijau gelap korporat Islamik yang tenang',
      previewGradient: 'linear-gradient(180deg, #022c22 0%, #064e3b 100%)',
      style: {
        background: 'linear-gradient(180deg, #022c22 0%, #064e3b 100%)'
      }
    }
  ],

  app: [
    {
      id: 'islamic_pattern',
      name: 'Corak Geometrik Islamik (Asal)',
      desc: 'Corak jubin 80px SVG berterusan melambangkan identiti institusi MAINS',
      previewGradient: 'linear-gradient(135deg, #e9f5fb 0%, #d8edf7 100%)'
    },
    {
      id: 'subtle_mesh',
      name: 'Mesh Gradien Lembut (Subtle Mesh)',
      desc: 'Pancaran warna lembut di bucu skrin bagi paparan moden',
      previewGradient: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 50%, #fef3c7 100%)'
    },
    {
      id: 'clean',
      name: 'Putih Bersih Minimalis (Flat Clean)',
      desc: 'Latar rata tanpa corak untuk fokus maksimum',
      previewGradient: '#f8fafc'
    },
    {
      id: 'mains_watermark',
      name: 'Watermark Logo MAINS Lembut',
      desc: 'Logo rasmi MAINS di tengah latar belakang dengan kelegapan rendah',
      previewGradient: 'linear-gradient(135deg, #eaf4f9 0%, #dff0f8 100%)'
    }
  ]
};

// Style generator for Header
export function getHeaderStyles(theme: VisualThemeSettings): React.CSSProperties {
  if (theme.headerBgType === 'custom' && theme.headerCustomUrl) {
    return {
      backgroundImage: `linear-gradient(rgba(11, 61, 92, ${theme.headerOpacity}), rgba(10, 163, 163, ${theme.headerOpacity})), url("${theme.headerCustomUrl}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }

  const preset = THEME_PRESETS.header.find(p => p.id === theme.headerBgType);
  if (preset?.style) {
    return preset.style;
  }

  return {
    background: 'linear-gradient(110deg, #0b3d5c 0%, #0f4f74 45%, #0aa3a3 100%)'
  };
}

// Style generator for Sidebar
export function getSidebarStyles(theme: VisualThemeSettings): React.CSSProperties {
  if (theme.sidebarBgType === 'custom' && theme.sidebarCustomUrl) {
    return {
      backgroundImage: `linear-gradient(rgba(11, 61, 92, ${theme.sidebarOpacity}), rgba(12, 74, 107, ${theme.sidebarOpacity})), url("${theme.sidebarCustomUrl}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }

  const preset = THEME_PRESETS.sidebar.find(p => p.id === theme.sidebarBgType);
  if (preset?.style) {
    return preset.style;
  }

  return {
    background: 'linear-gradient(180deg, #0b3d5c 0%, #0c4a6b 100%)'
  };
}

// Style generator for Main Application Canvas
export function getAppCanvasStyles(theme: VisualThemeSettings, isDark: boolean): React.CSSProperties {
  if (theme.appBgType === 'custom' && theme.appCustomUrl) {
    return {
      backgroundImage: `linear-gradient(rgba(240, 249, 255, ${1 - theme.appOpacity}), rgba(240, 249, 255, ${1 - theme.appOpacity})), url("${theme.appCustomUrl}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    };
  }

  if (theme.appBgType === 'clean') {
    return {
      backgroundColor: isDark ? '#020617' : '#f8fafc',
      backgroundImage: 'none'
    };
  }

  if (theme.appBgType === 'mains_watermark') {
    return {
      backgroundColor: isDark ? '#020617' : '#e9f5fb',
      backgroundImage: `radial-gradient(circle at center, rgba(10, 163, 163, 0.08) 0%, transparent 60%)`,
      backgroundAttachment: 'fixed'
    };
  }

  return {};
}
