export interface Event {
  id: string;
  name: string;
  slug: string;
  dateCreated: string;
  posts: Post[];
}

export interface Post {
  id: string;
  eventId?: string;
  caption: string | null;
  dateCreated: string;
  photos: Photo[];
}

export interface Photo {
  id: string;
  url: string;
  order: number;
  dateCreated: string;
}

export type PostFlowState =
  | "WELCOME"
  | "CAPTURE"
  | "PREVIEW"
  | "UPLOADING";
