// Client component: renders a public profile with owner-only editing.
'use client';

import {
  Avatar,
  Box,
  Button,
  Divider,
  FormHelperText,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  IconButton,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { Header, PrimitiveModal } from '@helix-ai/ui';
import { headerProps } from '../../../../content/header';
import { Sex } from '@helix-ai/db/enums/sex.enum';
import { Gender } from '@helix-ai/db/enums/gender.enum';

// Simple helpers reused across hooks
const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const looksLikeHandle = (value: string) => /^[a-zA-Z0-9_-]{3,}$/.test(value);
const sexLabel = (value: number | null | undefined) =>
  typeof value === 'number' ? Sex[value] ?? '—' : '—';
const genderLabel = (value: number | null | undefined) =>
  typeof value === 'number' ? Gender[value] ?? '—' : '—';

type Profile = {
  id: string;
  user: string;
  handle: string;
  avatarUrl?: string | null;
  bio?: string | null;
  links?: Record<string, unknown> | null;
  sex?: number | null;
  gender?: number | null;
};

export default function ProfilePage() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId;
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{
    handle: string;
    avatarUrl: string;
    bio: string;
    links: { label: string; url: string }[];
    sex: string;
    gender: string;
  }>({
    handle: '',
    avatarUrl: '',
    bio: '',
    links: [{ label: '', url: '' }],
    sex: '',
    gender: '',
  });

  // Always use the Next.js proxy to stay same-origin and avoid CORS.
  const userServiceBase = '/user-service';

  const sessionUserId = (session?.user as { id?: string } | undefined)?.id;
  const sessionEmail = session?.user?.email;

  // Choose the best candidate user id for operations that require a UUID.
  const targetUserId = useMemo(() => {
    if (profile?.user && isUuid(profile.user)) return profile.user;
    if (sessionUserId && isUuid(sessionUserId)) return sessionUserId;
    if (userId && isUuid(userId)) return userId;
    return null;
  }, [profile?.user, sessionUserId, userId]);

  // Load the profile and populate the edit form; resilient to id/handle mismatches.
  useEffect(() => {
    if (!userId) return null;
    const controller = new AbortController();

    // Fetch by userId (UUID expected)
    const fetchProfileById = async (id: string) => {
      const res = await fetch(`${userServiceBase}/user-profile/${id}`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(
          `Profile fetch failed (${res.status} ${res.statusText || ''})`.trim(),
        );
      }

      return (await res.json()) as Profile;
    };

    // Fallback: fetch by handle when the route param is not a UUID
    const fetchProfileByHandleFallback = async (handle: string) => {
      const res = await fetch(
        `${userServiceBase}/user-profile/handle/${encodeURIComponent(handle)}`,
        { signal: controller.signal },
      );

      if (res.status === 404) {
        throw new Error('Profile handle not found');
      }
      if (!res.ok) {
        throw new Error(
          `Profile handle fetch failed (${res.status} ${res.statusText || ''})`.trim(),
        );
      }

      return (await res.json()) as Profile;
    };

    // Last resort: resolve a user by email, then hydrate via id/profile
    const fetchProfileByEmail = async (email: string) => {
      const res = await fetch(
        `${userServiceBase}/users/email/${encodeURIComponent(email.toLowerCase())}`,
        { signal: controller.signal },
      );

      if (res.status === 404) {
        throw new Error('User not found by email');
      }
      if (!res.ok) {
        throw new Error(
          `User lookup failed (${res.status} ${res.statusText || ''})`.trim(),
        );
      }

      const userData = (await res.json()) as { id: string; profile?: Profile };
      if (userData?.profile) {
        return userData.profile as Profile;
      }

      return fetchProfileById(userData.id);
    };

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const attempts: Array<{ name: string; fn: () => Promise<Profile> }> = [];
        const addAttempt = (name: string, fn: () => Promise<Profile>) => {
          if (!attempts.some((a) => a.name === name)) attempts.push({ name, fn });
        };

        // Prefer the signed-in user first so owners see their profile even if the URL slug is off.
        if (sessionUserId && isUuid(sessionUserId)) {
          addAttempt('session-id', () => fetchProfileById(sessionUserId));
        }
        if (sessionEmail) addAttempt('session-email', () => fetchProfileByEmail(sessionEmail));

        // For a UUID slug, use id lookup; otherwise only try handle if it resembles a handle (skip pure numeric ids).
        if (isUuid(userId)) {
          addAttempt('param-id', () => fetchProfileById(userId));
        } else if (looksLikeHandle(userId)) {
          addAttempt('param-handle', () => fetchProfileByHandleFallback(userId));
        }

        let profileData: Profile | null = null;
        const attemptErrors: string[] = [];

        // Execute attempts in order until one succeeds.
        for (const attempt of attempts) {
          try {
            profileData = await attempt.fn();
            break;
          } catch (err: any) {
            if (controller.signal.aborted) return;
            const attemptMessage =
              err?.name === 'TypeError'
                ? 'Network error while contacting the user service'
                : err?.message ?? 'Unknown profile fetch error';
            attemptErrors.push(`${attempt.name}: ${attemptMessage}`);
          }
        }

        if (!profileData) {
          setError('Profile not found.');
          return;
        }

        setProfile(profileData);
        setForm({
          handle: profileData.handle ?? '',
          avatarUrl: profileData.avatarUrl ?? '',
          bio: profileData.bio ?? '',
          links:
            profileData.links && typeof profileData.links === 'object'
              ? Object.entries(profileData.links as Record<string, string>).map(([label, url]) => ({
                  label,
                  url,
                }))
              : [{ label: '', url: '' }],
          sex:
            profileData.sex !== undefined && profileData.sex !== null
              ? String(profileData.sex)
              : '',
          gender:
            profileData.gender !== undefined && profileData.gender !== null
              ? String(profileData.gender)
              : '',
        });
      } catch (err: any) {
        if (controller.signal.aborted) return;
        const defaultMessage = 'Unable to load profile. Please try again shortly.';
        if (err?.name === 'TypeError') {
          setError('Network error while contacting the user service.');
        } else {
          setError(err?.message && typeof err.message === 'string' && err.message.trim().length > 0 ? err.message : defaultMessage);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [userId, userServiceBase, session?.user?.email]);

  // Determine if the current session user owns this profile.
  const isOwner = useMemo(() => {
    const sessionId = (session?.user as { id?: string } | undefined)?.id;
    const sessionEmail = session?.user?.email?.toLowerCase();
    const routeId = userId ?? '';

    // Direct matches: profile.user, route param, or both.
    if (sessionId && profile?.user && sessionId === profile.user) return true;
    if (sessionId && routeId && sessionId === routeId) return true;
    if (profile?.user && routeId && profile.user === routeId) return true;

    // Handle/email fallback: allow owners whose handle matches their email prefix.
    if (sessionEmail && profile?.handle) {
      const handleMatch = profile.handle.toLowerCase() === sessionEmail.split('@')[0];
      if (handleMatch) return true;
    }

    return false;
  }, [session?.user, profile?.user, profile?.handle, userId]);
  const [editOpen, setEditOpen] = useState(false);

  // Prefer real name (profile first/last or session name), then handle, then email fallback.
  const displayName = useMemo(() => {
    const profileName = [profile?.firstName, profile?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    if (profileName) return profileName;
    if (session?.user?.name) return session.user.name;
    if (profile?.handle) return profile.handle;
    if (session?.user?.email) return session.user.email.split('@')[0];
    return 'Profile';
  }, [profile?.firstName, profile?.lastName, profile?.handle, session?.user]);

  // Avatar prefers profile image, then session image, then a fallback icon.
  const avatarUrl = profile?.avatarUrl ?? session?.user?.image ?? '/favicon.ico';
  const bio = profile?.bio ?? 'No bio yet.';
  type Section = 'overview' | 'settings' | 'security' | 'connections';
  const [activeSection, setActiveSection] = useState<Section>('overview');

  // Generic handler to update simple text fields on the form.
  const handleChange =
    (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  // Sync the edit form with the latest profile state.
  const resetFormFromProfile = () => {
    if (!profile) return;
    setForm({
      handle: profile.handle ?? '',
      avatarUrl: profile.avatarUrl ?? '',
      bio: profile.bio ?? '',
      links:
        profile.links && typeof profile.links === 'object'
          ? Object.entries(profile.links as Record<string, string>).map(([label, url]) => ({
              label,
              url,
            }))
          : [{ label: '', url: '' }],
      sex: profile.sex !== undefined && profile.sex !== null ? String(profile.sex) : '',
      gender: profile.gender !== undefined && profile.gender !== null ? String(profile.gender) : '',
    });
  };

  // Persist profile changes (owner-only).
  const handleSave = async () => {
    if (!isOwner) return;
    if (!targetUserId) {
      setError('Cannot save: profile id is not resolved yet.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const linksObj =
        form.links
          .filter((l) => l.label.trim() && l.url.trim())
          .reduce<Record<string, string>>((acc, cur) => {
            acc[cur.label.trim()] = cur.url.trim();
            return acc;
          }, {}) || undefined;

      const res = await fetch(`${userServiceBase}/user-profile/${targetUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: form.handle || undefined,
          avatarUrl: form.avatarUrl || undefined,
          bio: form.bio || undefined,
          links: linksObj,
          sex: form.sex !== '' ? Number(form.sex) : undefined,
          gender: form.gender !== '' ? Number(form.gender) : undefined,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Save failed: ${res.status} ${text}`);
      }

      const updated = (await res.json()) as Profile;
      setProfile(updated);
      resetFormFromProfile();
      setEditOpen(false);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Header {...headerProps} pages={headerProps.pages} />
      <main className="flex-grow pt-20 sm:pt-24 md:pt-28 lg:pt-32 xl:pt-32 px-4 md:px-8">
        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            px: 1,
            py: 4,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '320px 1fr' },
            gap: 3,
          }}
        >
          {/* Sidebar */}
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Avatar alt="Profile avatar" src={avatarUrl || ''} sx={{ width: 120, height: 120, mb: 1 }} />
            <Typography variant="h6" fontWeight={700}>
              {displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isOwner ? session?.user?.email ?? '—' : ''}
            </Typography>
            <Divider flexItem sx={{ my: 2, width: '100%' }} />
            <List dense sx={{ width: '100%' }}>
              {[
                { label: 'Profile Overview', id: 'overview' as Section },
                { label: 'Settings', id: 'settings' as Section },
                { label: 'Security', id: 'security' as Section },
                { label: 'Connections', id: 'connections' as Section },
              ].map((item) => (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton
                    onClick={() => setActiveSection(item.id)}
                    selected={activeSection === item.id}
                    sx={{
                      borderRadius: 2,
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
                    }}
                  >
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Main content */}
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Typography variant="h4" fontWeight={700}>
                {displayName}
              </Typography>
              {isOwner && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setEditOpen(true)}
                  disabled={loading}
                >
                  Edit profile
                </Button>
              )}
            </Stack>
            {error && (
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid rgba(255,0,0,0.4)',
                  backgroundColor: 'rgba(255,0,0,0.06)',
                  color: '#ffb3b3',
                }}
              >
                {error}
              </Paper>
            )}
            {activeSection === 'overview' && (
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight={700}>
                    Bio
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {loading ? 'Loading…' : bio}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ color: 'text.secondary' }}>
                    <Typography variant="body2">
                      Sex: {sexLabel(profile?.sex)}
                    </Typography>
                    <Typography variant="body2">
                      Gender: {genderLabel(profile?.gender)}
                    </Typography>
                  </Stack>
                  {profile?.links && (
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Links
                      </Typography>
                      {profile.links && Object.keys(profile.links as any).length > 0 ? (
                        <Stack spacing={1}>
                          {Object.entries(profile.links as Record<string, string>).map(
                            ([label, url]) => (
                              <Button
                                key={label}
                                component="a"
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="outlined"
                                color="primary"
                                sx={{ justifyContent: 'flex-start' }}
                              >
                                <strong>{label}:</strong>&nbsp;{url}
                              </Button>
                            ),
                          )}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No links provided.
                        </Typography>
                      )}
                    </Stack>
                  )}
                </Stack>
              </Paper>
            )}

            {activeSection === 'settings' && (
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight={700}>
                    Profile Settings
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Update your public profile details, avatar, and links. Changes are visible to
                    anyone who visits your profile.
                  </Typography>
                  <Stack spacing={1} sx={{ color: 'text.secondary' }}>
                    <Typography variant="body2">
                      Display name: {displayName || '—'}
                    </Typography>
                    <Typography variant="body2">
                      Email: {session?.user?.email || '—'}
                    </Typography>
                    <Typography variant="body2">
                      Sex: {sexLabel(profile?.sex)} · Gender: {genderLabel(profile?.gender)}
                    </Typography>
                  </Stack>
                  {isOwner && (
                    <Stack direction="row" justifyContent="flex-end">
                      <Button variant="contained" onClick={() => setEditOpen(true)}>
                        Edit profile
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </Paper>
            )}

            {activeSection === 'security' && (
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Security
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Security settings will live here. For now, use the Edit profile button under
                  Settings to manage your information.
                </Typography>
              </Paper>
            )}

            {activeSection === 'connections' && (
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Connections
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage connected accounts and integrations here in the future.
                </Typography>
              </Paper>
            )}
          </Stack>
        </Box>
      </main>

      {isOwner && (
        <PrimitiveModal
          open={editOpen}
          onClose={() => {
            resetFormFromProfile();
            setEditOpen(false);
          }}
          title="Edit profile"
          description="Update your public profile information"
          fullWidth
          maxWidth="sm"
        >
            <Stack spacing={2}>
              <TextField
                label="Display Name / Handle"
                helperText="Public handle shown on your profile"
                value={form.handle}
                onChange={handleChange('handle')}
                fullWidth
                required
              />
              <TextField
                label="Avatar URL"
                helperText="Link to your profile image"
                value={form.avatarUrl}
                onChange={handleChange('avatarUrl')}
                fullWidth
              />
              <TextField
                label="Bio"
                helperText="A short description about you"
                value={form.bio}
                onChange={handleChange('bio')}
                fullWidth
                multiline
                minRows={3}
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="sex-label">Sex</InputLabel>
                <Select
                  labelId="sex-label"
                  label="Sex"
                  value={form.sex}
                  onChange={(e) => setForm((prev) => ({ ...prev, sex: e.target.value as string }))}
                  MenuProps={{ PaperProps: { style: { maxHeight: 240 } } }}
                >
                  <MenuItem value="">Not set</MenuItem>
                  {Object.entries(Sex)
                    .filter(([k]) => isNaN(Number(k)))
                    .map(([key, value]) => (
                      <MenuItem key={key} value={value as any}>
                        {key}
                      </MenuItem>
                    ))}
                </Select>
                <FormHelperText>Assigned at birth</FormHelperText>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  label="Gender"
                  value={form.gender}
                  onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value as string }))}
                  MenuProps={{ PaperProps: { style: { maxHeight: 240 } } }}
                >
                  <MenuItem value="">Not set</MenuItem>
                  {Object.entries(Gender)
                    .filter(([k]) => isNaN(Number(k)))
                    .map(([key, value]) => (
                      <MenuItem key={key} value={value as any}>
                        {key}
                      </MenuItem>
                    ))}
                </Select>
                <FormHelperText>Gender identity</FormHelperText>
              </FormControl>
            </Stack>
            <Typography variant="subtitle2">Links</Typography>
            <Stack spacing={1}>
              {form.links.map((entry, idx) => (
                <Stack key={idx} direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems="center">
                  <TextField
                    label="Label"
                    value={entry.label}
                    onChange={(e) =>
                      setForm((prev) => {
                        const next = [...prev.links];
                        next[idx] = { ...next[idx], label: e.target.value };
                        return { ...prev, links: next };
                      })
                    }
                    fullWidth
                  />
                  <TextField
                    label="URL"
                    value={entry.url}
                    onChange={(e) =>
                      setForm((prev) => {
                        const next = [...prev.links];
                        next[idx] = { ...next[idx], url: e.target.value };
                        return { ...prev, links: next };
                      })
                    }
                    fullWidth
                  />
                  <IconButton
                    aria-label="Remove link"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        links: prev.links.filter((_, i) => i !== idx).length
                          ? prev.links.filter((_, i) => i !== idx)
                          : [{ label: '', url: '' }],
                      }))
                    }
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))}
              <Button
                variant="outlined"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    links: [...prev.links, { label: '', url: '' }],
                  }))
                }
              >
                Add link
              </Button>
            </Stack>

            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={1}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  resetFormFromProfile();
                  setEditOpen(false);
                }}
                disabled={saving || loading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={saving || loading || !userId}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </Stack>
          </Stack>
        </PrimitiveModal>
      )}
    </div>
  );
}
