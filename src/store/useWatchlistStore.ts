import { create } from 'zustand';

interface WatchlistState {
  watchlist: string[]; // Array of asset IDs
  addToWatchlist: (assetId: string) => void;
  removeFromWatchlist: (assetId: string) => void;
  isInWatchlist: (assetId: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  watchlist: [],
  
  addToWatchlist: (assetId: string) => {
    const { watchlist } = get();
    if (!watchlist.includes(assetId)) {
      set({ watchlist: [...watchlist, assetId] });
    }
  },
  
  removeFromWatchlist: (assetId: string) => {
    const { watchlist } = get();
    set({ watchlist: watchlist.filter(id => id !== assetId) });
  },
  
  isInWatchlist: (assetId: string) => {
    return get().watchlist.includes(assetId);
  }
}));