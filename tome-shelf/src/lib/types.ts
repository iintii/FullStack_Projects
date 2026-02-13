export interface GoogleBookVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail: string;
      smallThumbnail: string;
    };
    industryIdentifiers?: { type: string; identifier: string }[];
    publishedDate?: string;
    categories?: string[];
    pageCount?: number; // <--- ADD THIS LINE
  };
}

export interface SearchResult {
  items: GoogleBookVolume[];
  totalItems: number;
}
