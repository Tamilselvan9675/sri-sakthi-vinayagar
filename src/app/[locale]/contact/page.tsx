import { getMessages } from "@/i18n/get-messages";
import { SectionHeader } from "@/components/ui/section-header";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const messages = await getMessages(locale);
  
  return {
    title: messages.common.contact,
  };
}

export default async function ContactPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const messages = await getMessages(locale);
  
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 lg:py-24 max-w-7xl">
        
        <AnimateOnScroll>
          <div className="text-center space-y-4 mb-16">
            <SectionHeader
              title={messages.common.contact}
              subtitle="We welcome you to visit the temple or reach out to us for any inquiries."
              icon={MapPin}
              align="center"
            />
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          <AnimateOnScroll animation="fade-up" delay={100}>
            <div className="space-y-8">
              <Card className="border border-border/50 shadow-lg bg-card">
                <CardContent className="p-8 md:p-10 space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Temple Address</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Sri Sakthi Vinayagar Temple<br />
                        123 Temple Street, Main Road<br />
                        Chennai, Tamil Nadu 600001<br />
                        India
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Contact Numbers</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Temple Office: +91 44 2345 6789<br />
                        Trustee: +91 98765 43210
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Temple Timings</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Morning: 6:00 AM - 11:30 AM<br />
                        Evening: 4:30 PM - 8:30 PM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Email</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        info@sakthivinayagar.org
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button className="flex-1 py-6 rounded-xl text-lg gap-2" variant="default">
                  <Send className="h-5 w-5" />
                  Message on WhatsApp
                </Button>
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="slide-left" delay={200}>
            <div className="bg-card rounded-3xl overflow-hidden border border-border/50 shadow-lg h-[600px] relative">
              {/* Fallback styling for the iframe area if map doesn't load */}
              <div className="absolute inset-0 bg-muted flex items-center justify-center -z-10">
                <MapPin className="h-16 w-16 text-muted-foreground/30" />
              </div>
              
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124376.10444390317!2d80.11326466986561!3d13.047806527584109!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5265ea4f7d3361%3A0x6e61a70b6863d433!2sChennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1709403482701!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </AnimateOnScroll>

        </div>
      </div>
    </main>
  );
}
