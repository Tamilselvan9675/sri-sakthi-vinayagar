import Image from "next/image";
import { getMessages } from "@/i18n/get-messages";
import { TempleDivider } from "@/components/ui/temple-divider";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

export default async function StoryPage(props: PageProps<"/[locale]/story">) {
  const { locale } = await props.params;
  const messages = await getMessages(locale);

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 lg:py-24 max-w-4xl">
        
        <AnimateOnScroll>
          <div className="text-center space-y-6 mb-16">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground text-balance">
              {messages.pages.storyTitle}
            </h1>
            <p className="text-lg text-muted-foreground">
              {messages.pages.storyDesc}
            </p>
            <TempleDivider variant="gold" className="pt-4" />
          </div>
        </AnimateOnScroll>

        <article className="prose prose-lg dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-p:leading-relaxed prose-p:text-muted-foreground mx-auto">
          
          <AnimateOnScroll animation="fade-up">
            <div className="float-none md:float-right md:ml-8 md:mb-6 mb-8 w-full md:w-80 rounded-2xl overflow-hidden border-2 border-primary/10 shadow-lg">
              <Image 
                src="/images/hero-vinayagar.jpg" 
                alt="Lord Vinayagar" 
                width={320} 
                height={400} 
                className="w-full h-auto object-cover"
              />
            </div>
            <h2 className="text-2xl sm:text-3xl text-foreground mb-4">{messages.story.birth}</h2>
            <p className="mb-8">{messages.story.birthContent}</p>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up">
            <h2 className="text-2xl sm:text-3xl text-foreground mt-12 mb-4">{messages.story.significance}</h2>
            <p className="mb-8">{messages.story.significanceContent}</p>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up">
            <h2 className="text-2xl sm:text-3xl text-foreground mt-12 mb-4">{messages.story.symbolism}</h2>
            <p className="mb-8">{messages.story.symbolismContent}</p>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up">
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-8 my-12 text-center">
              <p className="text-xl font-display font-medium italic text-primary m-0">
                &quot;{messages.story.devotionContent}&quot;
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up">
            <h2 className="text-2xl sm:text-3xl text-foreground mt-12 mb-4">{messages.story.cultural}</h2>
            <p className="mb-8">{messages.story.culturalContent}</p>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up">
            <h2 className="text-2xl sm:text-3xl text-foreground mt-12 mb-4">{messages.story.chaturthi}</h2>
            <p className="mb-8">{messages.story.chaturthiContent}</p>
          </AnimateOnScroll>

        </article>
      </div>
    </main>
  );
}
