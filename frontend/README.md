# Modern React Branding System with Comprehensive Testing

## Overview

A complete, production-ready branding solution built with React 19, TypeScript, Material-UI, and modern testing practices. This system provides dynamic theme management, font loading, animations, and a comprehensive Jest test suite with high coverage goals.

## 📁 Project Structure

```
src/
├── __tests__/                     # Comprehensive test suite (40 test files, 602+ tests)
│   ├── components/                # Component tests with edge cases
│   ├── hooks/                     # Custom hook tests with mocking
│   ├── services/                  # Service layer tests
│   └── utils/                     # Utility function tests
├── components/
│   ├── common/                    # Reusable UI components
│   │   ├── ColorPicker.tsx        # Advanced color picker with validation
│   │   ├── FontPicker.tsx         # Font selection with preview
│   │   ├── AnimatedCard.tsx       # Cards with hover effects
│   │   ├── AnimatedButton.tsx     # Buttons with ripple effects
│   │   └── ...
│   └── icons/                     # Dynamic SVG icons
├── context/
│   ├── BrandingProvider.tsx       # Branding state management
│   └── ThemeProvider.tsx          # Material-UI theme integration
├── hooks/                         # Custom hooks library
│   ├── useScript.ts               # Dynamic script loading
│   ├── useFontLoader.ts           # Advanced font loading with caching
│   ├── useBrandingOperations.ts   # Complete CRUD operations
│   ├── useAnimations.ts           # Animation utilities
│   └── useDebounced.ts            # Debounced state management
├── pages/
│   ├── Branding/                  # Branding setup wizard
│   └── Dashboard/                 # Main application interface
├── services/
│   └── brandingStorage.ts         # localStorage abstraction
├── types/
│   └── branding.ts                # TypeScript definitions
└── utils/
    ├── colorUtils.ts              # Color manipulation
    └── animations.ts              # Animation constants
```

## 🎨 Branding System Architecture

### **Theme Variables (Database-Ready)**

The branding system uses a comprehensive theme structure that can be easily stored in a database:

```typescript
interface BrandingSettings {
  id?: string;
  organizationId?: string;
  companyName: string;
  companyUrl?: string;
  theme: {
    theme_color: string; // Primary brand color - main CTAs, links
    primary_dark_color: string; // Darker shade for hover states
    extra_light_color: string; // Accent color - borders, highlights
    text_color: string; // Main text color for all content
    font_family: string; // Primary font family for all text
    button: {
      primary_color: string; // Same as theme_color (consistency)
      secondary_color: string; // Alternative action buttons
      hover_color: string; // Hover state for buttons
      border_color: string; // Default border color for forms/cards
    };
    logos: {
      light?: string; // Light theme logo URL
      dark?: string; // Dark theme logo URL
      favicon?: string; // Favicon URL
    };
  };
  capabilities: {
    general_app_title: string; // Application title
  };
}
```

### **Font Loading System**

Advanced font loading with caching and fallbacks:

```typescript
const { status, retry } = useFontLoader("Source Sans Pro, sans-serif", {
  weights: ["400", "500", "600"],
  display: "swap",
  preload: true,
});

// Features:
// - Automatic Google Fonts loading
// - System font detection
// - Caching to prevent duplicate requests
// - Concurrent React features
// - Error handling with retry
```

### **Dynamic Material-UI Theming**

```typescript
// Automatic theme generation from branding settings
const theme = createTheme({
  palette: {
    primary: { main: brandingSettings.theme.theme_color },
    secondary: { main: brandingSettings.theme.button.secondary_color },
    text: { primary: brandingSettings.theme.text_color },
  },
  typography: {
    fontFamily: brandingSettings.theme.font_family,
    // All variants automatically use the selected font
  },
});
```

## 🚀 Getting Started

### **Installation & Setup**

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build
```

### **Development Workflow**

```bash
# Start development with hot reload
npm run dev

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test ColorPicker.test.tsx

# Generate coverage report
npm run test:coverage
```

## 🔧 Database Integration Guide

### **Backend API Requirements**

```typescript
// Required endpoints for full functionality
interface BrandingAPI {
  // Get organization's branding
  GET: '/api/v1/organizations/{orgId}/branding' => BrandingSettings[];

  // Create new branding
  POST: '/api/v1/organizations/{orgId}/branding' => BrandingSettings;

  // Update existing branding
  PUT: '/api/v1/organizations/{orgId}/branding/{id}' => BrandingSettings;

  // Delete branding
  DELETE: '/api/v1/organizations/{orgId}/branding/{id}' => void;

