import type { ComponentProps } from 'react'
import { useUiMessages } from '../../i18n'
import type { PoliticalSubMode } from '../../political/types'
import { CitiesSection } from './CitiesSection'
import { CityAutomationSection } from './CityAutomationSection'
import { CityStyleSection } from './CityStyleSection'
import { CityLevelsSection } from './CityLevelsSection'
import { CountryStyleSection } from './CountryStyleSection'
import { CountrySection } from './CountrySection'
import { GovernmentTypesSection } from './GovernmentTypesSection'
import { ProvinceSection } from './ProvinceSection'
import { ProvinceStyleSection } from './ProvinceStyleSection'

interface PoliticalPanelProps {
  politicalSubMode: PoliticalSubMode
  countrySection?: ComponentProps<typeof CountrySection>
  governmentTypesSection?: ComponentProps<typeof GovernmentTypesSection>
  countryStyleSection?: ComponentProps<typeof CountryStyleSection>
  provinceStyleSection?: ComponentProps<typeof ProvinceStyleSection>
  cityStyleSection?: ComponentProps<typeof CityStyleSection>
  provinceSection?: ComponentProps<typeof ProvinceSection>
  cityLevelsSection?: ComponentProps<typeof CityLevelsSection>
  cityAutomationSection?: ComponentProps<typeof CityAutomationSection>
  citiesSection?: ComponentProps<typeof CitiesSection>
}

export function PoliticalPanel({ politicalSubMode,
  countrySection,
  governmentTypesSection,
  countryStyleSection,
  provinceStyleSection,
  cityStyleSection,
  provinceSection,
  cityLevelsSection,
  cityAutomationSection,
  citiesSection,
}: PoliticalPanelProps) {
  const ui = useUiMessages()
  void ui

  return (
    <>
      {politicalSubMode === 'country' &&
        countryStyleSection &&
        governmentTypesSection &&
        countrySection && (
        <section className="tool-section-stack section-gap">
          <CountryStyleSection {...countryStyleSection} />
          <GovernmentTypesSection {...governmentTypesSection} />
          <CountrySection {...countrySection} />
        </section>
      )}

      {politicalSubMode === 'city' &&
        cityStyleSection &&
        cityAutomationSection &&
        cityLevelsSection &&
        citiesSection && (
        <section className="tool-section-stack city-panel section-gap">
          <CityStyleSection {...cityStyleSection} />
          <CityAutomationSection {...cityAutomationSection} />
          <CityLevelsSection {...cityLevelsSection} />
          <CitiesSection {...citiesSection} />
        </section>
      )}

      {politicalSubMode === 'province' &&
        provinceStyleSection &&
        provinceSection && (
        <section className="tool-section-stack section-gap">
          <ProvinceStyleSection {...provinceStyleSection} />
          <ProvinceSection {...provinceSection} />
        </section>
      )}
    </>
  )
}
