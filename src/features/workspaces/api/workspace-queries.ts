import { getMyWorkspace, getWorkspaceMembers } from '../actions/workspace-mutations'

export const workspaceQueryKeys = {
  all: ['workspaces'] as const,
  myWorkspace: () => [...workspaceQueryKeys.all, 'my'] as const,
  members: () => [...workspaceQueryKeys.all, 'members'] as const,
}

export const fetchMyWorkspace = async () => {
  return await getMyWorkspace()
}

export const fetchWorkspaceMembers = async () => {
  return await getWorkspaceMembers()
}
