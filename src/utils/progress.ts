export const PROGRESS_BY_STATUS: Record<string, number> = {
  assigned: 10,
  in_progress: 50,
  pending_review: 75,
  revision: 85,
  delivered: 95,
  completed: 100,
  approved: 100,
};

export const calculateProgress = (status: string): number =>
  PROGRESS_BY_STATUS[status] ?? 0;


