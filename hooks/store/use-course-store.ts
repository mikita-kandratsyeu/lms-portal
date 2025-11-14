import { create } from 'zustand';

type CourseStore = {
  categoryIds: string[];
  removeCategoryId: (id: string) => void;
  resetCategoryIds: () => void;
  setCategoryId: (id: string) => void;
};

export const useCourseStore = create<CourseStore>((set) => ({
  categoryIds: [],
  removeCategoryId: (id) =>
    set((state) => ({ categoryIds: state.categoryIds.filter((categoryId) => categoryId !== id) })),
  resetCategoryIds: () => set({ categoryIds: [] }),
  setCategoryId: (id) => set((state) => ({ categoryIds: [...state.categoryIds, id] })),
}));
