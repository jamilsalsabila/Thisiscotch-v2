import type { Database } from '@/types/database'
import type { SiteData } from '@/lib/site'

export type MenuItem = Database['public']['Tables']['menu_items']['Row']

export type MenuLabels = Record<string, { en: string; id: string }>

export function buildMenuPresentation(items: MenuItem[], site: SiteData) {
  const grouped = items.reduce<Record<string, Record<string, MenuItem[]>>>((acc, item) => {
    acc[item.category] ??= {}
    acc[item.category][item.subcategory || 'general'] ??= []
    acc[item.category][item.subcategory || 'general'].push(item)
    return acc
  }, {})

  const orderedCategories = Object.keys(site.menuCategories).filter(category => grouped[category])
  const fallbackCategories = Object.keys(grouped).filter(category => !orderedCategories.includes(category))
  const categories = [...orderedCategories, ...fallbackCategories]
  const labels: MenuLabels = Object.fromEntries(
    categories.map(category => [
      category,
      {
        en: site.menuCategories[category]?.label_en ?? category.replace(/[-_]/g, ' '),
        id: site.menuCategories[category]?.label_id ?? category.replace(/[-_]/g, ' '),
      },
    ])
  )

  return { grouped, categories, labels }
}
