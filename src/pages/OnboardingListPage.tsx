import { onboardingRows } from '../data/wireframeModules'
import { WireframeModuleListPage } from './WireframeModuleListPage'

export function OnboardingListPage() {
  return (
    <WireframeModuleListPage
      current="Onboarding"
      boxTitle="Onboarding checklist"
      rows={onboardingRows}
      searchPlaceholder="Search employee or code..."
      detailColumn="Progress"
    />
  )
}
