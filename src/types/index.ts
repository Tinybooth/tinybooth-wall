export interface EventTheme {
  buttonColor: string;
  secondaryButtonColor: string;
  textColor: string;
  subtextColor: string;
  backgroundColor: string;
}

export interface EventSettings {
  theme: EventTheme;
  allowChooseFromLibrary: boolean;
  allowVideo: boolean;
  allowCaptions: boolean;
  maxPhotosPerPost: number;
  slideShowSpeed: number;
}

export const DEFAULT_EVENT_SETTINGS: EventSettings = {
  theme: {
    buttonColor: "#7c3aed",
    secondaryButtonColor: "#333333",
    textColor: "#fafafa",
    subtextColor: "#aaaaaa",
    backgroundColor: "#0a0a0a",
  },
  allowChooseFromLibrary: true,
  allowVideo: true,
  allowCaptions: true,
  maxPhotosPerPost: 10,
  slideShowSpeed: 3.5,
};

export interface Event {
  id: string;
  name: string;
  slug: string;
  settings: EventSettings;
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

export type MediaType = "image" | "video";

export interface Photo {
  id: string;
  url: string;
  mediaType: MediaType;
  width: number;
  height: number;
  order: number;
  dateCreated: string;
}

export type PostFlowState =
  | "WELCOME"
  | "CAPTURE"
  | "PREVIEW"
  | "UPLOADING";
