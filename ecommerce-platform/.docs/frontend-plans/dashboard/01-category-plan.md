# QUY HO?CH K? THU?T FRONTEND: TRANG QU?N LÝ CHUYÊN M?C S?N PH?M

> **Ngu?n:** `.docs/ideas/dashboard/01-category-idea.md`
> **Mockup tham chi?u:** `.docs/ui-mockups/dash-products/index.html`
> **?ng d?ng m?c tiêu:** Admin Dashboard (`app/dash/my-app`)
> **Phiên b?n:** 1.0.0
> **Ngày t?o:** 2026-08-11

---

## 1. PHÂN RÃ COMPONENT (COMPONENT TREE)

CategoryPage [SERVER]                            -> app/dash/my-app/app/(dashboard)/categories/page.tsx
|
+-- CategoryPageClient [CLIENT]                  -> app/dash/my-app/features/categories/components/category-page-client.tsx
    |
    +-- CategoryPageHeader [DUMB]                -> features/categories/components/category-page-header.tsx
    |   +-- AddCategoryButton (inline)
    |
    +-- CategoryFilterBar [CLIENT]               -> features/categories/components/category-filter-bar.tsx
    |   +-- SearchInput * Shared UI (reuse)      -> components/ui/search-input.tsx
    |
    +-- CategoryTable [DUMB]                     -> features/categories/components/category-table.tsx
    |   +-- CategoryTableRow [DUMB]              -> features/categories/components/category-table-row.tsx
    |       +-- Anh Icon (next/image)
    |       +-- Ten chuyen muc
    |       +-- Chuyen muc cha
    |       +-- StatusBadge [DUMB]               -> features/categories/components/status-badge.tsx
    |       +-- ViewLinkButton (icon ExternalLink, href frontend)
    |       +-- EditButton (icon Pencil, onClick)
    |       +-- DeleteButton (icon Trash2, onClick)
    |
    +-- CategoryPagination [DUMB]                -> features/categories/components/category-pagination.tsx
    |
    +-- CategoryFormModal [CLIENT]               -> features/categories/components/category-form-modal.tsx
    |   +-- Modal overlay + panel
    |   +-- Form: Ten, Slug, Icon URL, Parent, Status
    |   +-- Submit / Cancel
    |
    +-- DeleteConfirmModal [CLIENT]              -> features/categories/components/delete-confirm-modal.tsx
        +-- Confirm message
        +-- Confirm / Cancel

## 2. QUAN LY TRANG THAI (STATE MANAGEMENT)

All states are local inside CategoryPageClient:

| State              | Type            | Strategy                       |
|--------------------|-----------------|--------------------------------|
| searchQuery        | string          | useState + useDebounce(300ms)  |
| currentPage        | number          | useState                       |
| isFormModalOpen    | boolean         | useState                       |
| editingCategory    | Category | null | useState                       |
| deletingCategoryId | string | null  | useState                       |
| categories         | Category[]      | useState (mockup data)         |

## 3. INTERFACES

// features/categories/types/category.types.ts
export type CategoryStatus = 'ACTIVE' | 'INACTIVE';
export interface Category {
  id: string; name: string; slug: string;
  iconUrl: string | null; parentId: string | null;
  parentName: string | null; status: CategoryStatus; productCount: number;
}
export interface CategoryFormData {
  name: string; slug: string; iconUrl: string;
  parentId: string | null; status: CategoryStatus;
}

## 4. DESIGN CONSTRAINTS (from mockup)

| Element          | Tailwind Classes                                                      |
|------------------|-----------------------------------------------------------------------|
| Nen trang        | bg-gray-50                                                            |
| Card table       | bg-white rounded-3xl shadow-sm border border-gray-100                |
| Header cot table | bg-gray-50/80 text-xs font-extrabold text-gray-500 uppercase tracking-widest |
| Row hover        | hover:bg-gray-50 transition-colors                                   |
| Icon container   | w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100             |
| Nut Edit         | p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl   |
| Nut Delete       | p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl     |
| Nut View         | p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl |
| Nut Add Primary  | bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl     |
| Badge ACTIVE     | bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full |
| Badge INACTIVE   | bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full  |
| Modal overlay    | fixed inset-0 bg-black/40 backdrop-blur-sm z-50                      |
| Modal panel      | bg-white rounded-2xl shadow-2xl w-full max-w-md p-6                 |

## 5. C?U TRÚC THU M?C

app/dash/my-app/
|-- app/(dashboard)/categories/page.tsx          [NEW]
|-- features/categories/
    |-- types/category.types.ts                  [NEW]
    |-- data/mock-categories.ts                  [NEW]
    |-- components/
        |-- category-page-client.tsx             [NEW]
        |-- category-page-header.tsx             [NEW]
        |-- category-filter-bar.tsx              [NEW]
        |-- category-table.tsx                   [NEW]
        |-- category-table-row.tsx               [NEW]
        |-- status-badge.tsx                     [NEW]
        |-- category-pagination.tsx              [NEW]
        |-- category-form-modal.tsx              [NEW]
        |-- delete-confirm-modal.tsx             [NEW]
