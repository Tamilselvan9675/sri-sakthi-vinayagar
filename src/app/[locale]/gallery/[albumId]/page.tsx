import { notFound } from "next/navigation";
import { getMessages } from "@/i18n/get-messages";
import { getGalleryAlbumById } from "@/lib/api/festival";
import { GalleryAlbumClient } from "@/components/festival/gallery-album-client";
import { getLocalizedField } from "@/lib/utils/locale";

export async function generateMetadata(props: { params: Promise<{ locale: string, albumId: string }> }) {
  const { locale, albumId } = await props.params;
  const album = await getGalleryAlbumById(albumId);
  
  if (!album) return { title: "Album Not Found" };

  return {
    title: getLocalizedField(album, "title", locale),
    description: getLocalizedField(album, "description", locale),
  };
}

export default async function AlbumPage(props: {
  params: Promise<{ locale: string, albumId: string }>;
}) {
  const { locale, albumId } = await props.params;
  const messages = await getMessages(locale);
  const album = await getGalleryAlbumById(albumId);

  if (!album) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 md:px-8 py-12 min-h-screen">
      <GalleryAlbumClient album={album} locale={locale} messages={messages} />
    </main>
  );
}
