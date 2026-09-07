<template>
  <div class="content-wrapper">
    <div class="container-xxl flex-grow-1">
      <p class="mb-6">
        Kelola event policy, delivery log, dan pengaturan global notifikasi SkyFlow. Recipient rules dan template dikonfigurasi per event melalui editor policy. Channel dan superadmin feed dikelola di tab Global Settings.
      </p>

      <div class="row g-6 mb-6">
        <div v-for="card in statCards" :key="card.label" class="col-xl-3 col-lg-6 col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="mb-0">{{ card.label }}</p>
                <div class="avatar">
                  <span :class="['avatar-initial rounded', card.iconClass]">
                    <i :class="card.icon"></i>
                  </span>
                </div>
              </div>
              <h5 class="mb-0">{{ card.value }}</h5>
            </div>
          </div>
        </div>
      </div>

      <ul class="nav nav-tabs mb-4">
        <li v-for="tab in tabs" :key="tab.key" class="nav-item">
          <button
            type="button"
            class="nav-link"
            :class="{ active: activeTab === tab.key }"
            @click="setTab(tab.key)"
          >
            {{ tab.label }}
          </button>
        </li>
      </ul>

      <div v-if="activeTab === 'policies'">
        <div v-if="store.error" class="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{{ store.error }}</span>
          <button type="button" class="btn btn-sm btn-outline-danger" @click="loadPolicies">Coba lagi</button>
        </div>
        <CollapsibleFilterCard title="Filter Policy" :has-active-filters="hasFilters" @reset="resetFilters">
          <FilterFieldsRow>
            <FilterField>
              <label class="form-label">Module</label>
              <select v-model="store.params.module" class="form-select" @change="onPolicyFilterChange">
                <option value="">Semua</option>
                <option v-for="mod in store.modules" :key="mod" :value="mod">{{ mod }}</option>
              </select>
            </FilterField>
            <FilterField>
              <label class="form-label">Kategori</label>
              <select v-model="store.params.category" class="form-select" @change="onPolicyFilterChange">
                <option value="">Semua</option>
                <option value="ACTIONABLE">Actionable</option>
                <option value="INFORMATIONAL">Informational</option>
                <option value="WARNING">Warning</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </FilterField>
            <FilterField>
              <label class="form-label">Policy status</label>
              <select v-model="store.params.policyStatus" class="form-select" @change="onPolicyFilterChange">
                <option value="">Semua</option>
                <option value="REGISTERED_NOT_CONFIGURED">Registered — Not Configured</option>
                <option value="CONFIGURED_ACTIVE">Configured Active</option>
                <option value="CONFIGURED_INACTIVE">Configured Inactive</option>
                <option value="ORPHANED_POLICY">Orphaned Policy</option>
              </select>
            </FilterField>
            <FilterField>
              <label class="form-label">Publisher</label>
              <select v-model="store.params.publisherStatus" class="form-select" @change="onPolicyFilterChange">
                <option value="">Semua</option>
                <option value="WIRED">Wired</option>
                <option value="NOT_DETECTED">Not detected</option>
              </select>
            </FilterField>
            <FilterField>
              <label class="form-label">Status</label>
              <select v-model="store.params.enabled" class="form-select" @change="onPolicyFilterChange">
                <option value="">Semua</option>
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
            </FilterField>
          </FilterFieldsRow>
        </CollapsibleFilterCard>

        <div class="card">
          <ListPageTableHeader
            :rows="store.params.rows"
            :rows-options="[5, 10, 25, 50]"
            :search="store.params.search"
            search-placeholder="Cari event name..."
            :show-export="false"
            @update:rows="onRows"
            @update:search="onSearch"
          >
            <template #add>
              <button v-if="canManagePolicy" type="button" class="btn btn-primary" @click="openCreate">
                <i class="ri-add-line me-1"></i> Tambah Policy
              </button>
            </template>
          </ListPageTableHeader>
          <div class="card-datatable table-responsive py-3 px-3">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Module</th>
                  <th>Description</th>
                  <th>Registry</th>
                  <th>Policy</th>
                  <th>Publisher</th>
                  <th>Kategori</th>
                  <th>Priority</th>
                  <th>Recipients</th>
                  <th>Unread</th>
                  <th>Superadmin</th>
                  <th>Status</th>
                  <th>Last emitted</th>
                  <th style="min-width: 8rem;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="store.loading">
                  <td colspan="14" class="text-center py-4">
                    <div class="placeholder-glow">
                      <span class="placeholder col-6"></span>
                    </div>
                  </td>
                </tr>
                <tr v-else-if="!store.catalog.length">
                  <td colspan="14" class="text-center py-5 text-muted">
                    <p class="mb-1">Belum ada registered notification event.</p>
                    <p class="small mb-0">Periksa event registry pada backend.</p>
                  </td>
                </tr>
                <tr v-else v-for="row in store.catalog" :key="row.eventName">
                  <td>
                    <code class="small">{{ row.eventName }}</code>
                  </td>
                  <td class="small">{{ row.module }}</td>
                  <td class="small">{{ row.description }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="row.registryStatus === 'ORPHANED' ? 'bg-label-danger' : 'bg-label-success'"
                      :title="registryTooltip(row)"
                    >
                      {{ row.registryStatus === 'ORPHANED' ? 'Orphaned' : 'Registered' }}
                    </span>
                  </td>
                  <td>
                    <span :class="policyBadgeClass(row.policyStatus)" :title="policyStatusTooltip(row.policyStatus)">
                      {{ policyStatusLabel(row.policyStatus) }}
                    </span>
                  </td>
                  <td>
                    <span :class="row.publisherStatus === 'WIRED' ? 'badge bg-label-success' : 'badge bg-label-warning'" :title="publisherTooltip(row.publisherStatus)">
                      {{ row.publisherStatus === 'WIRED' ? 'Active' : 'Not detected' }}
                    </span>
                  </td>
                  <td>{{ row.category }}</td>
                  <td>{{ row.priority }}</td>
                  <td class="small">{{ row.recipientSummary || '—' }}</td>
                  <td>{{ row.unread ? 'Ya' : 'Tidak' }}</td>
                  <td>{{ row.superadmin ? 'Ya' : 'Tidak' }}</td>
                  <td>
                    <span :class="effectiveStatusBadge(row.effectiveStatus || row.policyStatus)">
                      {{ effectiveStatusLabel(row.effectiveStatus || row.policyStatus) }}
                    </span>
                  </td>
                  <td class="small">{{ formatEmitted(row.lastEmittedAt) }}</td>
                  <td>
                    <div class="d-inline-block">
                      <a
                        href="javascript:;"
                        class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                        data-bs-toggle="dropdown"
                      >
                        <i class="ri-more-2-fill"></i>
                      </a>
                      <ul class="dropdown-menu">
                        <li v-if="!row.policy && canManagePolicy">
                          <a class="dropdown-item" href="javascript:void(0)" @click="createFromRow(row)">
                            <i class="ri-add-line me-2"></i> Buat Policy
                          </a>
                        </li>
                        <li v-if="row.policy && canManagePolicy">
                          <a class="dropdown-item" href="javascript:void(0)" @click="openEdit(row)">
                            <i class="ri-edit-box-line me-2"></i> Ubah
                          </a>
                        </li>
                        <li v-if="row.policy && canManagePolicy">
                          <a class="dropdown-item" href="javascript:void(0)" @click="toggleEnabled(row.policy!)">
                            <i :class="row.policy.enabled ? 'ri-toggle-line me-2' : 'ri-toggle-fill me-2'"></i>
                            {{ row.policy.enabled ? 'Nonaktifkan' : 'Aktifkan' }}
                          </a>
                        </li>
                        <li>
                          <a class="dropdown-item" href="javascript:void(0)" @click="openContract(row)">
                            <i class="ri-file-list-3-line me-2"></i> View Event Contract
                          </a>
                        </li>
                        <li>
                          <a class="dropdown-item" href="javascript:void(0)" @click="runDryRun(row.eventName)">
                            <i class="ri-play-line me-2"></i> Test Policy (dry-run)
                          </a>
                        </li>
                        <li>
                          <a class="dropdown-item" href="javascript:void(0)" @click="openLogs(row.eventName)">
                            <i class="ri-history-line me-2"></i> View Delivery Logs
                          </a>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="store.totalRecords > store.params.rows" class="card-footer d-flex justify-content-between align-items-center">
            <small class="text-muted">
              Menampilkan {{ Math.min((store.params.page - 1) * store.params.rows + 1, store.totalRecords) }} -
              {{ Math.min(store.params.page * store.params.rows, store.totalRecords) }} dari {{ store.totalRecords }}
            </small>
            <div class="btn-group btn-group-sm">
              <button
                type="button"
                class="btn btn-outline-secondary"
                :disabled="store.params.page <= 1"
                @click="store.params.page--; loadPolicies()"
              >
                Prev
              </button>
              <button
                type="button"
                class="btn btn-outline-secondary"
                :disabled="store.params.page * store.params.rows >= store.totalRecords"
                @click="store.params.page++; loadPolicies()"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'logs'" class="card">
        <ListPageTableHeader
          :rows="store.logParams.rows"
          :rows-options="[5, 10, 25, 50]"
          :search="store.logParams.eventName"
          search-placeholder="Cari event / entity..."
          :show-export="false"
          @update:rows="onLogRows"
          @update:search="onLogSearch"
        />
        <div class="card-datatable table-responsive py-3 px-3">
          <div class="d-flex gap-2 mb-3 px-1">
            <select v-model="store.logParams.status" class="form-select w-auto" @change="onLogStatusChange">
              <option value="">Semua outbox status</option>
              <option value="pending">pending</option>
              <option value="processing">processing</option>
              <option value="failed">failed</option>
              <option value="delivered">delivered</option>
              <option value="dead">dead</option>
            </select>
          </div>
          <table class="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Event</th>
                  <th>Entity</th>
                  <th>Outbox status</th>
                  <th>Attempts</th>
                  <th>Processed at</th>
                  <th>Error</th>
                  <th style="min-width: 8rem;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="store.logsLoading">
                  <td colspan="8" class="text-center py-4">
                    <div class="placeholder-glow"><span class="placeholder col-6"></span></div>
                  </td>
                </tr>
                <tr v-else-if="!store.logs.length">
                  <td colspan="8" class="text-center py-5 text-muted">
                    <p class="mb-1">Belum ada delivery notification.</p>
                    <p class="small mb-0">Log akan muncul setelah registered event diproses oleh notification worker.</p>
                  </td>
                </tr>
                <tr v-else v-for="row in store.logs" :key="String(row.id)">
                  <td>{{ row.id }}</td>
                  <td><code class="small">{{ row.eventName }}</code></td>
                  <td class="small">{{ row.entityType }} / {{ row.entityId }}</td>
                  <td><span :class="outboxStatusBadge(String(row.status))">{{ row.status }}</span></td>
                  <td>{{ row.attemptCount }}</td>
                  <td class="small">{{ formatEmitted(row.processedAt as string) }}</td>
                  <td class="small text-danger">{{ row.errorMessage }}</td>
                  <td>
                    <div class="d-inline-block">
                      <a
                        href="javascript:;"
                        class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                        data-bs-toggle="dropdown"
                      >
                        <i class="ri-more-2-fill"></i>
                      </a>
                      <ul class="dropdown-menu">
                        <li>
                          <a class="dropdown-item" href="javascript:void(0)" @click="openLogDetail(Number(row.id))">
                            <i class="ri-eye-line me-2"></i> Detail
                          </a>
                        </li>
                        <li v-if="canRetryDelivery && row.status !== 'delivered'">
                          <a class="dropdown-item" href="javascript:void(0)" @click="retry(Number(row.id))">
                            <i class="ri-refresh-line me-2"></i> Retry Event Processing
                          </a>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
        </div>
        <div v-if="store.logsTotal > store.logParams.rows" class="card-footer d-flex justify-content-between align-items-center">
          <small class="text-muted">
            Menampilkan {{ Math.min((store.logParams.page - 1) * store.logParams.rows + 1, store.logsTotal) }} -
            {{ Math.min(store.logParams.page * store.logParams.rows, store.logsTotal) }} dari {{ store.logsTotal }}
          </small>
          <div class="btn-group btn-group-sm">
            <button
              type="button"
              class="btn btn-outline-secondary"
              :disabled="store.logParams.page <= 1"
              @click="store.logParams.page--; loadLogs()"
            >
              Prev
            </button>
            <button
              type="button"
              class="btn btn-outline-secondary"
              :disabled="store.logParams.page * store.logParams.rows >= store.logsTotal"
              @click="store.logParams.page++; loadLogs()"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'settings'">
        <div v-if="store.settingsLoading && !store.settings" class="card">
          <div class="card-body py-5 text-center">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="text-muted mt-3 mb-0">Memuat global settings...</p>
          </div>
        </div>
        <template v-else-if="store.settings">
          <section class="card mb-4">
            <div class="card-header"><h5 class="mb-0">Channel Configuration</h5></div>
            <div class="card-body">
              <div v-for="channel in store.settings.channels" :key="channel.name" class="border rounded p-3 mb-3">
                <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  <div>
                    <h6 class="mb-1">{{ channel.label }}</h6>
                    <p class="text-muted small mb-2">{{ channel.description }}</p>
                  </div>
                  <span :class="channel.available ? 'badge bg-label-success' : 'badge bg-label-secondary'">
                    {{ channel.available ? (channel.enabled ? 'Active' : 'Disabled') : 'Not Available' }}
                  </span>
                </div>
                <div class="row g-2 small">
                  <div class="col-md-3"><strong>Provider:</strong> {{ channel.provider || '—' }}</div>
                  <div class="col-md-3"><strong>Realtime:</strong> {{ channel.realtime ? 'Active' : '—' }}</div>
                  <div class="col-md-3"><strong>Default retry:</strong> {{ channel.defaultRetry ?? '—' }}</div>
                </div>
              </div>
            </div>
          </section>

          <section class="card mb-4">
            <div class="card-header"><h5 class="mb-0">Superadmin Feed Settings</h5></div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-4">
                  <div class="form-check form-switch">
                    <input id="feedEnabled" v-model="settingsForm.superadminFeed.enabled" class="form-check-input" type="checkbox" :disabled="!canManageGlobalSettings">
                    <label class="form-check-label" for="feedEnabled">Global feed enabled</label>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-check form-switch">
                    <input id="receiveAll" v-model="settingsForm.superadminFeed.receiveAllPolicyEvents" class="form-check-input" type="checkbox" :disabled="!canManageGlobalSettings">
                    <label class="form-check-label" for="receiveAll">Receive all policy-authorized events</label>
                  </div>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Minimum priority</label>
                  <select v-model="settingsForm.superadminFeed.minPriority" class="form-select" :disabled="!canManageGlobalSettings">
                    <option>LOW</option><option>NORMAL</option><option>HIGH</option><option>CRITICAL</option>
                  </select>
                </div>
                <div class="col-md-3" v-for="flag in feedCategoryFlags" :key="flag.key">
                  <div class="form-check form-switch">
                    <input :id="flag.key" v-model="settingsForm.superadminFeed[flag.key]" class="form-check-input" type="checkbox" :disabled="!canManageGlobalSettings">
                    <label class="form-check-label" :for="flag.key">{{ flag.label }}</label>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-check form-switch">
                    <input id="infoUnread" v-model="settingsForm.superadminFeed.informationalContributesUnread" class="form-check-input" type="checkbox" :disabled="!canManageGlobalSettings">
                    <label class="form-check-label" for="infoUnread">Informational contributes to unread</label>
                  </div>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Aggregation behavior</label>
                  <select v-model="settingsForm.superadminFeed.aggregationBehavior" class="form-select" :disabled="!canManageGlobalSettings">
                    <option>INDIVIDUAL</option><option>AGGREGATED</option><option>DIGEST</option><option>ACTIVITY_ONLY</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section class="card mb-4">
            <div class="card-header"><h5 class="mb-0">Delivery Defaults</h5></div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label">Default maximum attempts</label>
                  <input v-model.number="settingsForm.deliveryDefaults.defaultMaxAttempts" type="number" min="1" max="20" class="form-control" :disabled="!canManageGlobalSettings">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Retention (days)</label>
                  <input v-model.number="settingsForm.deliveryDefaults.retentionDays" type="number" min="7" max="3650" class="form-control" :disabled="!canManageGlobalSettings">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Env max attempts (read-only)</label>
                  <input :value="store.settings.deliveryDefaults.envMaxAttempts" class="form-control" disabled>
                </div>
              </div>
              <p class="text-muted small mt-3 mb-0">
                Precedence: system default → event policy override → recipient/channel-specific rule.
              </p>
            </div>
          </section>

          <section v-if="store.health" class="card mb-4">
            <div class="card-header"><h5 class="mb-0">System Health</h5></div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-3"><strong>Worker:</strong> {{ store.health.worker.status }}</div>
                <div class="col-md-3"><strong>Pending outbox:</strong> {{ store.health.outbox.pending }}</div>
                <div class="col-md-3"><strong>Failed outbox:</strong> {{ store.health.outbox.failed }}</div>
                <div class="col-md-3"><strong>Active policies:</strong> {{ store.health.registry.activePolicyCount }}</div>
                <div class="col-md-3"><strong>Registered events:</strong> {{ store.health.registry.registeredEventCount }}</div>
                <div class="col-md-3"><strong>Invalid config:</strong> {{ store.health.registry.invalidConfigurationCount }}</div>
                <div class="col-md-6"><strong>Last processed:</strong> {{ formatEmitted(store.health.outbox.lastProcessedAt) }}</div>
              </div>
            </div>
          </section>

          <div v-if="canManageGlobalSettings" class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-outline-secondary" @click="loadSettings">Reset</button>
            <button type="button" class="btn btn-primary" :disabled="settingsSaving" @click="saveSettings">
              <span v-if="settingsSaving" class="spinner-border spinner-border-sm me-1"></span>
              Simpan Global Settings
            </button>
          </div>
          <p v-if="settingsError" class="text-danger small mt-2">{{ settingsError }}</p>
        </template>
      </div>
    </div>

    <div v-if="editing" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.4)" @click.self="closeEdit">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <div>
              <h5 class="modal-title mb-1">Edit Policy</h5>
              <code class="small text-muted">{{ editing.eventName }}</code>
            </div>
            <button type="button" class="btn-close" @click="closeEdit"></button>
          </div>
          <div class="modal-body">
            <ul class="nav nav-pills mb-4">
              <li v-for="section in editorSections" :key="section.key" class="nav-item">
                <button type="button" class="nav-link" :class="{ active: editorSection === section.key }" @click="editorSection = section.key">
                  {{ section.label }}
                </button>
              </li>
            </ul>

            <section v-if="editorSection === 'overview'" class="mb-2">
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label text-muted small">Event name</label>
                  <div><code>{{ editing.eventName }}</code></div>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted small">Module</label>
                  <div>{{ editingRow?.module || '—' }}</div>
                </div>
                <div class="col-12">
                  <label class="form-label text-muted small">Description</label>
                  <div>{{ editingRow?.description || '—' }}</div>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Kategori</label>
                  <select v-model="form.category" class="form-select">
                    <option>ACTIONABLE</option>
                    <option>INFORMATIONAL</option>
                    <option>WARNING</option>
                    <option>CRITICAL</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Priority</label>
                  <select v-model="form.priority" class="form-select">
                    <option>LOW</option>
                    <option>NORMAL</option>
                    <option>HIGH</option>
                    <option>CRITICAL</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Policy version</label>
                  <input :value="form.version" class="form-control" disabled>
                </div>
              </div>
              <div class="border rounded p-3">
                <div class="row g-3">
                  <div class="col-sm-6 col-lg-4">
                    <div class="form-check form-switch mb-0">
                      <input id="enabled" v-model="form.enabled" class="form-check-input" type="checkbox">
                      <label class="form-check-label" for="enabled">Policy aktif</label>
                    </div>
                  </div>
                  <div class="col-sm-6 col-lg-4">
                    <div class="form-check form-switch mb-0">
                      <input id="unread" v-model="form.contributesToUnreadCount" class="form-check-input" type="checkbox">
                      <label class="form-check-label" for="unread">Tambah unread count</label>
                    </div>
                  </div>
                  <div class="col-sm-6 col-lg-4">
                    <div class="form-check form-switch mb-0">
                      <input id="notifySuperadmin" v-model="form.notifySuperadmin" class="form-check-input" type="checkbox">
                      <label class="form-check-label" for="notifySuperadmin">Notify superadmin</label>
                    </div>
                  </div>
                </div>
              </div>
              <p class="text-muted small mt-3 mb-0">
                Effective status: {{ effectiveStatusLabel(editingRow?.effectiveStatus || editingRow?.policyStatus || '') }}
              </p>
            </section>

            <section v-if="editorSection === 'recipients'" class="mb-2">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <p class="text-muted small mb-0">Atur siapa yang menerima notifikasi untuk event ini.</p>
                <button type="button" class="btn btn-sm btn-outline-primary" @click="addRecipient">
                  <i class="ri-add-line me-1"></i> Tambah recipient
                </button>
              </div>
              <div class="border rounded p-3 mb-3">
                <div class="row g-3">
                  <div class="col-sm-6 col-lg-4">
                    <div class="form-check form-switch mb-0">
                      <input id="notifyMaker" v-model="form.notifyMaker" class="form-check-input" type="checkbox">
                      <label class="form-check-label" for="notifyMaker">Notify maker</label>
                    </div>
                  </div>
                  <div class="col-sm-6 col-lg-4">
                    <div class="form-check form-switch mb-0">
                      <input id="notifyActor" v-model="form.notifyActor" class="form-check-input" type="checkbox">
                      <label class="form-check-label" for="notifyActor">Notify actor</label>
                    </div>
                  </div>
                </div>
              </div>
              <p v-if="!form.recipients.length" class="text-muted small mb-0">Belum ada recipient rule.</p>
              <div v-for="(rule, index) in form.recipients" :key="index" class="border rounded p-3 mb-2">
                <div class="row g-3 align-items-center">
                  <div class="col-md-5">
                    <label class="form-label small mb-1">Tipe recipient</label>
                    <select v-model="rule.recipientType" class="form-select">
                      <option v-for="type in allowedRecipientTypes" :key="type" :value="type">{{ type }}</option>
                    </select>
                    <small class="text-muted">{{ recipientTypeHint(rule.recipientType) }}</small>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label small mb-1">Permission</label>
                    <input v-model="rule.permissionName" class="form-control" placeholder="Opsional">
                  </div>
                  <div class="col-md-2">
                    <div class="form-check form-switch mb-0">
                      <input :id="'ex' + index" v-model="rule.excludeActor" class="form-check-input" type="checkbox">
                      <label class="form-check-label" :for="'ex' + index">Exclude actor</label>
                    </div>
                  </div>
                  <div class="col-md-1 text-end">
                    <button type="button" class="btn btn-sm btn-icon btn-text-danger rounded-pill" title="Hapus rule" @click="form.recipients.splice(index, 1)">
                      <i class="ri-delete-bin-7-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section v-if="editorSection === 'templates'" class="mb-2">
              <p v-if="!templateTypes.length" class="text-muted small mb-0">
                Tambahkan recipient rule atau aktifkan notify maker/actor/superadmin untuk mengatur template.
              </p>
              <div v-for="type in templateTypes" :key="type" class="border rounded p-3 mb-3">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <span class="badge bg-label-primary">{{ type }}</span>
                  <button type="button" class="btn btn-sm btn-outline-primary" :disabled="previewLoading === type" @click="preview(type)">
                    <span v-if="previewLoading === type" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="ri-eye-line me-1"></i>
                    Preview
                  </button>
                </div>
                <div class="mb-3">
                  <label class="form-label">Judul</label>
                  <input v-model="form.templates[type].title" class="form-control" :placeholder="'Judul notifikasi untuk ' + type">
                </div>
                <div class="mb-0">
                  <label class="form-label">Isi</label>
                  <textarea v-model="form.templates[type].body" class="form-control" rows="3" :placeholder="'Isi notifikasi untuk ' + type"></textarea>
                </div>
                <div v-if="previewResults[type]" class="alert alert-info mt-3 mb-0">
                  <div class="small text-uppercase fw-medium mb-1">Hasil preview (tidak mengirim notifikasi)</div>
                  <strong class="d-block mb-1">{{ previewResults[type].title }}</strong>
                  <div class="mb-0">{{ previewResults[type].body }}</div>
                </div>
              </div>
            </section>

            <section v-if="editorSection === 'delivery'" class="mb-2">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label">Aggregation strategy</label>
                  <select v-model="form.aggregationStrategy" class="form-select">
                    <option>INDIVIDUAL</option>
                    <option>AGGREGATED</option>
                    <option>DIGEST</option>
                    <option>ACTIVITY_ONLY</option>
                  </select>
                </div>
                <div class="col-md-8">
                  <label class="form-label">Deep-link template</label>
                  <input v-model="form.deepLinkTemplate" class="form-control" placeholder="/module/detail/{{entityId}}">
                </div>
                <div class="col-12">
                  <label class="form-label">Channel aktif</label>
                  <div class="border rounded p-3">
                    <div class="form-check">
                      <input id="channelInApp" class="form-check-input" type="checkbox" checked disabled>
                      <label class="form-check-label" for="channelInApp">IN_APP (satunya channel yang tersedia)</label>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <p v-if="formError" class="text-danger small mb-0 mt-3">{{ formError }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="closeEdit">Batal</button>
            <button type="button" class="btn btn-primary" :disabled="saving" @click="save">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="creating" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.4)" @click.self="creating = false">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tambah Policy</h5>
            <button type="button" class="btn-close" @click="creating = false"></button>
          </div>
          <div class="modal-body">
            <label class="form-label">Registered event</label>
            <CustomSelect2
              v-model="createEventName"
              :options="createEventOptions"
              :get-option-label="eventOptionLabel"
              :get-option-key="(opt) => String(opt?.eventName ?? '')"
              :reduce="(opt) => opt?.eventName"
              :filter-by="filterEventOption"
              searchable
              clearable
              append-to-body
              placeholder="Pilih event..."
              search-placeholder="Cari event name / module..."
              no-options-text="Tidak ada event yang belum dikonfigurasi"
            >
              <template #option="{ option }">
                <div class="d-flex flex-column">
                  <code class="small">{{ option.eventName }}</code>
                  <small class="text-muted">
                    {{ option.module }}
                    <template v-if="option.description"> · {{ option.description }}</template>
                  </small>
                </div>
              </template>
            </CustomSelect2>
            <p class="text-muted small mt-2 mb-0">Event name tidak dapat diketik bebas. Hanya event yang terdaftar di registry yang bisa dipilih.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="creating = false">Batal</button>
            <button type="button" class="btn btn-primary" :disabled="!createEventName" @click="confirmCreate">Buat Policy</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="contractRow" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.4)" @click.self="contractRow = null">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Event Contract</h5>
            <button type="button" class="btn-close" @click="contractRow = null"></button>
          </div>
          <div class="modal-body">
            <p class="mb-1"><strong>{{ contractRow.eventName }}</strong></p>
            <p class="text-muted">{{ contractRow.description }}</p>
            <pre class="small bg-light p-3 rounded">{{ JSON.stringify({
              entityType: contractRow.entityType,
              version: contractRow.version,
              allowedRecipientTypes: contractRow.allowedRecipientTypes,
              payloadSchema: contractRow.payloadSchema,
              publisherStatus: contractRow.publisherStatus,
            }, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>

    <div v-if="logDetailOpen" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.4)" @click.self="closeLogDetail">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Delivery Log Detail</h5>
            <button type="button" class="btn-close" @click="closeLogDetail"></button>
          </div>
          <div class="modal-body">
            <div v-if="store.logDetailLoading" class="text-center py-4">Memuat detail...</div>
            <template v-else-if="store.logDetail">
              <h6 class="text-muted text-uppercase small">Event / Outbox Processing</h6>
              <pre class="small bg-light p-3 rounded mb-4">{{ JSON.stringify(store.logDetail.outbox, null, 2) }}</pre>
              <h6 class="text-muted text-uppercase small">Sanitized Event Envelope</h6>
              <pre class="small bg-light p-3 rounded mb-4">{{ JSON.stringify(store.logDetail.eventEnvelope, null, 2) }}</pre>
              <h6 class="text-muted text-uppercase small">Policy Snapshot</h6>
              <pre class="small bg-light p-3 rounded mb-4">{{ JSON.stringify(store.logDetail.policy, null, 2) }}</pre>
              <h6 class="text-muted text-uppercase small">Recipient Delivery</h6>
              <div v-if="!(store.logDetail.recipientDeliveries as unknown[])?.length" class="text-muted small mb-0">Belum ada recipient delivery untuk outbox ini.</div>
              <div v-for="delivery in (store.logDetail.recipientDeliveries as Array<Record<string, unknown>>)" :key="String(delivery.id)" class="border rounded p-3 mb-2 small">
                <div><strong>{{ delivery.userName || delivery.userId }}</strong> · {{ delivery.recipientType }} · {{ delivery.channel }}</div>
                <div>Status: {{ delivery.deliveryStatus }} · Read: {{ delivery.isRead ? 'yes' : 'no' }}</div>
                <div v-if="delivery.title"><strong>{{ delivery.title }}</strong></div>
                <div v-if="delivery.message">{{ delivery.message }}</div>
                <div v-if="delivery.failureReason" class="text-danger">{{ delivery.failureReason }}</div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div v-if="dryRunResult" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,.4)" @click.self="dryRunResult = null">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Dry-run Policy</h5>
            <button type="button" class="btn-close" @click="dryRunResult = null"></button>
          </div>
          <div class="modal-body">
            <p class="small text-warning">Hasil ini tidak menyimpan delivery, tidak menambah unread, dan tidak mengirim realtime.</p>
            <pre class="small bg-light p-3 rounded">{{ JSON.stringify(dryRunResult, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import CustomSelect2 from '~/components/CustomSelect2.vue'
import ListPageTableHeader from '~/components/list/ListPageTableHeader.vue'
import type { NotificationCatalogRow, NotificationPolicy } from '~/stores/notification-management'

type CreateEventOption = {
  eventName: string
  module: string
  description: string
}

type EditorSection = 'overview' | 'recipients' | 'templates' | 'delivery'

const TAB_QUERY_MAP: Record<string, string> = {
  policies: 'event-policies',
  logs: 'delivery-logs',
  settings: 'global-settings',
}

const QUERY_TAB_MAP: Record<string, string> = {
  'event-policies': 'policies',
  'delivery-logs': 'logs',
  'global-settings': 'settings',
}

definePageMeta({
  title: 'Notification Management',
  layout: 'default',
  middleware: ['auth', 'check-permission'],
})

const route = useRoute()
const router = useRouter()
const store = useNotificationManagementStore()
const { userHasPermission, userHasRole } = usePermissions()

const canManagePolicy = computed(() => userHasRole('superadmin') || userHasPermission('manage_notification_policy'))
const canRetryDelivery = computed(() => userHasRole('superadmin') || userHasPermission('retry_notification_delivery'))
const canManageGlobalSettings = computed(() => userHasRole('superadmin') || userHasPermission('manage_notification_policy'))

const activeTab = ref('policies')
const editing = ref<NotificationPolicy | null>(null)
const editingRow = ref<NotificationCatalogRow | null>(null)
const editorSection = ref<EditorSection>('overview')
const saving = ref(false)
const formError = ref('')
const previewLoading = ref<string | null>(null)
const previewResults = ref<Record<string, { title: string; body: string }>>({})
const creating = ref(false)
const createEventName = ref('')
const contractRow = ref<NotificationCatalogRow | null>(null)
const dryRunResult = ref<Record<string, unknown> | null>(null)
const logDetailOpen = ref(false)
const settingsSaving = ref(false)
const settingsError = ref('')
const settingsForm = ref({
  superadminFeed: {
    enabled: true,
    receiveAllPolicyEvents: true,
    minPriority: 'LOW',
    includeActionable: true,
    includeInformational: true,
    includeWarning: true,
    includeCritical: true,
    informationalContributesUnread: false,
    aggregationBehavior: 'INDIVIDUAL',
    excludedModules: [] as string[],
  },
  deliveryDefaults: {
    defaultMaxAttempts: 8,
    retentionDays: 90,
  },
  version: 1,
})
const form = ref({
  enabled: true,
  category: 'ACTIONABLE',
  priority: 'NORMAL',
  aggregationStrategy: 'INDIVIDUAL',
  notifyMaker: false,
  notifyActor: false,
  notifySuperadmin: false,
  contributesToUnreadCount: true,
  deepLinkTemplate: '',
  version: 1,
  recipients: [] as Array<{ recipientType: string; permissionName?: string; excludeActor?: boolean }>,
  templates: {} as Record<string, { title: string; body: string }>,
})

const tabs = [
  { key: 'policies', label: 'Event Policies' },
  { key: 'logs', label: 'Delivery Logs' },
  { key: 'settings', label: 'Global Settings' },
]

const editorSections = [
  { key: 'overview' as const, label: 'Overview' },
  { key: 'recipients' as const, label: 'Recipients' },
  { key: 'templates' as const, label: 'Templates' },
  { key: 'delivery' as const, label: 'Delivery' },
]

const feedCategoryFlags = [
  { key: 'includeActionable' as const, label: 'Include actionable' },
  { key: 'includeInformational' as const, label: 'Include informational' },
  { key: 'includeWarning' as const, label: 'Include warning' },
  { key: 'includeCritical' as const, label: 'Include critical' },
]

const RECIPIENT_HINTS: Record<string, string> = {
  MAKER: 'User yang membuat atau mengajukan dokumen.',
  ACTOR: 'User yang melakukan tindakan penyebab event.',
  CURRENT_APPROVERS: 'User yang sedang memiliki giliran approval untuk dokumen ini.',
  ASSIGNEE: 'User yang ditugaskan pada entitas terkait.',
  OWNER: 'Pemilik entitas atau dokumen.',
  ROLE: 'Semua user dengan role tertentu.',
  PERMISSION: 'Semua user dengan permission tertentu.',
  DOCUMENT_WATCHERS: 'User yang memantau dokumen ini.',
  SPECIFIC_USERS: 'User spesifik yang dipilih.',
  SUPERADMIN: 'Superadmin yang memenuhi aturan feed global.',
}

const hasFilters = computed(
  () =>
    !!(
      store.params.module ||
      store.params.category ||
      store.params.enabled ||
      store.params.search ||
      store.params.policyStatus ||
      store.params.publisherStatus
    )
)

const unconfiguredEvents = computed(() =>
  (store.events as Array<{ eventName: string }>).filter(
    (event) => !store.catalog.some((row) => row.eventName === event.eventName && row.policyId)
  )
)

const createEventOptions = computed<CreateEventOption[]>(() =>
  unconfiguredEvents.value.map((event) => {
    const full = store.events.find((item) => item.eventName === event.eventName) as
      | { eventName?: string; module?: string; description?: string }
      | undefined
    return {
      eventName: event.eventName,
      module: String(full?.module || ''),
      description: String(full?.description || ''),
    }
  })
)

function eventOptionLabel(option: CreateEventOption | null | undefined) {
  return option?.eventName || ''
}

function filterEventOption(
  option: CreateEventOption,
  _label: string,
  search: string,
) {
  const q = search.toLowerCase().trim()
  if (!q) return true
  return [option.eventName, option.module, option.description]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(q))
}

const statCards = computed(() => [
  { label: 'Registered events', value: store.totalRecords, icon: 'ri-notification-3-line', iconClass: 'bg-label-primary' },
  { label: 'Configured', value: store.catalog.filter((r) => r.policyId).length, icon: 'ri-checkbox-circle-line', iconClass: 'bg-label-success' },
  { label: 'Not configured', value: store.catalog.filter((r) => !r.policyId && r.policyStatus !== 'ORPHANED_POLICY').length, icon: 'ri-node-tree', iconClass: 'bg-label-info' },
  { label: 'Failed outbox', value: store.logs.filter((r) => r.status === 'failed' || r.status === 'dead').length, icon: 'ri-error-warning-line', iconClass: 'bg-label-danger' },
])

const templateTypes = computed(() => {
  const types = new Set(form.value.recipients.map((r) => r.recipientType).filter(Boolean))
  if (form.value.notifyMaker) types.add('MAKER')
  if (form.value.notifyActor) types.add('ACTOR')
  if (form.value.notifySuperadmin) types.add('SUPERADMIN')
  for (const type of types) {
    if (!form.value.templates[type]) form.value.templates[type] = { title: '', body: '' }
  }
  return [...types]
})

const allowedRecipientTypes = computed(() => {
  const fromRow = editingRow.value?.allowedRecipientTypes || []
  return fromRow.length ? fromRow : store.recipientTypes
})

function resolveTabFromQuery() {
  const tab = String(route.query.tab || '')
  return QUERY_TAB_MAP[tab] || 'policies'
}

function setTab(tabKey: string) {
  activeTab.value = tabKey
  router.replace({
    query: {
      ...route.query,
      tab: TAB_QUERY_MAP[tabKey] || 'event-policies',
      ...(tabKey === 'policies' ? {} : { event: undefined }),
    },
  })
}

function recipientTypeHint(type: string) {
  return RECIPIENT_HINTS[type] || ''
}

function registryTooltip(row: NotificationCatalogRow) {
  if (row.registryStatus === 'ORPHANED') return 'Policy merujuk event yang tidak ada di registry.'
  return 'Event tersedia di centralized event registry backend.'
}

function policyStatusTooltip(status: string) {
  if (status === 'REGISTERED_NOT_CONFIGURED') return 'Event tersedia di backend tetapi belum memiliki aturan notifikasi.'
  if (status === 'CONFIGURED_ACTIVE') return 'Policy dikonfigurasi dan aktif.'
  if (status === 'CONFIGURED_INACTIVE') return 'Policy dikonfigurasi tetapi nonaktif.'
  if (status === 'ORPHANED_POLICY') return 'Policy tidak lagi cocok dengan registry event.'
  return status
}

function publisherTooltip(status: string) {
  if (status === 'WIRED') return 'Publisher terdeteksi pada business transaction.'
  return 'Event terdaftar, tetapi belum ada bukti bahwa business transaction menerbitkannya.'
}

function effectiveStatusLabel(status: string) {
  if (status === 'REGISTERED_NOT_CONFIGURED') return 'Not Configured'
  if (status === 'CONFIGURED_ACTIVE') return 'Active'
  if (status === 'CONFIGURED_INACTIVE') return 'Inactive'
  if (status === 'ORPHANED_POLICY' || status === 'INVALID_CONFIGURATION') return 'Invalid'
  if (status === 'PUBLISHER_NOT_DETECTED') return 'Publisher Missing'
  return status
}

function effectiveStatusBadge(status: string) {
  if (status === 'CONFIGURED_ACTIVE') return 'badge bg-label-success'
  if (status === 'CONFIGURED_INACTIVE') return 'badge bg-label-secondary'
  if (status === 'REGISTERED_NOT_CONFIGURED') return 'badge bg-label-warning'
  if (status === 'PUBLISHER_NOT_DETECTED') return 'badge bg-label-warning'
  return 'badge bg-label-danger'
}

function outboxStatusBadge(status: string) {
  if (status === 'delivered') return 'badge bg-label-success'
  if (status === 'failed' || status === 'dead') return 'badge bg-label-danger'
  if (status === 'processing') return 'badge bg-label-info'
  return 'badge bg-label-warning'
}

function resetFilters() {
  store.params.module = ''
  store.params.category = ''
  store.params.enabled = ''
  store.params.search = ''
  store.params.policyStatus = ''
  store.params.publisherStatus = ''
  store.params.page = 1
  loadPolicies()
}

function policyStatusLabel(status: string) {
  if (status === 'REGISTERED_NOT_CONFIGURED') return 'Registered — Not Configured'
  if (status === 'CONFIGURED_ACTIVE') return 'Configured Active'
  if (status === 'CONFIGURED_INACTIVE') return 'Configured Inactive'
  if (status === 'ORPHANED_POLICY') return 'Orphaned'
  return status
}

function policyBadgeClass(status: string) {
  if (status === 'CONFIGURED_ACTIVE') return 'badge bg-success'
  if (status === 'CONFIGURED_INACTIVE') return 'badge bg-secondary'
  if (status === 'ORPHANED_POLICY') return 'badge bg-danger'
  return 'badge bg-label-warning'
}

function formatEmitted(value?: string | null) {
  if (!value) return '—'
  return String(value).replace('T', ' ').slice(0, 19)
}

function openCreate() {
  createEventName.value = createEventOptions.value[0]?.eventName || ''
  creating.value = true
}

function openContract(row: NotificationCatalogRow) {
  contractRow.value = row
}

function openLogs(eventName: string) {
  store.logParams.eventName = eventName
  store.logParams.page = 1
  setTab('logs')
  void loadLogs()
}

async function openLogDetail(id: number) {
  logDetailOpen.value = true
  await store.fetchLogDetail(id)
}

function closeLogDetail() {
  logDetailOpen.value = false
  store.logDetail = null
}

async function loadSettings() {
  const data = await store.fetchSettings()
  if (data) {
    settingsForm.value = {
      superadminFeed: { ...data.superadminFeed },
      deliveryDefaults: {
        defaultMaxAttempts: data.deliveryDefaults.defaultMaxAttempts,
        retentionDays: data.deliveryDefaults.retentionDays,
      },
      version: data.version,
    }
  }
  await store.fetchHealth()
}

async function saveSettings() {
  settingsSaving.value = true
  settingsError.value = ''
  try {
    const res = await store.updateSettings({
      superadminFeed: settingsForm.value.superadminFeed,
      deliveryDefaults: settingsForm.value.deliveryDefaults,
      version: settingsForm.value.version,
    })
    if (res.data) {
      settingsForm.value.version = res.data.version
      store.settings = res.data
    }
  } catch (e: any) {
    settingsError.value = e?.message || 'Gagal menyimpan global settings'
  } finally {
    settingsSaving.value = false
  }
}

function onLogStatusChange() {
  store.logParams.page = 1
  void loadLogs()
}

function onLogRows(rows: number) {
  store.logParams.rows = rows
  store.logParams.page = 1
  void loadLogs()
}

const onLogSearch = useDebounceFn((value: string) => {
  store.logParams.eventName = value
  store.logParams.page = 1
  void loadLogs()
}, 400)

async function loadLogs() {
  await store.fetchLogs()
}

async function createFromRow(row: NotificationCatalogRow) {
  await store.createPolicy(row.eventName)
  await loadPolicies()
}

async function confirmCreate() {
  if (!createEventName.value) return
  await store.createPolicy(createEventName.value)
  creating.value = false
  await loadPolicies()
}

async function runDryRun(eventName: string) {
  const res = await store.dryRun(eventName)
  dryRunResult.value = res.data || res
}

function onRows(rows: number) {
  store.params.rows = rows
  store.params.page = 1
  loadPolicies()
}

const onSearch = useDebounceFn((value: string) => {
  store.params.search = value
  store.params.page = 1
  loadPolicies()
}, 400)

async function loadPolicies() {
  await store.fetchPolicies()
}

function onPolicyFilterChange() {
  store.params.page = 1
  void loadPolicies()
}

function closeEdit() {
  editing.value = null
  editingRow.value = null
  editorSection.value = 'overview'
  formError.value = ''
  previewLoading.value = null
  previewResults.value = {}
  store.preview = null
  router.replace({ query: { ...route.query, event: undefined } })
}

function openEdit(row: NotificationCatalogRow) {
  if (!row.policy) return
  editing.value = row.policy
  editingRow.value = row
  editorSection.value = 'overview'
  formError.value = ''
  previewLoading.value = null
  previewResults.value = {}
  store.preview = null
  router.replace({ query: { ...route.query, tab: 'event-policies', event: row.eventName } })
  const policy = row.policy
  const templates: Record<string, { title: string; body: string }> = {}
  for (const item of policy.templates || []) {
    templates[item.recipientType] = { title: item.titleTemplate, body: item.bodyTemplate }
  }
  form.value = {
    enabled: policy.enabled,
    category: policy.category,
    priority: policy.priority,
    aggregationStrategy: policy.aggregationStrategy,
    notifyMaker: policy.notifyMaker,
    notifyActor: policy.notifyActor,
    notifySuperadmin: policy.notifySuperadmin,
    contributesToUnreadCount: policy.contributesToUnreadCount,
    deepLinkTemplate: policy.deepLinkTemplate || '',
    version: policy.version,
    recipients: (policy.recipients || []).map((r) => ({
      recipientType: r.recipientType,
      permissionName: r.permissionName || '',
      excludeActor: !!r.excludeActor,
    })),
    templates,
  }
}

function addRecipient() {
  form.value.recipients.push({ recipientType: 'CURRENT_APPROVERS', excludeActor: true })
}

async function preview(type: string) {
  if (!editing.value) return
  previewLoading.value = type
  formError.value = ''
  try {
    const data = await store.previewTemplate({
      eventName: editing.value.eventName,
      recipientType: type,
      title: form.value.templates[type]?.title || '',
      body: form.value.templates[type]?.body || '',
    })
    previewResults.value = { ...previewResults.value, [type]: data }
  } catch (e: any) {
    formError.value = e?.message || 'Preview gagal'
  } finally {
    previewLoading.value = null
  }
}

async function save() {
  if (!editing.value) return
  saving.value = true
  formError.value = ''
  try {
    await store.updatePolicy(editing.value.id, {
      ...form.value,
      version: form.value.version,
    })
    closeEdit()
    await loadPolicies()
  } catch (e: any) {
    formError.value = e?.message || 'Gagal menyimpan'
  } finally {
    saving.value = false
  }
}

async function toggleEnabled(policy: NotificationPolicy) {
  await store.updatePolicy(policy.id, { enabled: !policy.enabled, version: policy.version })
  await loadPolicies()
}

async function retry(id: number) {
  await store.retryOutbox(id)
  await loadLogs()
}

watch(activeTab, (tab) => {
  if (tab === 'logs') void loadLogs()
  if (tab === 'settings') void loadSettings()
})

watch(
  () => route.query.tab,
  () => {
    const next = resolveTabFromQuery()
    if (activeTab.value !== next) activeTab.value = next
  }
)

onMounted(async () => {
  activeTab.value = resolveTabFromQuery()
  await store.fetchEvents()
  await Promise.all([
    loadPolicies(),
    loadLogs(),
    activeTab.value === 'settings' ? loadSettings() : store.fetchHealth(),
  ])

  const eventQuery = String(route.query.event || '')
  if (eventQuery) {
    const row = store.catalog.find((item) => item.eventName === eventQuery)
    if (row?.policy) openEdit(row)
  }
})

</script>
