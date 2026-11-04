declare module "next" {
  export type Metadata = any;
  export type Viewport = any;
  export type NextConfig = any;
}

declare module "next/link" {
  import React from "react";
  const Link: React.FC<any>;
  export default Link;
}

declare module "next/image" {
  import React from "react";
  export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    priority?: boolean;
  }
  const Image: React.FC<ImageProps>;
  export default Image;
}

declare module "next/navigation" {
  export function usePathname(): string;
  export function useRouter(): {
    push: (url: string) => void;
    replace: (url: string) => void;
    back: () => void;
  };
  export function useSearchParams(): URLSearchParams;
}

declare module "next/server" {
  export class NextResponse {
    static next(init?: any): any;
    static json(body: any, init?: any): any;
  }
  export type NextRequest = any;
}

declare module "next/headers" {
  export function cookies(): Promise<any>;
}

declare module "web-push" {
  const webpush: any;
  export default webpush;
}
