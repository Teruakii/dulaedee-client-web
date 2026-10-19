<template>
  <AdminTabs>
    <el-button type="primary" @click="openForm()">+ เพิ่มเมนู</el-button>
  </AdminTabs>

  <div class="rounded-3xl bg-surface p-4 md:p-6">
    <div class="mb-4 flex flex-wrap gap-3">
      <el-input v-model="query" placeholder="ค้นหาเมนู" clearable class="!w-64" />
      <el-select v-model="tag" placeholder="ทุกหมวด" clearable class="!w-48">
        <el-option v-for="(label, key) in FOOD_TAG_LABELS" :key="key" :label="label" :value="key" />
      </el-select>
      <p class="ml-auto self-center text-sm text-mute">ยังไม่ยืนยัน = ค่าประมาณ ต้องเทียบตาราง INMUCAL ก่อน</p>
    </div>
    <el-table v-loading="loading" :data="rows" row-key="id">
      <el-table-column prop="nameTh" label="เมนู" min-width="200" />
      <el-table-column label="หน่วย" width="90"><template #default="{ row }">{{ UNIT_LABELS[(row as Food).unit] }}</template></el-table-column>
      <el-table-column prop="kcal" label="kcal" width="90" align="right" />
      <el-table-column label="P / C / F" width="140" align="right"><template #default="{ row }">{{ row.proteinG }} / {{ row.carbG }} / {{ row.fatG }}</template></el-table-column>
      <el-table-column label="หมวด" min-width="180">
        <template #default="{ row }"><el-tag v-for="t in (row as Food).tags" :key="t" size="small" class="mr-1">{{ FOOD_TAG_LABELS[t] }}</el-tag></template>
      </el-table-column>
      <el-table-column label="ยืนยันค่าแล้ว" width="120" align="center">
        <template #default="{ row }"><el-switch :model-value="(row as Food).verified" @change="(v: string | number | boolean) => setVerified(row as Food, Boolean(v))" /></template>
      </el-table-column>
      <el-table-column width="140" align="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openForm(row as Food)">แก้ไข</el-button>
          <el-button v-if="isAdmin" link type="danger" @click="remove(row as Food)">ลบ</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="mt-4 flex justify-end gap-2">
      <el-button :disabled="page <= 1" @click="load(page - 1)">ก่อนหน้า</el-button>
      <el-button :disabled="!hasMore" @click="load(page + 1)">ถัดไป</el-button>
    </div>
  </div>

  <el-dialog v-model="formOpen" :title="editing ? 'แก้ไขเมนู' : 'เพิ่มเมนู'" width="min(560px, 92vw)">
    <el-form label-position="top" @submit.prevent="save">
      <el-form-item label="ชื่อเมนู"><el-input v-model="form.nameTh" /></el-form-item>
      <div class="grid grid-cols-2 gap-3">
        <el-form-item label="หน่วย">
          <el-select v-model="form.unit"><el-option v-for="(label, key) in UNIT_LABELS" :key="key" :label="label" :value="key" /></el-select>
        </el-form-item>
        <el-form-item label="kcal ต่อหน่วย"><el-input-number v-model="form.kcal" :min="0" :max="5000" class="!w-full" /></el-form-item>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <el-form-item label="โปรตีน ก."><el-input-number v-model="form.proteinG" :min="0" :max="500" :controls="false" class="!w-full" /></el-form-item>
        <el-form-item label="คาร์บ ก."><el-input-number v-model="form.carbG" :min="0" :max="500" :controls="false" class="!w-full" /></el-form-item>
        <el-form-item label="ไขมัน ก."><el-input-number v-model="form.fatG" :min="0" :max="500" :controls="false" class="!w-full" /></el-form-item>
      </div>
      <el-form-item label="หมวด">
        <el-checkbox-group v-model="form.tags"><el-checkbox v-for="(label, key) in FOOD_TAG_LABELS" :key="key" :value="key">{{ label }}</el-checkbox></el-checkbox-group>
      </el-form-item>
      <el-form-item><el-checkbox v-model="form.verified">เทียบกับตารางอ้างอิงแล้ว</el-checkbox></el-form-item>
      <el-button type="primary" native-type="submit" class="w-full" :loading="saving" :disabled="!form.nameTh.trim()">บันทึก</el-button>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import { createFood, deleteFood, listFoods, updateFood } from '@/api/health/food.api'
import AdminTabs from '@/components/admin/AdminTabs.vue'
import { useUserStore } from '@/stores/user.pinia'
import { useMessage } from '@/use/useMessage'
import { getApiErrorMessage } from '@/utils/apiError'
import { FOOD_TAG_LABELS, UNIT_LABELS } from '@/utils/labels'
import type { Food, FoodTag, FoodUpsert } from '@/types/health.types'

const PAGE_SIZE = 20
const EMPTY: FoodUpsert = { nameTh: '', unit: 'plate', kcal: 0, proteinG: 0, carbG: 0, fatG: 0, tags: [], verified: false }

const { showError, showSuccess } = useMessage()

const query = ref('')
const tag = ref<FoodTag | ''>('')
const rows = ref<Food[]>([])
const page = ref(1)
const hasMore = ref(false)
const loading = ref(false)

const load = async (p = 1) => {
  loading.value = true
  try {
    const res = await listFoods({ q: query.value.trim() || undefined, tag: tag.value || undefined, page: p, limit: PAGE_SIZE })
    rows.value = res.data
    page.value = p
    hasMore.value = res.pagination.hasMore
  } catch (err) {
    showError(getApiErrorMessage(err))
  } finally {
    loading.value = false
  }
}

let timer: ReturnType<typeof setTimeout> | undefined
watch(query, () => {
  clearTimeout(timer)
  timer = setTimeout(() => load(1), 250)
})
watch(tag, () => load(1))

const formOpen = ref(false)
const editing = ref<Food | null>(null)
const saving = ref(false)
const form = reactive<FoodUpsert>({ ...EMPTY })

const openForm = (f?: Food) => {
  editing.value = f ?? null
  const { id: _id, ...rest } = f ?? { id: '', ...EMPTY }
  Object.assign(form, { ...rest, tags: [...rest.tags] })
  formOpen.value = true
}

const save = async () => {
  saving.value = true
  try {
    const payload = { ...form, nameTh: form.nameTh.trim() }
    if (editing.value) await updateFood(editing.value.id, payload)
    else await createFood(payload)
    formOpen.value = false
    showSuccess('บันทึกแล้ว')
    await load(page.value)
  } catch (err) {
    showError(getApiErrorMessage(err))
  } finally {
    saving.value = false
  }
}

const setVerified = async (f: Food, verified: boolean) => {
  try {
    const { id, ...rest } = f
    Object.assign(f, await updateFood(id, { ...rest, verified }))
  } catch (err) {
    showError(getApiErrorMessage(err))
  }
}

// ลบได้เฉพาะ ADMIN (server ตอบ 403 ให้ STAFF) จึงซ่อนปุ่มจาก STAFF
const userStore = useUserStore()
const isAdmin = computed(() => userStore.userProfile?.role === 'ADMIN')
const remove = async (f: Food) => {
  try {
    await ElMessageBox.confirm(`ลบ ${f.nameTh}? บันทึกเก่าของผู้ใช้ยังอยู่ครบ`, 'ลบเมนู', { confirmButtonText: 'ลบ', cancelButtonText: 'ยกเลิก', type: 'warning' })
  } catch {
    return
  }
  try {
    await deleteFood(f.id)
    await load(page.value)
  } catch (err) {
    showError(getApiErrorMessage(err))
  }
}

onMounted(() => load(1))
</script>
