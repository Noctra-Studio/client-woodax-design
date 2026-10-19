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
  logo?: string;
  projects: DesignClientProject[];
  testimonial?: DesignClientTestimonial;
};

export const designClients: DesignClient[] = [];
