import { isProductionDeploy } from "@/lib/deploy-env";

export type DesignClientTestimonial = {
  quote: string;
  author: string;
  role: string;
  approved: true;
};

export type DesignClientProject = {
  title: { es: string; en: string };
  image: {
    src: string;
    width: number;
    height: number;
    alt: { es: string; en: string };
  };
};

export type DesignClient = {
  name: string;
  placeholder: boolean;
  logo?: string;
  projects: DesignClientProject[];
  testimonial?: DesignClientTestimonial;
};

export const designClients: DesignClient[] = [
  {
    name: "[CLIENTE 1]",
    placeholder: true,
    projects: [],
  },
];

export function isDesignClientsPublished(clients: DesignClient[]): boolean {
  const named = clients.filter((client) => client.name.trim().length > 0);
  if (named.length === 0) return false;
  if (isProductionDeploy()) {
    return named.some((client) => !client.placeholder);
  }
  return true;
}

export function visibleDesignClients(clients: DesignClient[]): DesignClient[] {
  return clients.filter((client) => {
    if (client.name.trim().length === 0) return false;
    if (isProductionDeploy() && client.placeholder) return false;
    return true;
  });
}
