import { createFileRoute, redirect, useRouteContext } from '@tanstack/react-router'
import { BrandName } from '#/components/BrandName'
import { Settings as SettingsIcon, Users, Lock, Palette, Key, Edit2, Loader2, Link2, Info, ChevronDown } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceQueryKeys, fetchMyWorkspace, fetchWorkspaceMembers } from '#/features/workspaces/api/workspace-queries'
import { updateWorkspace } from '#/features/workspaces/actions/workspace-mutations'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { InviteModal } from '#/components/dashboard/InviteModal'
import { PricingModal } from '#/components/dashboard/PricingModal'

export const Route = createFileRoute('/_dashboard/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false)
  const queryClient = useQueryClient()
  
  const { data: workspace, isPending, error } = useQuery({
    queryKey: workspaceQueryKeys.myWorkspace(),
    queryFn: async () => {
      return await fetchMyWorkspace()
    },
  })

  const { data: members = [], isPending: isMembersPending } = useQuery({
    queryKey: workspaceQueryKeys.members(),
    queryFn: async () => {
      return await fetchWorkspaceMembers()
    },
    enabled: activeTab === 'members'
  })

  useEffect(() => {
    if (error) {
      toast.error('Failed to load workspace data')
    }
  }, [error])

  const [name, setName] = useState('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (workspace) {
      setName(workspace.name || '')
      setLogoPreview(null)
    }
  }, [workspace])

  useEffect(() => {
    const nameChanged = workspace && name !== workspace.name
    const logoChanged = logoPreview !== null
    setHasChanges(!!(nameChanged || logoChanged))
  }, [name, logoPreview, workspace])

  const updateMut = useMutation({
    mutationFn: (data: { id: string, name?: string, logoUrl?: string }) => updateWorkspace({ data }),
    onSuccess: () => {
      toast.success('Workspace updated successfully')
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.myWorkspace() })
      setHasChanges(false)
      setLogoPreview(null)
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Failed to update workspace')
    }
  })

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleLogoClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image too large. Please choose an image under 2MB.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    if (!workspace || !hasChanges) return
    if (name.trim() === '') {
      toast.error('Workspace name cannot be empty')
      return
    }
    updateMut.mutate({ 
      id: workspace.id, 
      name: name.trim(),
      ...(logoPreview && { logoUrl: logoPreview })
    })
  }

  const handleLogoEdit = () => {
    handleLogoClick()
  }
  
  return (
    <div className="flex h-[calc(100vh-80px)] max-w-7xl mx-auto w-full pt-8">
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />
      {/* Inner Settings Sidebar */}
      <div className="w-64 shrink-0 pr-8 border-r border-white/5">
        <h2 className="text-xl font-bold text-white tracking-tight mb-6">Workspace settings</h2>
        <nav className="space-y-1">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-[#4F46E5]/10 text-[#4F46E5]' : 'text-secondaryText hover:bg-bgDark2/50 hover:text-white'}`}
          >
            <SettingsIcon className="h-4.5 w-4.5" />
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('members')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'members' ? 'bg-[#4F46E5]/10 text-[#4F46E5]' : 'text-secondaryText hover:bg-bgDark2/50 hover:text-white'}`}
          >
            <Users className="h-4.5 w-4.5" />
            Members
          </button>
          <button 
            onClick={() => setActiveTab('sharing')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'sharing' ? 'bg-[#4F46E5]/10 text-[#4F46E5]' : 'text-secondaryText hover:bg-bgDark2/50 hover:text-white'}`}
          >
            <Lock className="h-4.5 w-4.5" />
            Sharing & permissions
          </button>
          <button 
            onClick={() => setActiveTab('design')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'design' ? 'bg-[#4F46E5]/10 text-[#4F46E5]' : 'text-secondaryText hover:bg-bgDark2/50 hover:text-white'}`}
          >
            <Palette className="h-4.5 w-4.5" />
            Design
          </button>
          
          <div className="my-4 border-t border-white/5" />
          
          <button 
            onClick={() => setActiveTab('apikeys')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'apikeys' ? 'bg-[#4F46E5]/10 text-[#4F46E5]' : 'text-secondaryText hover:bg-bgDark2/50 hover:text-white'}`}
          >
            <Key className="h-4.5 w-4.5" />
            My API keys
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pl-12">
        {activeTab === 'overview' && (
          <div className="max-w-3xl space-y-12 pb-12">
            
            <section>
              <h3 className="text-sm font-bold text-[#4F46E5] uppercase tracking-wider mb-8">Basic Info</h3>
              
              {isPending ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-[#4F46E5] h-10 w-10" />
                </div>
              ) : (
                <div className="space-y-10">
                  {/* Logo Edit */}
                  <div className="flex items-center justify-between group">
                    <div className="max-w-md">
                      <h4 className="text-base font-semibold text-white">Workspace logo</h4>
                      <p className="text-sm text-secondaryText mt-1">This logo will appear in your workspace switcher and shared links.</p>
                    </div>
                    <div className="relative group cursor-pointer" onClick={handleLogoEdit}>
                      <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[#4F46E5]/50 transition-colors bg-bgDark2 flex items-center justify-center shadow-2xl">
                        {(logoPreview || workspace?.logoUrl) ? (
                          <img src={logoPreview || workspace?.logoUrl || ''} alt="Logo" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-[#5865F2] to-[#4F46E5] text-white flex items-center justify-center text-3xl font-bold">
                            {workspace?.name ? workspace.name.substring(0, 1).toUpperCase() : 'W'}
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-white text-bgDark1 p-2 rounded-full shadow-xl hover:bg-[#4F46E5] hover:text-white transition-all transform hover:scale-110">
                        <Edit2 className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-px w-full bg-white/5" />

                  {/* Name Edit */}
                  <div className="flex flex-col gap-6">
                    <div className="flex items-start justify-between">
                      <div className="max-w-md">
                        <h4 className="text-base font-semibold text-white">Workspace name</h4>
                        <p className="text-sm text-secondaryText mt-1">Changing this will update the name for all members of the workspace.</p>
                      </div>
                      <div className="w-[340px]">
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave()
                          }}
                          placeholder="Workspace Name"
                          className="w-full bg-bgDark2/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/50 transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button 
                        onClick={handleSave}
                        disabled={!hasChanges || updateMut.isPending}
                        className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${
                          hasChanges 
                            ? 'bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white shadow-[#4F46E5]/20 transform hover:-translate-y-0.5 active:scale-95' 
                            : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                        }`}
                      >
                        {updateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Upgrade Banner */}
            <section className="pt-8">
              <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-3xl p-10 flex items-center justify-between shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#4F46E5] opacity-10 blur-[100px] -mr-32 -mt-32 transition-opacity group-hover:opacity-20" />
                <div className="relative z-10 flex-1">
                  <div className="inline-flex items-center gap-2 bg-[#4F46E5]/20 text-[#4F46E5] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                    Pro Plan
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Upgrade your workspace</h3>
                  <p className="text-secondaryText text-sm max-w-md leading-relaxed">
                    Get access to Claude 3.5 Sonnet, GPT-4o, unlimited folders, and remove the <BrandName /> watermark from your exports.
                  </p>
                </div>
                <button className="relative z-10 bg-white text-bgDark1 hover:bg-[#4F46E5] hover:text-white px-8 py-3.5 rounded-full font-bold shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 whitespace-nowrap ml-8">
                  Upgrade Now
                </button>
              </div>
              <div className="mt-6 flex items-center justify-between text-[10px] text-secondaryText font-medium px-4">
                <span>Build version: v1.0.4-stable</span>
                <div className="flex items-center gap-4">
                  <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                </div>
              </div>
            </section>
            
          </div>
        )}
        
        {activeTab === 'members' && (
          <div className="max-w-4xl pb-12">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Workspace members</h3>
                <p className="text-sm text-secondaryText mt-1">Manage who has access to this workspace and thair roles.</p>
              </div>
              <button 
                onClick={() => setIsInviteModalOpen(true)}
                className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#4F46E5]/20 transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                Invite members
              </button>
            </div>

            {isMembersPending ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-[#4F46E5] h-10 w-10" />
              </div>
            ) : (
              <div className="bg-bgDark1/50 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <div className="grid grid-cols-[1fr,auto] gap-4 p-4 border-b border-white/5 bg-white/5 text-[10px] font-bold text-secondaryText uppercase tracking-widest">
                  <span>Member</span>
                  <span className="pr-12">Role</span>
                </div>
                <div className="divide-y divide-white/5">
                  {members.map((member: any) => (
                    <div key={member.id} className="grid grid-cols-[1fr,auto] gap-4 p-6 items-center hover:bg-white/5 transition-colors group">
                      <div className="flex items-center gap-4">
                        <Avatar size="lg" className="border-2 border-white/5 group-hover:border-[#4F46E5]/50 transition-colors">
                          <AvatarImage src={member.user?.image || ''} />
                          <AvatarFallback className="bg-bgDark2 text-white font-bold">
                            {member.user?.name?.substring(0, 1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-bold text-white">{member.user?.name}</div>
                          <div className="text-xs text-secondaryText">{member.user?.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                          member.role === 'OWNER' 
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                            : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                        }`}>
                          {member.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'sharing' && (
          <div className="max-w-4xl pb-12">
            <div className="mb-10">
              <h3 className="text-xl font-bold text-white tracking-tight">Sharing & permissions</h3>
              <p className="text-sm text-secondaryText mt-1">Configure default sharing settings for new presentations.</p>
            </div>

            <div className="space-y-12">
              {/* Workspace Sharing */}
              <section>
                <div className="flex flex-col gap-2 mb-6">
                  <h4 className="text-base font-semibold text-white">Workspace sharing</h4>
                  <p className="text-sm text-secondaryText">Allows workspace members to share presentations with everyone in the workspace.</p>
                </div>
                
                <div className="bg-bgDark1/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center text-secondaryText group-hover:text-white transition-colors">
                      <Users className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-white/90">Default workspace sharing permission for new presentations</span>
                  </div>
                  <div className="relative">
                    <select 
                      value={workspace?.defaultWorkspaceSharing || 'NO_ACCESS'}
                      onChange={(e) => {
                        if (workspace) {
                          updateMut.mutate({ id: workspace.id, defaultWorkspaceSharing: e.target.value })
                        }
                      }}
                      className="appearance-none bg-white/5 hover:bg-white/10 px-8 py-2 rounded-xl text-xs font-bold text-white transition-all border border-white/5 focus:outline-none cursor-pointer"
                    >
                      <option value="NO_ACCESS">No access</option>
                      <option value="VIEW">Can view</option>
                      <option value="EDIT">Can edit</option>
                    </select>
                    <ChevronDown className="h-3 w-3 text-secondaryText absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </section>

              {/* Link Sharing */}
              <section>
                <div className="flex flex-col gap-2 mb-6">
                  <h4 className="text-base font-semibold text-white">Link sharing</h4>
                  <p className="text-sm text-secondaryText">Allows workspace members to make presentations viewable by anyone with the link.</p>
                </div>
                
                <div className="bg-bgDark1/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center text-secondaryText group-hover:text-white transition-colors">
                      <Link2 className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-white/90">Default link sharing permission for new presentations</span>
                  </div>
                  <div className="relative">
                    <select 
                      value={workspace?.defaultLinkSharing || 'VIEW'}
                      onChange={(e) => {
                        if (workspace) {
                          updateMut.mutate({ id: workspace.id, defaultLinkSharing: e.target.value })
                        }
                      }}
                      className="appearance-none bg-white/5 hover:bg-white/10 px-8 py-2 rounded-xl text-xs font-bold text-white transition-all border border-white/5 focus:outline-none cursor-pointer"
                    >
                      <option value="OFF">Off</option>
                      <option value="VIEW">Can view</option>
                      <option value="EDIT">Can edit</option>
                    </select>
                    <ChevronDown className="h-3 w-3 text-secondaryText absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </section>

              {/* Site Creation */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h4 className="text-base font-semibold text-white">Site creation</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${workspace?.siteCreationEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {workspace?.siteCreationEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4 text-secondaryText" />
                    <div 
                      onClick={() => {
                        if (workspace) {
                          updateMut.mutate({ id: workspace.id, siteCreationEnabled: !workspace.siteCreationEnabled })
                        }
                      }}
                      className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${workspace?.siteCreationEnabled ? 'bg-[#4F46E5] shadow-lg shadow-[#4F46E5]/20' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-0.5 h-4 w-4 bg-white rounded-full transition-all ${workspace?.siteCreationEnabled ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-secondaryText leading-relaxed">
                  Allows workspace members to create websites. Disabling this prevents new sites from being created but existing sites remain live.
                </p>
              </section>

              {/* Info Alert */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-4">
                <div className="h-8 w-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-500 shrink-0">
                  <span className="text-xs">i</span>
                </div>
                <p className="text-xs text-indigo-100/70 font-medium">
                  These defaults apply to new presentations only. Existing presentations won't be affected.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'design' && (
          <div className="max-w-4xl pb-12">
            <div className="mb-10">
              <h3 className="text-xl font-bold text-white tracking-tight">Design</h3>
              <p className="text-sm text-secondaryText mt-1">Customize the default appearance of your presentations.</p>
            </div>

            <div className="space-y-12">
              <section>
                <div className="flex flex-col gap-2 mb-8">
                  <h4 className="text-base font-semibold text-white">Workspace default theme</h4>
                  <p className="text-sm text-secondaryText">This theme will be the default for all presentations created in this workspace.</p>
                </div>
                
                <div className="bg-bgDark1/50 border border-white/5 rounded-[32px] p-6 flex items-center justify-between group hover:border-white/10 transition-all">
                  <div className="flex items-center gap-6">
                    {/* Theme Preview Card */}
                    <div className={`w-32 h-20 rounded-xl border border-white/10 flex flex-col p-2 gap-1.5 shadow-2xl transition-colors ${
                      (workspace?.defaultTheme || 'light') === 'light' ? 'bg-white' : (workspace?.defaultTheme === 'dark' ? 'bg-bgDark2' : 'bg-[#4F46E5]')
                    }`}>
                      <div className={`h-2 w-12 rounded-full ${
                        (workspace?.defaultTheme || 'light') === 'light' ? 'bg-bgDark2/20' : 'bg-white/20'
                      }`} />
                      <div className={`h-1.5 w-full rounded-full ${
                        (workspace?.defaultTheme || 'light') === 'light' ? 'bg-bgDark2/10' : 'bg-white/10'
                      }`} />
                      <div className={`h-1.5 w-2/3 rounded-full ${
                        (workspace?.defaultTheme || 'light') === 'light' ? 'bg-bgDark2/10' : 'bg-white/10'
                      }`} />
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">
                        {(workspace?.defaultTheme || 'light') === 'light' ? 'Basic Light' : (workspace?.defaultTheme === 'dark' ? 'Basic Dark' : 'SlideFlow Blue')}
                      </span>
                      <span className="text-xs text-secondaryText mt-0.5">Clean and professional</span>
                    </div>
                  </div>

                  <div className="relative">
                    <select 
                      value={workspace?.defaultTheme || 'light'}
                      onChange={(e) => {
                        if (workspace) {
                          updateMut.mutate({ id: workspace.id, defaultTheme: e.target.value })
                        }
                      }}
                      className="appearance-none bg-white/5 hover:bg-white/10 px-10 py-3 rounded-2xl text-xs font-bold text-white transition-all border border-white/5 focus:outline-none cursor-pointer pr-12"
                    >
                      <option value="light">Basic Light</option>
                      <option value="dark">Basic Dark</option>
                      <option value="blue">SlideFlow Blue</option>
                    </select>
                    <ChevronDown className="h-4 w-4 text-secondaryText absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
        
        {activeTab === 'apikeys' && (
          <div className="max-w-4xl pb-12">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-xl font-bold text-white tracking-tight">My API keys</h3>
              <span className="bg-[#4F46E5]/20 text-[#4F46E5] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-[#4F46E5]/30">Pro</span>
            </div>
            <p className="text-sm text-secondaryText mb-10 max-w-2xl leading-relaxed">
              Your <BrandName /> API keys are used to access the <BrandName /> API on your own behalf. You will be the creator of presentations made with the API. Check out the <a href="#" className="text-[#4F46E5] font-bold hover:underline">API documentation</a> for more information and how to use it.
            </p>

            {workspace?.tier === 'FREE' ? (
              <div className="bg-gradient-to-r from-[#4F46E5]/5 to-transparent border border-[#4F46E5]/30 rounded-2xl p-8 flex items-center justify-between shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#4F46E5]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <h4 className="text-lg font-bold text-white mb-1">Unlock API access with Pro</h4>
                  <p className="text-sm text-secondaryText">Integrate <BrandName /> with your favorite tools.</p>
                </div>
                <button 
                  onClick={() => setIsPricingModalOpen(true)}
                  className="relative z-10 bg-white text-bgDark1 hover:bg-[#4F46E5] hover:text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95"
                >
                  Upgrade to Pro
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 border-2 border-dashed border-white/5 rounded-3xl text-secondaryText text-sm">
                No API keys generated yet.
              </div>
            )}
          </div>
        )}
      </div>

      <InviteModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceName={workspace?.name || 'Your Workspace'}
      />

      <PricingModal 
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
      />
    </div>
  )
}
