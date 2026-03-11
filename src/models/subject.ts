export interface Subject {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
}
