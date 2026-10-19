<template>
  <AdminTabs>
    <el-button type="primary" @click="openForm()">+ เพิ่มคลิป</el-button>
  </AdminTabs>

  <div class="rounded-3xl bg-surface p-4 md:p-6">
    <p class="mb-4 text-sm text-mute">คลิปที่ผูกกับเมนูจะขึ้นในหน้าวันนี้และหน้าอาหาร เมื่อเมนูนั้นถูกแนะนำ</p>
    <el-table v-loading="loading" :data="rows" row-key="id">
      <el-table-column label="คลิป" min-width="280">
        <template #default="{ row }">
          <a :href="(row as Clip).watchUrl" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3">
            <img :src="(row as Clip).thumbnailUrl" alt="" class="aspect-video w-28 rounded-lg object-cover" />
            <span><span class="block font-medium">{{ row.title }}</span><span class="text-sm text-mute">{{ row.channel }} · {{ formatDuration(row.durationSec) }}</span></span>
          </a>
        </template>
      </el-table-column>
      <el-table-column label="เมนูที่ผูก" min-width="200">
        <template #default="{ row }">{{ (row as Clip).foodIds.map((id) => foodName(id)).join(', ') || '–' }}</template>
      </el-table-column>
      <el-table-column width="140" align="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openForm(row as Clip)">แก้ไข</el-button>
          <el-button link type="danger" @click="remove(row as Clip)">ลบ</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="mt-4 flex justify-end gap-2">
      <el-button :disabled="page <= 1" @click="load(page - 1)">ก่อนหน้า</el-button>
      <el-button :disabled="!hasMore" @click="load(page + 1)">ถัดไป</el-button>
    </div>
  </div>

  <el-dialog v-model="formOpen" :title="editing ? 'แก้ไขคลิป' : 'เพิ่มคลิป'" width="min(560px, 92vw)">
    <el-form label-position="top" @submit.prevent="save">
      <el-form-item label="ลิงก์ YouTube"><el-input v-model="form.youtubeId" placeholder="https://www.youtube.com/watch?v=…" /></el-form-item>
      <el-form-item label="ชื่อคลิป"><el-input v-model="form.title" /></el-form-item>
      <div class="grid grid-cols-2 gap-3">
        <el-form-item label="ช่อง"><el-input v-model="form.channel" /></el-form-item>
        <el-form-item label="ความยาว (นาที:วินาที)"><el-input v-model="duration" placeholder="8:24" /></el-form-item>
      </div>
      <el-form-item label="เมนูที่เกี่ยวข้อง">
        <el-select v-model="form.foodIds" multiple filterable remote :remote-method="searchFoods" :loading="foodsLoading" placeholder="พิมพ์ชื่อเมนู" class="w-full">
          <el-option v-for="f in foodOptions" :key="f.id" :label="f.nameTh" :value="f.id" />
        </el-select>
      </el-form-item>
      <el-button type="primary" native-type="submit" class="w-full" :loading="saving" :disabled="!canSave">บันทึก</el-button>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { createClip, deleteClip, listClips, updateClip } from '@/api/health/clip.api'
import { listFoods } from '@/api/health/food.api'
import AdminTabs from '@/components/admin/AdminTabs.vue'
import { useMessage } from '@/use/useMessage'
import { getApiErrorMessage } from '@/utils/apiError'
import { formatDuration } from '@/utils/date'
import type { Clip, ClipUpsert, Food } from '@/types/health.types'

const PAGE_SIZE = 20
const { showError, showSuccess } = useMessage()

const rows = ref<Clip[]>([])
const page = ref(1)
const hasMore = ref(false)
const loading = ref(false)
// ชื่อเมนูของ id ที่เคยเห็น ใช้แสดงในตารางและตัวเลือก
const foodNames = reactive<Record<string, string>>({})
const foodName = (id: string) => foodNames[id] ?? 'เมนูที่ถูกลบ'

const load = async (p = 1) => {
  loading.value = true
  try {
    const res = await listClips({ page: p, limit: PAGE_SIZE })
    rows.value = res.data
    page.value = p
    hasMore.value = res.pagination.hasMore
  } catch (err) {
    showError(getApiErrorMessage(err))
  } finally {
    loading.value = false
  }
}

const foodOptions = ref<Food[]>([])
const foodsLoading = ref(false)
const searchFoods = async (q: string) => {
  foodsLoading.value = true
  try {
    foodOptions.value = (await listFoods({ q: q.trim() || undefined, limit: 30 })).data
    foodOptions.value.forEach((f) => (foodNames[f.id] = f.nameTh))
  } finally {
    foodsLoading.value = false
  }
}

const formOpen = ref(false)
const editing = ref<Clip | null>(null)
const saving = ref(false)
const form = reactive<ClipUpsert>({ youtubeId: '', title: '', channel: '', durationSec: 0, foodIds: [], tags: [] })
const duration = ref('')

// รับ 8:24 หรือ 1:02:03 เป็นวินาที
const parseDuration = (s: string): number => {
  const parts = s.trim().split(':').map(Number)
  if (!parts.length || parts.some((n) => !Number.isInteger(n) || n < 0)) return 0
  return parts.reduce((acc, n) => acc * 60 + n, 0)
}
const canSave = computed(() => !!form.youtubeId.trim() && !!form.title.trim() && !!form.channel.trim() && parseDuration(duration.value) > 0)

const openForm = (c?: Clip) => {
  editing.value = c ?? null
  Object.assign(form, c ? { youtubeId: c.watchUrl, title: c.title, channel: c.channel, durationSec: c.durationSec, foodIds: [...c.foodIds], tags: [...c.tags] } : { youtubeId: '', title: '', channel: '', durationSec: 0, foodIds: [], tags: [] })
  duration.value = c ? formatDuration(c.durationSec) : ''
  // ตัวเลือกต้องมีเมนูที่ผูกอยู่แล้ว ไม่งั้น select แสดงเป็น id
  foodOptions.value = (c?.foodIds ?? []).map((id) => ({ id, nameTh: foodName(id) }) as Food)
  formOpen.value = true
}

const save = async () => {
  saving.value = true
  try {
    const payload = { ...form, durationSec: parseDuration(duration.value) }
    if (editing.value) await updateClip(editing.value.id, payload)
    else await createClip(payload)
    formOpen.value = false
    showSuccess('บันทึกแล้ว')
    await load(page.value)
  } catch (err) {
    showError(getApiErrorMessage(err))
  } finally {
    saving.value = false
  }
}

const remove = async (c: Clip) => {
  try {
    await ElMessageBox.confirm(`ลบคลิป ${c.title}?`, 'ลบคลิป', { confirmButtonText: 'ลบ', cancelButtonText: 'ยกเลิก', type: 'warning' })
  } catch {
    return
  }
  try {
    await deleteClip(c.id)
    await load(page.value)
  } catch (err) {
    showError(getApiErrorMessage(err))
  }
}

onMounted(async () => {
  // โหลดชื่อเมนูทั้งหมดครั้งเดียว ฐานเมนูมีไม่กี่ร้อยรายการ
  const all = await listFoods({ limit: 100 }).catch(() => null)
  all?.data.forEach((f) => (foodNames[f.id] = f.nameTh))
  await load(1)
})
</script>
