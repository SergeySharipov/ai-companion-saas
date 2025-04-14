"use client"

import { create } from "zustand";

type SubscriptionState = {
  isPro: boolean;
  setIsPro: (value: boolean) => void;
};

const useSubscriptionStore = create<SubscriptionState>((set) => ({
  isPro: false, // default value
  setIsPro: (value) => set({ isPro: value }),
}));

export const useIsPro = () => useSubscriptionStore((state) => state.isPro);

export const useSetIsPro = () =>
  useSubscriptionStore((state) => state.setIsPro);
