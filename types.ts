export interface Product {
  id: string;
  name: string;
  imageId: string; // Changed from 'image' which was a base64 string
  isActive: boolean;
}

export type Background =
  | { type: 'color'; value: string }
  | { type: 'image'; imageId: string };

export interface Group {
  id: string;
  name: string;
  products: Product[];
  background?: Background;
  themeId?: string;
}

export interface FontStyle {
  family: string;
  size: number;
  weight: 'normal' | 'bold';
  style: 'normal' | 'italic';
}

export interface ThemeStyles {
  backgroundColor: string;
  titleFont: FontStyle;
  titleColor: string;
  captionFont: FontStyle;
  captionColor: string;
  shadowColor: string;
}

export interface Theme {
  id: string;
  name: string;
  isCustom?: boolean;
  styles: ThemeStyles;
}
