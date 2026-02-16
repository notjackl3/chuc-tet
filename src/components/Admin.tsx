import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Member } from '../types'

export function Admin() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    category: 'family' as 'family' | 'friends' | 'community',
    parent_id: '' as string | null,
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)

  useEffect(() => {
    fetchMembers()
  }, [])

  async function fetchMembers() {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setMembers(data || [])
    } catch (err) {
      console.error('Error fetching members:', err)
      showMessage('error', 'Failed to fetch members')
    } finally {
      setLoading(false)
    }
  }

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  function resetForm() {
    setFormData({
      name: '',
      relationship: '',
      category: 'family',
      parent_id: '',
    })
    setVideoFile(null)
    setEditingMember(null)
    setIsAdding(false)
  }

  function startEditing(member: Member) {
    setEditingMember(member)
    setIsAdding(false)
    setFormData({
      name: member.name,
      relationship: member.relationship || '',
      category: member.category,
      parent_id: member.parent_id || '',
    })
    setVideoFile(null)
  }

  function startAdding() {
    resetForm()
    setIsAdding(true)
  }

  async function uploadVideo(file: File, memberId: string): Promise<string | null> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${memberId}-${Date.now()}.${fileExt}`
    const filePath = `videos/${fileName}`

    const { error } = await supabase.storage
      .from('videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    return fileName
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setUploading(true)

    try {
      if (isAdding) {
        // Create new member
        const { data: newMember, error: insertError } = await supabase
          .from('members')
          .insert({
            name: formData.name,
            relationship: formData.relationship || null,
            category: formData.category,
            parent_id: formData.parent_id || null,
            video_filename: null,
          })
          .select()
          .single()

        if (insertError) throw insertError

        // Upload video if provided
        if (videoFile && newMember) {
          const videoFilename = await uploadVideo(videoFile, newMember.id)
          if (videoFilename) {
            await supabase
              .from('members')
              .update({ video_filename: videoFilename })
              .eq('id', newMember.id)
          }
        }

        showMessage('success', 'Member added successfully!')
      } else if (editingMember) {
        // Update existing member
        const updates: Partial<Member> = {
          name: formData.name,
          relationship: formData.relationship || null,
          category: formData.category,
          parent_id: formData.parent_id || null,
        }

        // Upload new video if provided
        if (videoFile) {
          const videoFilename = await uploadVideo(videoFile, editingMember.id)
          if (videoFilename) {
            updates.video_filename = videoFilename
          }
        }

        const { error: updateError } = await supabase
          .from('members')
          .update(updates)
          .eq('id', editingMember.id)

        if (updateError) throw updateError

        showMessage('success', 'Member updated successfully!')
      }

      await fetchMembers()
      resetForm()
    } catch (err) {
      console.error('Error saving member:', err)
      showMessage('error', 'Failed to save member')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(member: Member) {
    if (!confirm(`Are you sure you want to delete "${member.name}"? This will also delete all their photos.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', member.id)

      if (error) throw error

      showMessage('success', 'Member deleted successfully!')
      await fetchMembers()
      if (editingMember?.id === member.id) {
        resetForm()
      }
    } catch (err) {
      console.error('Error deleting member:', err)
      showMessage('error', 'Failed to delete member')
    }
  }

  function getMemberPath(member: Member): string {
    const path: string[] = [member.name]
    let current = member
    while (current.parent_id) {
      const parent = members.find(m => m.id === current.parent_id)
      if (parent) {
        path.unshift(parent.name)
        current = parent
      } else {
        break
      }
    }
    return path.join(' → ')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-400">Family Tree Admin</h1>
          <a
            href="/"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          >
            ← Back to Tree
          </a>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Member List */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Members ({members.length})</h2>
              <button
                onClick={startAdding}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-medium rounded-lg transition"
              >
                + Add Member
              </button>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {members.map(member => (
                <div
                  key={member.id}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    editingMember?.id === member.id
                      ? 'bg-yellow-500/20 border border-yellow-500'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => startEditing(member)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-400">
                        {getMemberPath(member)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {member.relationship} • {member.category}
                        {member.video_filename && ' • 🎬 Has video'}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(member)
                      }}
                      className="text-red-400 hover:text-red-300 text-sm px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Edit/Add Form */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              {isAdding ? 'Add New Member' : editingMember ? `Edit: ${editingMember.name}` : 'Select a member to edit'}
            </h2>

            {(isAdding || editingMember) && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Relationship</label>
                  <input
                    type="text"
                    value={formData.relationship}
                    onChange={e => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                    placeholder="e.g., Uncle, Aunt, Cousin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as 'family' | 'friends' | 'community' })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                  >
                    <option value="family">Family</option>
                    <option value="friends">Friends</option>
                    <option value="community">Community</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Parent (Under)</label>
                  <select
                    value={formData.parent_id || ''}
                    onChange={e => setFormData({ ...formData, parent_id: e.target.value || null })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                  >
                    <option value="">No parent (Root level)</option>
                    {members
                      .filter(m => m.id !== editingMember?.id)
                      .map(m => (
                        <option key={m.id} value={m.id}>
                          {getMemberPath(m)}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Video Greeting {editingMember?.video_filename && '(Replace existing)'}
                  </label>
                  {editingMember?.video_filename && (
                    <div className="text-sm text-gray-400 mb-2">
                      Current: {editingMember.video_filename}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="video/*"
                    onChange={e => setVideoFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-500 file:text-gray-900 file:font-medium"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-medium rounded-lg transition disabled:opacity-50"
                  >
                    {uploading ? 'Saving...' : isAdding ? 'Add Member' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {!isAdding && !editingMember && (
              <div className="text-gray-400 text-center py-12">
                Click on a member to edit, or click "Add Member" to create a new one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
