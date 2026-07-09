import { defineStore } from 'pinia'
import { navigateTo, useNuxtApp } from '#app'
import { useDepartemenStore } from '~/stores/departemen'
import { useImageUrl } from '~/composables/useImageUrl'
import { mapPegawaiShowResponseToListRow } from '~/utils/pegawaiApiMapper'

interface AvailableUserOption {
    id: number
    fullName: string
    email: string
    username: string
}

export interface Pegawai {
    id: number
    name: string
    description?: string
}

interface PegawaiState {
    pegawais: Pegawai[]
    stats: any
    loading: boolean
    totalRecords: number
    params: any
    form: any
    isEditMode: boolean
    showModal: boolean
    validationErrors: any[]
    initialHistory: any
    availableUsers: AvailableUserOption[]
    availableUsersLoading: boolean
    assignUserAccount: boolean
    kontraks: Record<string, unknown>[]
    kontraksLoading: boolean
    kontrakWorkflowConfigured: boolean
}

export const usePegawaiStore = defineStore('pegawai', {
    state: (): PegawaiState => ({
        pegawais: [],
        stats: {
            total: undefined,
            pkwtt: undefined,
            pkwt: undefined,
            resign: undefined,
            freelance: undefined
        },
        loading: false,
        totalRecords: 0,
        params: {
            first: 0,
            rows: 10,
            sortField: 'id_pegawai' as string | null,
            sortOrder: 1 as number | null,
            draw: 1,
            search: '',
        },
        form: {},
        isEditMode: false,
        showModal: false,
        validationErrors: [],
        initialHistory: {
            cabangId: null,
            departemenId: null,
        },
        availableUsers: [],
        availableUsersLoading: false,
        assignUserAccount: false,
        kontraks: [],
        kontraksLoading: false,
        kontrakWorkflowConfigured: false,
    }),
    actions: {
        async fetchPegawais() {
            const toast = useToast();
            this.loading = true
            const { $api } = useNuxtApp()
            try {
                const params = new URLSearchParams({
                    start: this.params.first.toString(),
                    length: this.params.rows.toString(),
                    sortField: this.params.sortField || '',
                    sortOrder: this.params.sortOrder?.toString() || '',
                    draw: this.params.draw.toString(),
                    'search[value]': this.params.search || '',
                });

                const response = await fetch(`${$api.pegawai()}?${params.toString()}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    credentials: 'include' // Cookie-based auth
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Gagal memuat data pegawai' }));
                    throw new Error(errorData.message);
                }

                const result = await response.json();
                this.pegawais = result.data || [];
                this.totalRecords = parseInt(result.recordsTotal) || 0;
                if (result.draw) {
                    this.params.draw = parseInt(result.draw);
                }

            } catch (error: any) {
                this.pegawais = [];
                this.totalRecords = 0;
                toast.error({
                    title: 'Error',
                    message: `Tidak dapat memuat data pegawai: ${error.message}`,
                    color: 'red'
                });
            } finally {
                this.loading = false
            }
        },

        async fetchStats() {
            const toast = useToast();
            const { $api } = useNuxtApp()
            const defaultStats = { total: undefined, pkwtt: undefined, pkwt: undefined, resign: undefined, freelance: undefined };
            try {
                const response = await fetch($api.pegawaiCountByStatus(), {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include' // Cookie-based auth
                });

                if (response.ok) {
                    const result = await response.json();
                    this.stats = result;
                } else {
                    this.stats = defaultStats;
                }
            } catch (error) {
                console.error('Gagal mengambil data statistik:', error);
                this.stats = defaultStats;
            }
        },

        async savePegawai(opts?: { navigateTo?: string }) {
            const toast = useToast();
            this.loading = true;
            this.validationErrors = [];
            const { $api } = useNuxtApp()

            if (this.assignUserAccount && !this.form.user_id) {
                this.loading = false
                toast.error({
                    title: 'Error',
                    message: 'Silakan pilih akun user terlebih dahulu.',
                    color: 'red'
                });
                return;
            }

            const fileFieldKeys = ['avatar', 'cv_attachment', 'kk_attachment', 'ijazah_attachment', 'skck_attachment'] as const
            const formData = new FormData();
            for (const key in this.form) {
                if (key === 'avatarPreview') continue;
                if (key.endsWith('_url')) continue;
                if (key === 'nik_pegawai' && !this.isEditMode) continue;

                const value = this.form[key];
                if (value === null || value === undefined) continue;
                if (key === 'nomor_rekening') {
                    formData.append(key, String(value).trim());
                    continue;
                }

                if (fileFieldKeys.includes(key as (typeof fileFieldKeys)[number])) {
                    if (value instanceof File) {
                        formData.append(key, value);
                    }
                    continue;
                }

                if (typeof value === 'object' && !(value instanceof File)) continue;

                formData.append(key, value === null ? '' : String(value));
            }

            if (!this.assignUserAccount && this.isEditMode) {
                formData.append('unassign_user_account', '1')
            }
            
            try {
                let response;
                let url;

                if (this.isEditMode) {
                    const pegawaiId = this.form.id_pegawai;
                    url = $api.pegawaiUpdate(pegawaiId);
                    formData.append('_method', 'PUT');
                    response = await fetch(url, {
                        method: 'POST',
                        body: formData,
                        headers: {},
                        credentials: 'include', // Cookie-based auth
                    });
                } else {
                    url = $api.pegawai();
                    response = await fetch(url, {
                        method: 'POST',
                        body: formData,
                        headers: {},
                        credentials: 'include', // Cookie-based auth
                    });
                }
                
                if (response.ok) {
                    const result = await response.json().catch(() => ({}));
                    await this.fetchPegawais();
                    await this.fetchStats();
                    let message = `Pegawai berhasil ${this.isEditMode ? 'diperbarui' : 'dibuat'}.`;
                    if (!this.isEditMode && result.nik_pegawai) {
                        message += ` NIK Pegawai: ${result.nik_pegawai}.`;
                    }
                    toast.success({
                        title: 'Success',
                        message,
                        color: 'green'
                    });
                    this.closeModal();
                    if (opts?.navigateTo) {
                        await navigateTo(opts.navigateTo);
                    }
                } else {
                    const errorData = await response.json();
                    if (response.status === 422) {
                        if (errorData.errors && typeof errorData.errors === 'object') {
                            this.validationErrors = Object.values(errorData.errors).flat();
                        } else {
                            this.validationErrors = [];
                        }
                        toast.error({
                            title: 'Error',
                            message: 'Gagal Validasi',
                            color: 'red'
                        });
                    } else {
                        throw new Error(errorData.message || 'Gagal menyimpan data pegawai');
                    }
                }
            } catch (error: any) {
                this.validationErrors = [];
                toast.error({
                    title: 'Error',
                    message: error.message || 'Operasi gagal',
                    color: 'red'
                });
            } finally {
                this.loading = false;
            }
        },

        async deletePegawai(id: number) {
            const toast = useToast();
            const { $api } = useNuxtApp()
            
            const { default: Swal } = await import('sweetalert2');
            const result = await Swal.fire({
                title: 'Anda yakin?',
                text: "Data yang dihapus tidak dapat dikembalikan!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#666CFF',
                cancelButtonColor: '#A7A9B3',
                confirmButtonText: 'Ya, hapus!',
                cancelButtonText: 'Batal'
            });

            if (result.isConfirmed) {
                try {
                    const response = await fetch($api.pegawaiDelete(id), {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include' // Cookie-based auth
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Gagal menghapus pegawai');
                    }

                    await this.fetchPegawais();
                    await this.fetchStats();
                    toast.success({
                        title: 'Success',
                        message: 'Pegawai berhasil dihapus.',
                        color: 'green'
                    });
                } catch (error: any) {
                    toast.error({
                        title: 'Error',
                        message: error.message || 'Gagal menghapus pegawai',
                        color: 'red'
                    });
                }
            }
        },

        async fetchAvailableUsers(search = '', includeUserId: number | null = null) {
            const toast = useToast();
            const { $api } = useNuxtApp()
            this.availableUsersLoading = true

            try {
                const params = new URLSearchParams()
                if (search) {
                    params.append('search', search)
                }
                if (includeUserId) {
                    params.append('includeUserId', includeUserId.toString())
                }

                const urlParams = params.toString()
                const response = await fetch(`${$api.pegawaiAvailableUsers()}${urlParams ? `?${urlParams}` : ''}`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                })

                if (!response.ok) {
                    throw new Error('Tidak dapat memuat daftar user')
                }

                const data = await response.json()
                this.availableUsers = Array.isArray(data) ? data : []
            } catch (error: any) {
                this.availableUsers = []
                toast.error({
                    title: 'Error',
                    message: error.message || 'Gagal memuat data user',
                    color: 'red'
                });
            } finally {
                this.availableUsersLoading = false
            }
        },

        async setAssignUserAccount(value: boolean) {
            this.assignUserAccount = value

            if (!value) {
                this.handleUserAssignment(null)
                return
            }

            if (this.availableUsers.length === 0) {
                await this.fetchAvailableUsers('', this.form.user_id || null)
            }
        },

        handleUserAssignment(userId: number | null) {
            if (userId === null || userId === undefined) {
                this.form.user_id = null
                this.form.email = ''
                if (!this.isEditMode && this.form.nm_pegawai) {
                    const firstName = this.form.nm_pegawai.trim().split(' ')[0] || ''
                    const generatedUsername = firstName.toLowerCase()
                        .replace(/[^a-z0-9]/g, '')
                        .replace(/\s+/g, '')
                    this.form.username = generatedUsername
                } else if (!this.form.nm_pegawai) {
                    this.form.username = ''
                }
                return
            }

            this.form.user_id = userId
            const selectedUser = this.availableUsers.find((user) => user.id === userId)
            if (selectedUser) {
                this.form.email = selectedUser.email
                this.form.username = selectedUser.username
            }
        },

        /** Format tanggal dari API (string ISO / object) ke `YYYY-MM-DD` untuk input type=date */
        formatDateFieldForForm(val: unknown): string {
            if (val === null || val === undefined || val === '') return ''
            if (typeof val === 'string') {
                const s = val.includes('T') ? val.split('T')[0]! : val
                return s.length >= 10 ? s.substring(0, 10) : s
            }
            if (typeof val === 'object' && val !== null && 'toISO' in (val as Record<string, unknown>)) {
                try {
                    const iso = (val as { toISO?: () => string }).toISO?.()
                    if (iso && typeof iso === 'string') return iso.substring(0, 10)
                } catch {
                    /* ignore */
                }
            }
            return ''
        },

        async loadPegawaiForEdit(id: number | string | (string | number)[]) {
            const toast = useToast();
            const { $api } = useNuxtApp();
            const resolvedId = Array.isArray(id) ? id[0] : id
            if (resolvedId === undefined || resolvedId === null || resolvedId === '') {
                toast.error({ title: 'Error', message: 'ID pegawai tidak valid', color: 'red' })
                await navigateTo('/hrd/pegawai')
                return
            }
            try {
                const response = await fetch($api.pegawaiShow(resolvedId), {
                    headers: { Accept: 'application/json' },
                    credentials: 'include',
                });
                if (!response.ok) {
                    const err = await response.json().catch(() => ({ message: 'Pegawai tidak ditemukan' }));
                    throw new Error(err.message || 'Pegawai tidak ditemukan');
                }
                const raw = await response.json();
                const row = mapPegawaiShowResponseToListRow(raw as Record<string, unknown>);
                await this.prepareFormForPage(row);
            } catch (e: any) {
                toast.error({
                    title: 'Error',
                    message: e?.message || 'Gagal memuat pegawai',
                    color: 'red',
                });
                await navigateTo('/hrd/pegawai');
            }
        },

        /**
         * Hydrates `form` + `isEditMode` for full-page form or modal (no `showModal` side effect).
         */
        async prepareFormForPage(pegawaiData: any | null = null) {
            this.isEditMode = !!pegawaiData;
            this.validationErrors = [];
            if (!pegawaiData) {
                this.kontraks = []
                this.kontrakWorkflowConfigured = false
            }

            if (pegawaiData) {
                this.form = JSON.parse(JSON.stringify(pegawaiData));
                
                this.form.tgl_lahir_pegawai = this.formatDateFieldForForm(pegawaiData.tgl_lahir_pegawai)
                this.form.tgl_masuk_pegawai = this.formatDateFieldForForm(pegawaiData.tgl_masuk_pegawai)
                {
                    const tk = this.formatDateFieldForForm(pegawaiData.tgl_keluar_pegawai)
                    this.form.tgl_keluar_pegawai = tk || null
                }
                this.form.full_name = pegawaiData.nm_pegawai;
                this.form.username = pegawaiData.username || '';
                this.form.email = pegawaiData.email || '';
                this.form.user_id = pegawaiData.user_id || null;
                this.assignUserAccount = !!pegawaiData.user_id;
                
                if (pegawaiData.history) {
                    this.form.jabatan_id = pegawaiData.history.jabatan?.id_jabatan ?? pegawaiData.history.jabatan?.id ?? null;
                    this.form.perusahaan_id = pegawaiData.history.perusahaan?.id ?? null;
                    this.form.divisi_id = pegawaiData.history.divisi?.id ?? null;
                    this.form.gaji_pegawai = pegawaiData.history.gaji_pegawai ? parseFloat(pegawaiData.history.gaji_pegawai) : 0;
                    this.form.tunjangan_pegawai = pegawaiData.history.tunjangan_pegawai ? parseFloat(pegawaiData.history.tunjangan_pegawai) : 0;
                    
                    this.initialHistory.cabangId = pegawaiData.history.cabang?.id ?? null;
                    this.initialHistory.departemenId = pegawaiData.history.departemen?.id ?? null;

                    this.form.cabang_id = this.initialHistory.cabangId;
                    this.form.departemen_id = this.initialHistory.departemenId;

                    if (this.form.divisi_id) {
                        const departemenStore = useDepartemenStore()
                        await departemenStore.fetchDepartemensByDivisi(this.form.divisi_id)
                        this.form.departemen_id = this.initialHistory.departemenId
                    }
                } else {
                     this.form.jabatan_id = null;
                     this.form.perusahaan_id = null;
                     this.form.divisi_id = null;
                     this.form.cabang_id = null;
                     this.form.departemen_id = null;
                     this.form.gaji_pegawai = 0;
                     this.form.tunjangan_pegawai = 0;
                }

                if (pegawaiData.avatar) {
                    const { getUserAvatar } = useImageUrl();
                    this.form.avatarPreview = getUserAvatar(pegawaiData.avatar);
                } else {
                    this.form.avatarPreview = '';
                }
                this.form.avatar = null;

                const { getAttachmentUrl } = useImageUrl();
                const docUrl = (path: string | null | undefined) => (path ? getAttachmentUrl(path) : '');
                this.form.cv_attachment_url = docUrl(pegawaiData.cv_attachment);
                this.form.kk_attachment_url = docUrl(pegawaiData.kk_attachment);
                this.form.ijazah_attachment_url = docUrl(pegawaiData.ijazah_attachment);
                this.form.skck_attachment_url = docUrl(pegawaiData.skck_attachment);
                this.form.cv_attachment = null;
                this.form.kk_attachment = null;
                this.form.ijazah_attachment = null;
                this.form.skck_attachment = null;

                if (this.assignUserAccount) {
                    await this.fetchAvailableUsers('', this.form.user_id || null)
                    if (this.form.user_id) {
                        this.handleUserAssignment(this.form.user_id)
                    }
                } else {
                    this.availableUsers = []
                }

                this.form.agama = pegawaiData.agama ?? '';
                this.form.no_tlp_keluarga = pegawaiData.no_tlp_keluarga ?? '';
                this.form.nomor_rekening = pegawaiData.nomor_rekening ?? '';
                this.form.bpjstk = pegawaiData.bpjstk ?? '';
                this.form.bpjsk = pegawaiData.bpjsk ?? '';

                for (const key of ['status_pegawai', 'pendidikan_pegawai', 'jenis_kelamin_pegawai'] as const) {
                    const v = this.form[key]
                    if (v !== null && v !== undefined && v !== '' && typeof v === 'string' && !Number.isNaN(Number(v))) {
                        ;(this.form as Record<string, unknown>)[key] = Number(v)
                    }
                }
            } else {
                this.form = {
                    nm_pegawai: '', email: '', username: '', full_name: '', tgl_lahir_pegawai: '', tmp_lahir_pegawai: '',
                    no_tlp_pegawai: '', alamat_pegawai: '', pendidikan_pegawai: null, status_pegawai: 1,
                    no_ktp_pegawai: '', npwp_pegawai: '', jenis_kelamin_pegawai: null,
                    agama: '',
                    tgl_masuk_pegawai: '', tgl_keluar_pegawai: null, istri_suami_pegawai: '', anak_1: '', anak_2: '', anak_3: '',
                    no_tlp_keluarga: '',
                    nomor_rekening: '', bpjstk: '', bpjsk: '',
                    user_id: null, jabatan_id: null, perusahaan_id: null, cabang_id: null, divisi_id: null,
                    departemen_id: null, gaji_pegawai: 0, tunjangan_pegawai: 0, avatar: null, avatarPreview: '',
                    cv_attachment: null, kk_attachment: null, ijazah_attachment: null, skck_attachment: null,
                    cv_attachment_url: '', kk_attachment_url: '', ijazah_attachment_url: '', skck_attachment_url: '',
                };
                this.assignUserAccount = false
                this.availableUsers = []
            }
        },

        async openModal(pegawaiData: any | null = null) {
            await this.prepareFormForPage(pegawaiData);
            this.showModal = true;
        },

        closeModal() {
            this.showModal = false;
            this.isEditMode = false;
            this.form = {
                nm_pegawai: '', email: '', username: '', full_name: '', tgl_lahir_pegawai: '', tmp_lahir_pegawai: '',
                no_tlp_pegawai: '', alamat_pegawai: '', pendidikan_pegawai: null, status_pegawai: 1,
                no_ktp_pegawai: '', npwp_pegawai: '', jenis_kelamin_pegawai: null,
                agama: '',
                tgl_masuk_pegawai: '', tgl_keluar_pegawai: null, istri_suami_pegawai: '', anak_1: '', anak_2: '', anak_3: '',
                no_tlp_keluarga: '',
                nomor_rekening: '', bpjstk: '', bpjsk: '',
                user_id: null, jabatan_id: null, perusahaan_id: null, cabang_id: null, divisi_id: null,
                departemen_id: null, gaji_pegawai: 0, tunjangan_pegawai: 0, avatar: null, avatarPreview: '',
                cv_attachment: null, kk_attachment: null, ijazah_attachment: null, skck_attachment: null,
                cv_attachment_url: '', kk_attachment_url: '', ijazah_attachment_url: '', skck_attachment_url: '',
            };
            this.validationErrors = [];
            this.initialHistory = { cabangId: null, departemenId: null };
            this.assignUserAccount = false
            this.availableUsers = []
        },

        setPagination(event: any) {
            this.params.first = event.first;
            this.params.rows = event.rows;
            this.fetchPegawais();
        },

        setSort(event: any) {
            this.params.sortField = event.sortField;
            this.params.sortOrder = event.sortOrder;
            this.fetchPegawais();
        },
        
        setSearch(value: string) {
            this.params.search = value;
            this.params.first = 0;
            this.fetchPegawais();
        },

        handleAvatarChange(file: File) {
            const toast = useToast();
            if (file) {
                if (!file.size || file.size === 0) {
                    toast.error({
                        title: 'Error',
                        message: 'File avatar kosong atau tidak valid',
                        color: 'red'
                    });
                    return;
                }

                // Validasi file adalah image
                const fileType = file.type || '';
                const fileExtension = file.name?.split('.').pop()?.toLowerCase() || '';

                const allowedMimeTypes = [
                    'image/jpeg',
                    'image/jpg',
                    'image/png',
                    'image/x-png',
                    'image/gif',
                    'image/webp',
                    'image/svg+xml'
                ];

                const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

                const isValidMimeType = allowedMimeTypes.includes(fileType);
                const isValidExtension = allowedExtensions.includes(fileExtension);

                if (!isValidMimeType && !isValidExtension) {
                    toast.error({
                        title: 'Error',
                        message: `File harus berupa gambar (JPEG, PNG, GIF, WebP). Detected: MIME=${fileType}, Ext=${fileExtension}`,
                        color: 'red'
                    });
                    return;
                }

                // Validasi file size
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSize) {
                    toast.error({
                        title: 'Error',
                        message: 'Ukuran file terlalu besar (maksimal 5MB)',
                        color: 'red'
                    });
                    return;
                }

                this.form.avatar = file;
                this.form.avatarPreview = URL.createObjectURL(file);
            }
        },

        handlePegawaiDocumentChange(field: 'cv_attachment' | 'kk_attachment' | 'ijazah_attachment' | 'skck_attachment', file: File | undefined) {
            const toast = useToast();
            if (!file) return;

            if (!file.size) {
                toast.error({ title: 'Error', message: 'File dokumen kosong atau tidak valid', color: 'red' });
                return;
            }

            const ext = file.name?.split('.').pop()?.toLowerCase() || '';
            const mime = file.type || '';
            const allowedExt = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'doc', 'docx'];
            const allowedMime = [
                'application/pdf',
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/webp',
                'image/gif',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];
            const ok = allowedExt.includes(ext) || allowedMime.includes(mime);
            if (!ok) {
                toast.error({
                    title: 'Error',
                    message: 'Dokumen harus berupa PDF, gambar, atau Word (DOC/DOCX).',
                    color: 'red',
                });
                return;
            }

            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error({ title: 'Error', message: 'Ukuran file terlalu besar (maksimal 5MB)', color: 'red' });
                return;
            }

            this.form[field] = file;
        },

        async fetchPegawaiKontraks(pegawaiId: number | string) {
            const toast = useToast()
            const { $api } = useNuxtApp()
            this.kontraksLoading = true
            try {
                const response = await fetch($api.pegawaiKontrakList(pegawaiId), {
                    headers: { Accept: 'application/json' },
                    credentials: 'include',
                })
                if (!response.ok) {
                    const err = await response.json().catch(() => ({ message: 'Gagal memuat kontrak' }))
                    throw new Error(err.message || 'Gagal memuat kontrak')
                }
                const data = await response.json()
                if (Array.isArray(data)) {
                    this.kontraks = data
                    this.kontrakWorkflowConfigured = false
                } else {
                    this.kontraks = Array.isArray(data.data) ? data.data : []
                    this.kontrakWorkflowConfigured = !!data.workflowConfigured
                }
            } catch (e: any) {
                this.kontraks = []
                this.kontrakWorkflowConfigured = false
                toast.error({
                    title: 'Error',
                    message: e?.message || 'Gagal memuat data kontrak',
                    color: 'red',
                })
            } finally {
                this.kontraksLoading = false
            }
        },

        async postPegawaiKontrakDraft(opts: {
            pegawaiId: number | string
            editingKontrakId: number | null
            jenis_kontrak: number
            nomor_kontrak?: string
            tgl_mulai: string
            tgl_selesai?: string | null
            catatan?: string
            induk_id?: number | null
            file?: File | null
        }) {
            const toast = useToast()
            const { $api } = useNuxtApp()
            const fd = new FormData()
            fd.append('jenis_kontrak', String(opts.jenis_kontrak))
            if (opts.nomor_kontrak?.trim()) fd.append('nomor_kontrak', opts.nomor_kontrak.trim())
            fd.append('tgl_mulai', opts.tgl_mulai)
            if (opts.tgl_selesai) fd.append('tgl_selesai', opts.tgl_selesai)
            if (opts.catatan?.trim()) fd.append('catatan', opts.catatan.trim())
            if (opts.induk_id) fd.append('induk_id', String(opts.induk_id))
            if (opts.file) fd.append('file_sk', opts.file)

            const url = opts.editingKontrakId
                ? $api.pegawaiKontrakUpdate(opts.editingKontrakId)
                : $api.pegawaiKontrakStore(opts.pegawaiId)

            const response = await fetch(url, {
                method: 'POST',
                body: fd,
                credentials: 'include',
            })
            if (!response.ok) {
                const err = await response.json().catch(() => ({ message: 'Gagal menyimpan kontrak' }))
                throw new Error(err.message || err.error || 'Gagal menyimpan kontrak')
            }
            toast.success({
                title: 'Berhasil',
                message: opts.editingKontrakId ? 'Draft kontrak diperbarui.' : 'Draft kontrak dibuat.',
                color: 'green',
            })
            await this.fetchPegawaiKontraks(opts.pegawaiId)
        },

        async activatePegawaiKontrak(kontrakId: number, pegawaiId: number | string) {
            const toast = useToast()
            const { $api } = useNuxtApp()
            const response = await fetch($api.pegawaiKontrakActivate(kontrakId), {
                method: 'POST',
                headers: { Accept: 'application/json' },
                credentials: 'include',
            })
            if (!response.ok) {
                const err = await response.json().catch(() => ({ message: 'Gagal mengaktifkan kontrak' }))
                throw new Error(err.message || err.error || 'Gagal mengaktifkan kontrak')
            }
            toast.success({
                title: 'Berhasil',
                message: 'Kontrak diaktifkan. Status pegawai disesuaikan.',
                color: 'green',
            })
            await this.fetchPegawaiKontraks(pegawaiId)
            await this.loadPegawaiForEdit(pegawaiId)
        },

        async cancelPegawaiKontrakDraft(kontrakId: number, pegawaiId: number | string) {
            const toast = useToast()
            const { $api } = useNuxtApp()
            const response = await fetch($api.pegawaiKontrakCancel(kontrakId), {
                method: 'POST',
                headers: { Accept: 'application/json' },
                credentials: 'include',
            })
            if (!response.ok) {
                const err = await response.json().catch(() => ({ message: 'Gagal membatalkan draft' }))
                throw new Error(err.message || err.error || 'Gagal membatalkan draft')
            }
            toast.success({ title: 'Berhasil', message: 'Draft kontrak dibatalkan.', color: 'green' })
            await this.fetchPegawaiKontraks(pegawaiId)
        },

        async deletePegawaiKontrakDraft(kontrakId: number, pegawaiId: number | string) {
            const toast = useToast()
            const { $api } = useNuxtApp()
            const response = await fetch($api.pegawaiKontrakDelete(kontrakId), {
                method: 'DELETE',
                headers: { Accept: 'application/json' },
                credentials: 'include',
            })
            if (!response.ok) {
                const err = await response.json().catch(() => ({ message: 'Gagal menghapus draft' }))
                throw new Error(err.message || err.error || 'Gagal menghapus draft')
            }
            toast.success({ title: 'Berhasil', message: 'Draft kontrak dihapus.', color: 'green' })
            await this.fetchPegawaiKontraks(pegawaiId)
        },

        async submitPegawaiKontrakForApproval(kontrakId: number, pegawaiId: number | string) {
            const toast = useToast()
            const { $api } = useNuxtApp()
            const response = await fetch($api.pegawaiKontrakSubmitApproval(kontrakId), {
                method: 'POST',
                headers: { Accept: 'application/json' },
                credentials: 'include',
            })
            if (!response.ok) {
                const err = await response.json().catch(() => ({ message: 'Gagal mengajukan persetujuan' }))
                throw new Error(err.message || err.error || 'Gagal mengajukan persetujuan')
            }
            toast.success({
                title: 'Berhasil',
                message: 'Kontrak diajukan untuk persetujuan.',
                color: 'green',
            })
            await this.fetchPegawaiKontraks(pegawaiId)
        },

        async approvePegawaiKontrak(kontrakId: number, pegawaiId: number | string, remarks?: string) {
            const toast = useToast()
            const { $api } = useNuxtApp()
            const response = await fetch($api.pegawaiKontrakApprove(kontrakId), {
                method: 'POST',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ remarks: remarks ?? '' }),
            })
            if (!response.ok) {
                const err = await response.json().catch(() => ({ message: 'Gagal approve' }))
                throw new Error(err.message || err.error || 'Gagal approve')
            }
            const body = await response.json().catch(() => ({} as Record<string, unknown>))
            toast.success({
                title: 'Berhasil',
                message: (body.message as string) || 'Approval tercatat.',
                color: 'green',
            })
            await this.fetchPegawaiKontraks(pegawaiId)
            if (body.isFullyApproved === true) {
                await this.loadPegawaiForEdit(pegawaiId)
            }
        },

        async rejectPegawaiKontrak(kontrakId: number, pegawaiId: number | string, remarks: string) {
            const toast = useToast()
            const { $api } = useNuxtApp()
            const response = await fetch($api.pegawaiKontrakReject(kontrakId), {
                method: 'POST',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ remarks }),
            })
            if (!response.ok) {
                const err = await response.json().catch(() => ({ message: 'Gagal menolak' }))
                throw new Error(err.message || err.error || 'Gagal menolak')
            }
            toast.success({ title: 'Berhasil', message: 'Kontrak ditolak.', color: 'green' })
            await this.fetchPegawaiKontraks(pegawaiId)
        },

        async cancelPegawaiKontrakPending(kontrakId: number, pegawaiId: number | string) {
            const toast = useToast()
            const { $api } = useNuxtApp()
            const response = await fetch($api.pegawaiKontrakCancelPending(kontrakId), {
                method: 'POST',
                headers: { Accept: 'application/json' },
                credentials: 'include',
            })
            if (!response.ok) {
                const err = await response.json().catch(() => ({ message: 'Gagal membatalkan pengajuan' }))
                throw new Error(err.message || err.error || 'Gagal membatalkan pengajuan')
            }
            toast.success({ title: 'Berhasil', message: 'Pengajuan kontrak dibatalkan.', color: 'green' })
            await this.fetchPegawaiKontraks(pegawaiId)
        },
    },
})