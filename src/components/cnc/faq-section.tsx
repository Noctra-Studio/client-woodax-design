"use client";

import { RegistrationMarks } from "@/components/cnc/registration-marks";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqSection({
  title,
  items,
}: {
  title: string;
  items: readonly { id: string; question: string; answer: string }[];
}) {
  const published = items.filter((item) => item.question && item.answer);
  if (published.length === 0) return null;

  return (
    <section
      id="preguntas"
      aria-labelledby="cnc-faq-title"
      className="relative scroll-mt-[-3.5rem] px-5 py-14 md:scroll-mt-[-5rem] md:px-8 md:py-20 lg:scroll-mt-[-6rem] lg:py-24"
    >
      <RegistrationMarks edges="bottom" />
      <div className="relative mx-auto w-full max-w-[1200px]">
        <h2
          id="cnc-faq-title"
          className="max-w-[16ch] text-[clamp(1.875rem,4vw,3rem)] leading-[1.08] font-normal tracking-[-0.02em] text-balance lg:max-w-[24ch]"
        >
          {title}
        </h2>
        <Accordion
          type="single"
          collapsible
          className="border-cnc-line mt-10 border-t md:mt-14"
        >
          {published.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="border-cnc-line border-b"
            >
              <AccordionTrigger className="focus-visible:outline-cnc-white [&_svg]:text-cnc-muted text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.45] font-medium">
                {item.question}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-cnc-muted max-w-[62ch] pb-5 text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.6] font-medium text-pretty">
                  {item.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
