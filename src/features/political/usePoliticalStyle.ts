import { useState } from 'react'

export function usePoliticalStyle() {
  const [cityStatesFillTerritory, setCityStatesFillTerritory] = useState(true)
  const [countryFillOpacity, setCountryFillOpacity] = useState(0.72)
  const [countryBorderColor, setCountryBorderColor] = useState('#f6eed2')
  const [countryBorderWidth, setCountryBorderWidth] = useState(2.4)
  const [countryBorderOpacity, setCountryBorderOpacity] = useState(1)
  const [countrySharedBorderOverridesOwn, setCountrySharedBorderOverridesOwn] = useState(true)
  const [countrySharedBorderMode, setCountrySharedBorderMode] = useState<'uniform' | 'mixed'>('uniform')
  const [provinceFillOpacity, setProvinceFillOpacity] = useState(0.36)
  const [provinceBorderColor, setProvinceBorderColor] = useState('#2b1c16')
  const [provinceBorderWidth, setProvinceBorderWidth] = useState(1.4)
  const [provinceBorderOpacity, setProvinceBorderOpacity] = useState(0.94)
  const [provinceBorderOverridesCountryBorder, setProvinceBorderOverridesCountryBorder] = useState(false)

  return {
    cityStatesFillTerritory, setCityStatesFillTerritory,
    countryFillOpacity, setCountryFillOpacity,
    countryBorderColor, setCountryBorderColor,
    countryBorderWidth, setCountryBorderWidth,
    countryBorderOpacity, setCountryBorderOpacity,
    countrySharedBorderOverridesOwn, setCountrySharedBorderOverridesOwn,
    countrySharedBorderMode, setCountrySharedBorderMode,
    provinceFillOpacity, setProvinceFillOpacity,
    provinceBorderColor, setProvinceBorderColor,
    provinceBorderWidth, setProvinceBorderWidth,
    provinceBorderOpacity, setProvinceBorderOpacity,
    provinceBorderOverridesCountryBorder, setProvinceBorderOverridesCountryBorder,
  }
}

export type PoliticalStyleState = ReturnType<typeof usePoliticalStyle>
