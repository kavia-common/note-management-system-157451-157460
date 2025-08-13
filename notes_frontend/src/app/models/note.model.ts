export interface Note {
  id?: string;
  title: string;
  content: string;
  /**
   * Optional timestamp fields for display purposes.
   */
  createdAt?: string;
  updatedAt?: string;

  /**
   * Optional client-side attributes for filtering/tags.
   * These may be provided by backend or used solely on the frontend.
   */
  starred?: boolean;
  tags?: string[];
}
