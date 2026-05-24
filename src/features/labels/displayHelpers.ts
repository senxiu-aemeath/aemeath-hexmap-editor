import {
  BUILT_IN_LABEL_GROUP_IDS,
  type GovernmentType,
  type LabelGroup,
} from '../../domain/world'
import type { AppMessages } from '../../i18n'

const BUILT_IN_LABEL_GROUP_DEFAULT_NAMES: Record<string, string> = {
  [BUILT_IN_LABEL_GROUP_IDS.cityName]: 'City Names',
  [BUILT_IN_LABEL_GROUP_IDS.citySecondName]: 'City Second Names',
  [BUILT_IN_LABEL_GROUP_IDS.countryName]: 'Country Names',
  [BUILT_IN_LABEL_GROUP_IDS.provinceName]: 'Province Names',
  [BUILT_IN_LABEL_GROUP_IDS.countryIcon]: 'Country Icons',
  [BUILT_IN_LABEL_GROUP_IDS.countrySecondName]: 'Country Second Names',
  [BUILT_IN_LABEL_GROUP_IDS.freeLabel]: 'Free Labels',
  [BUILT_IN_LABEL_GROUP_IDS.freeIcon]: 'Free Icons',
}

const BUILT_IN_GOVERNMENT_TYPE_DEFAULT_NAMES: Record<string, string> = {
  monarchy: 'Monarchy',
  republic: 'Republic',
  theocracy: 'Theocracy',
  steppe_horde: 'Steppe Horde',
  tribe: 'Tribe',
}

export function getBuiltInLabelGroupDisplayName(group: LabelGroup, ui: AppMessages) {
  const defaultName = BUILT_IN_LABEL_GROUP_DEFAULT_NAMES[group.id]
  if (!group.builtIn || !defaultName || group.name !== defaultName) {
    return group.name
  }

  switch (group.id) {
    case BUILT_IN_LABEL_GROUP_IDS.cityName:
      return ui.label.cityName
    case BUILT_IN_LABEL_GROUP_IDS.citySecondName:
      return `${ui.label.cityName} ${ui.label.secondaryName}`
    case BUILT_IN_LABEL_GROUP_IDS.countryName:
      return ui.label.countryName
    case BUILT_IN_LABEL_GROUP_IDS.countrySecondName:
      return `${ui.label.countryName} ${ui.label.secondaryName}`
    case BUILT_IN_LABEL_GROUP_IDS.provinceName:
      return ui.label.provinceName
    case BUILT_IN_LABEL_GROUP_IDS.countryIcon:
      return ui.label.countryIcon
    case BUILT_IN_LABEL_GROUP_IDS.freeLabel:
      return `${ui.common.free} ${ui.common.labelItem}`
    case BUILT_IN_LABEL_GROUP_IDS.freeIcon:
      return `${ui.common.free} ${ui.common.icon}`
    default:
      return group.name
  }
}

export function getBuiltInGovernmentTypeDisplayName(
  governmentType: GovernmentType,
  ui: AppMessages,
) {
  const defaultName = BUILT_IN_GOVERNMENT_TYPE_DEFAULT_NAMES[governmentType.id]
  if (!defaultName || governmentType.name !== defaultName) {
    return governmentType.name
  }

  switch (governmentType.id) {
    case 'monarchy':
      return ui.political.governmentMonarchy
    case 'republic':
      return ui.political.governmentRepublic
    case 'theocracy':
      return ui.political.governmentTheocracy
    case 'steppe_horde':
      return ui.political.governmentSteppeHorde
    case 'tribe':
      return ui.political.governmentTribe
    default:
      return governmentType.name
  }
}

export function areStringArraysEqual(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false
  }

  return left.every((value, index) => value === right[index])
}