  // Upload logos
  POST: '/api/v1/organizations/{orgId}/branding/{id}/logos' => { url: string };
}
```

### **Database Schema Example**

```sql
-- PostgreSQL example
CREATE TABLE organization_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  company_name VARCHAR(255) NOT NULL,
  company_url VARCHAR(500),

  -- Theme colors
  theme_color VARCHAR(7) NOT NULL DEFAULT '#1976d2',
  primary_dark_color VARCHAR(7) NOT NULL DEFAULT '#1565c0',
  extra_light_color VARCHAR(7) NOT NULL DEFAULT '#bbdefb',
  text_color VARCHAR(7) NOT NULL DEFAULT '#000000',
  font_family VARCHAR(255) NOT NULL DEFAULT 'Roboto, Arial, sans-serif',

  -- Button colors
  button_primary_color VARCHAR(7) NOT NULL DEFAULT '#1976d2',
  button_secondary_color VARCHAR(7) NOT NULL DEFAULT '#9c27b0',
  button_hover_color VARCHAR(7) NOT NULL DEFAULT '#1565c0',
  button_border_color VARCHAR(7) NOT NULL DEFAULT '#cccccc',

  -- Logos
  logo_light_url VARCHAR(500),
  logo_dark_url VARCHAR(500),
  favicon_url VARCHAR(500),

  -- App settings
  general_app_title VARCHAR(255) NOT NULL DEFAULT 'My Bank',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Service Layer Integration**

```typescript
// Replace localStorage with API calls
class BrandingAPIService {
  static async save(
    orgId: string,
    settings: BrandingSettings
  ): Promise<BrandingSettings> {
    const response = await fetch(`/api/v1/organizations/${orgId}/branding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    return response.json();
  }

  static async load(orgId: string): Promise<BrandingSettings[]> {
    const response = await fetch(`/api/v1/organizations/${orgId}/branding`);
    return response.json();
  }

  static async update(
    orgId: string,
    id: string,
    settings: BrandingSettings
  ): Promise<BrandingSettings> {
    const response = await fetch(
      `/api/v1/organizations/${orgId}/branding/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      }
    );
    return response.json();
  }
}
```

chitecture

---

## API Reference

### Themes API

**Base URL (Local):** `http://localhost:3001/api/v1`
**Base URL (Production):** `http://your-domain.com/api/v1`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/themes` | Get all themes |
| GET | `/themes/:id` | Get theme by ID |
| POST | `/themes` | Create new theme |
| PUT | `/themes/:id` | Update theme |
| DELETE | `/themes/:id` | Delete theme |

### Example Theme Object

```json
{
  "id": 1,
  "name": "Default Theme",
  "companyName": "Demo Company",
  "companyUrl": "https://demo.example.com",
  "theme": {
    "theme_color": "#1976d2",
    "primary_dark_color": "#1565c0",
    "extra_light_color": "#bbdefb",
    "text_color": "#000000",
    "font_family": "Roboto, Arial, sans-serif",
    "button": {
      "primary_color": "#1976d2",
      "secondary_color": "#9c27b0",
      "hover_color": "#1565c0",
      "border_color": "#cccccc"
    },
    "logos": {
      "light": "https://example.com/logo-light.png",
      "dark": "https://example.com/logo-dark.png",
      "favicon": "https://example.com/favicon.ico"
    }
  },
  "capabilities": {
    "general_app_title": "My Bank"
  }
}
```

### Create Theme Example

```bash
curl -X POST http://localhost:3001/api/v1/themes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Custom Theme",
    "companyName": "My Company",
    "companyUrl": "https://mycompany.com",
    "theme": {
      "theme_color": "#2196f3",
      "primary_dark_color": "#1976d2",
      "extra_light_color": "#bbdefb",
      "text_color": "#212121",
      "font_family": "Inter, sans-serif",
      "button": {
        "primary_color": "#2196f3",
        "secondary_color": "#ff5722",
        "hover_color": "#1976d2",
        "border_color": "#e0e0e0"
      },
      "logos": {}
    },
    "capabilities": {
      "general_app_title": "My Application"
    }
  }'
```

### Database Schema

```sql
CREATE TABLE themes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  json_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Next Steps

1. **Improve Service Layer Tests** - Increase `brandingStorage.ts` coverage from 16.12%
2. **API Integration** - Replace localStorage with backend
3. **Logo Upload** - Implement file upload functionality
4. **Multi-tenant Support** - Add organization management

## 🐛 Known Issues

- Some React 19 concurrent features may trigger `act()` warnings in tests (non-blocking)
- Font loading tests may show expected warnings in test environment
- Coverage thresholds not fully met (76.69% branches, 74.22% functions vs 80% target)
