import { create } from "zustand";

export type WorkspaceViewMode = "chat" | "office" | "mindmap" | "pipeline";

export interface WorkspaceViewState {
  activeView: WorkspaceViewMode;
  setActiveView: (view: WorkspaceViewMode) => void;
  selectedAgentId: string;
  setSelectedAgentId: (id: string) => void;
  isTeamBarVisible: boolean;
  setTeamBarVisible: (visible: boolean) => void;
}

export const useWorkspaceViewStore = create<WorkspaceViewState>((set) => ({
  activeView: "chat",
  setActiveView: (view) => set({ activeView: view }),
  selectedAgentId: "zeus",
  setSelectedAgentId: (id) => set({ selectedAgentId: id }),
  isTeamBarVisible: true,
  setTeamBarVisible: (visible) => set({ isTeamBarVisible: visible }),
}));
