import type { ComponentProps } from 'react'

import type { PoliticalSubMode } from '../../political/types'
import { PoliticalPanel } from './PoliticalPanel'

interface PoliticalPanelContainerProps {
  politicalSubMode: PoliticalSubMode
  countrySectionProps?: ComponentProps<typeof PoliticalPanel>['countrySection']
  governmentTypesSectionProps?: ComponentProps<typeof PoliticalPanel>['governmentTypesSection']
  countryStyleSectionProps?: ComponentProps<typeof PoliticalPanel>['countryStyleSection']
  provinceStyleSectionProps?: ComponentProps<typeof PoliticalPanel>['provinceStyleSection']
  cityStyleSectionProps?: ComponentProps<typeof PoliticalPanel>['cityStyleSection']
  provinceSectionProps?: ComponentProps<typeof PoliticalPanel>['provinceSection']
  cityLevelsSectionProps?: ComponentProps<typeof PoliticalPanel>['cityLevelsSection']
  cityAutomationSectionProps?: ComponentProps<typeof PoliticalPanel>['cityAutomationSection']
  citiesSectionProps?: ComponentProps<typeof PoliticalPanel>['citiesSection']
}

export function PoliticalPanelContainer({ politicalSubMode,
  countrySectionProps,
  governmentTypesSectionProps,
  countryStyleSectionProps,
  provinceStyleSectionProps,
  cityStyleSectionProps,
  provinceSectionProps,
  cityLevelsSectionProps,
  cityAutomationSectionProps,
  citiesSectionProps,
}: PoliticalPanelContainerProps) {
  return (
    <PoliticalPanel
      politicalSubMode={politicalSubMode}
      countrySection={countrySectionProps}
      governmentTypesSection={governmentTypesSectionProps}
      countryStyleSection={countryStyleSectionProps}
      provinceStyleSection={provinceStyleSectionProps}
      cityStyleSection={cityStyleSectionProps}
      provinceSection={provinceSectionProps}
      cityLevelsSection={cityLevelsSectionProps}
      cityAutomationSection={cityAutomationSectionProps}
      citiesSection={citiesSectionProps}
    />
  )
}
