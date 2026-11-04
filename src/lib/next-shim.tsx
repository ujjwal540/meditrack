import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

// Router context
interface RouterContextValue {
  pathname: string;
  searchParams: URLSearchParams;
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
}

const RouterContext = createContext<RouterContextValue>({
  pathname: "/",
  searchParams: new URLSearchParams(),
  push: () => {},
  replace: () => {},
  back: () => {},
});

export function AppRouterProvider({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return window.location.pathname || "/";
    }
    return "/";
  });
  const [search, setSearch] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return window.location.search || "";
    }
    return "";
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || "/");
      setSearch(window.location.search || "");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const push = (href: string) => {
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", href);
      const url = new URL(href, window.location.origin);
      setCurrentPath(url.pathname);
      setSearch(url.search);
      window.scrollTo(0, 0);
    }
  };

  const replace = (href: string) => {
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", href);
      const url = new URL(href, window.location.origin);
      setCurrentPath(url.pathname);
      setSearch(url.search);
    }
  };

  const back = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  const searchParams = useMemo(() => new URLSearchParams(search), [search]);

  return (
    <RouterContext.Provider value={{ pathname: currentPath, searchParams, push, replace, back }}>
      {children}
    </RouterContext.Provider>
  );
}

// Next.js Link replacement
export function Link({
  href,
  children,
  className,
  onClick,
  target,
  rel,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  target?: string;
  rel?: string;
  [key: string]: any;
}) {
  const router = useContext(RouterContext);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (
      !e.defaultPrevented &&
      e.button === 0 &&
      (!target || target === "_self") &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.shiftKey
    ) {
      if (href.startsWith("/") && !href.startsWith("//")) {
        e.preventDefault();
        router.push(href);
      }
    }
  };

  return (
    <a href={href} className={className} onClick={handleClick} target={target} rel={rel} {...props}>
      {children}
    </a>
  );
}

export default Link;

// Next.js navigation hooks replacement
export function usePathname(): string {
  const router = useContext(RouterContext);
  return router.pathname;
}

export function useRouter() {
  const router = useContext(RouterContext);
  return {
    push: router.push,
    replace: router.replace,
    back: router.back,
  };
}

export function useSearchParams(): URLSearchParams {
  const router = useContext(RouterContext);
  return router.searchParams;
}

// Next.js Image replacement
export function Image({
  src,
  alt = "",
  width,
  height,
  className,
  onError,
  priority,
  ...props
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  priority?: boolean;
  [key: string]: any;
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={onError}
      loading={priority ? "eager" : "lazy"}
      {...props}
    />
  );
}
