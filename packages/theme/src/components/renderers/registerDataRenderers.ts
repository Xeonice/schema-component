import { getRegistry } from '../../core'
import type { DataRendererRegistration } from '../../types'

// Import renderers
import {
  TextRenderer,
  EmailRenderer,
  UrlRenderer,
  PhoneRenderer,
  TextareaRenderer,
  PasswordRenderer,
  ColorRenderer,
} from './data/string'

import {
  NumberRenderer,
  IntegerRenderer,
  FloatRenderer,
  CurrencyRenderer,
  PercentRenderer,
} from './data/number'

import {
  CheckboxRenderer,
  SwitchRenderer,
  BadgeRenderer,
} from './data/boolean'

import {
  DateRenderer,
  DateTimeRenderer,
  TimestampRenderer,
  RelativeTimeRenderer,
} from './data/date'

import {
  ArrayRenderer,
  TagArrayRenderer,
} from './data/array'

import {
  ObjectRenderer,
  KeyValueRenderer,
} from './data/object'

import {
  BelongsToRenderer,
  HasManyRenderer,
  ManyToManyRenderer,
} from './data/relation'

import {
  ImageRenderer,
  FileRenderer,
} from './data/media'

import {
  JSONRenderer,
  CodeRenderer,
} from './data/special'

/**
 * Register all data renderers
 */
export function registerDataRenderers() {
  const registry = getRegistry()

  // String renderers
  registry.registerDataRenderer('string', {
    component: TextRenderer,
    displayName: 'Text',
    supportsEdit: true,
  })

  registry.registerDataRenderer('text', {
    component: TextRenderer,
    displayName: 'Text',
    supportsEdit: true,
  })

  registry.registerDataRenderer('email', {
    component: EmailRenderer,
    displayName: 'Email',
    supportsEdit: true,
  })

  registry.registerDataRenderer('url', {
    component: UrlRenderer,
    displayName: 'URL',
    supportsEdit: true,
  })

  registry.registerDataRenderer('phone', {
    component: PhoneRenderer,
    displayName: 'Phone',
    supportsEdit: true,
  })

  registry.registerDataRenderer('textarea', {
    component: TextareaRenderer,
    displayName: 'Textarea',
    supportsEdit: true,
  })

  registry.registerDataRenderer('password', {
    component: PasswordRenderer,
    displayName: 'Password',
    supportsEdit: true,
  })

  registry.registerDataRenderer('color', {
    component: ColorRenderer,
    displayName: 'Color',
    supportsEdit: true,
  })

  // Number renderers
  registry.registerDataRenderer('number', {
    component: NumberRenderer,
    displayName: 'Number',
    supportsEdit: true,
  })

  registry.registerDataRenderer('integer', {
    component: IntegerRenderer,
    displayName: 'Integer',
    supportsEdit: true,
  })

  registry.registerDataRenderer('float', {
    component: FloatRenderer,
    displayName: 'Float',
    supportsEdit: true,
  })

  registry.registerDataRenderer('currency', {
    component: CurrencyRenderer,
    displayName: 'Currency',
    supportsEdit: true,
  })

  registry.registerDataRenderer('percent', {
    component: PercentRenderer,
    displayName: 'Percent',
    supportsEdit: true,
  })

  // Boolean renderers
  registry.registerDataRenderer('boolean', {
    component: CheckboxRenderer,
    displayName: 'Checkbox',
    supportsEdit: true,
  })

  registry.registerDataRenderer('checkbox', {
    component: CheckboxRenderer,
    displayName: 'Checkbox',
    supportsEdit: true,
  })

  registry.registerDataRenderer('switch', {
    component: SwitchRenderer,
    displayName: 'Switch',
    supportsEdit: true,
  })

  registry.registerDataRenderer('badge', {
    component: BadgeRenderer,
    displayName: 'Badge',
    supportsEdit: true,
  })

  // Date renderers
  registry.registerDataRenderer('date', {
    component: DateRenderer,
    displayName: 'Date',
    supportsEdit: true,
  })

  registry.registerDataRenderer('datetime', {
    component: DateTimeRenderer,
    displayName: 'DateTime',
    supportsEdit: true,
  })

  registry.registerDataRenderer('timestamp', {
    component: TimestampRenderer,
    displayName: 'Timestamp',
    supportsEdit: true,
  })

  registry.registerDataRenderer('relativetime', {
    component: RelativeTimeRenderer,
    displayName: 'Relative Time',
    supportsEdit: true,
  })

  // Array renderers
  registry.registerDataRenderer('array', {
    component: ArrayRenderer,
    displayName: 'Array',
    supportsEdit: true,
  })

  registry.registerDataRenderer('tags', {
    component: TagArrayRenderer,
    displayName: 'Tags',
    supportsEdit: true,
  })

  // Object renderers
  registry.registerDataRenderer('object', {
    component: ObjectRenderer,
    displayName: 'Object',
    supportsEdit: true,
  })

  registry.registerDataRenderer('keyvalue', {
    component: KeyValueRenderer,
    displayName: 'Key-Value',
    supportsEdit: true,
  })

  // Relation renderers
  registry.registerDataRenderer('belongsto', {
    component: BelongsToRenderer,
    displayName: 'Belongs To',
    supportsEdit: false,
  })

  registry.registerDataRenderer('hasmany', {
    component: HasManyRenderer,
    displayName: 'Has Many',
    supportsEdit: false,
  })

  registry.registerDataRenderer('manytomany', {
    component: ManyToManyRenderer,
    displayName: 'Many to Many',
    supportsEdit: false,
  })

  // Media renderers
  registry.registerDataRenderer('image', {
    component: ImageRenderer,
    displayName: 'Image',
    supportsEdit: true,
  })

  registry.registerDataRenderer('file', {
    component: FileRenderer,
    displayName: 'File',
    supportsEdit: true,
  })

  // Special renderers
  registry.registerDataRenderer('json', {
    component: JSONRenderer,
    displayName: 'JSON',
    supportsEdit: true,
  })

  registry.registerDataRenderer('code', {
    component: CodeRenderer,
    displayName: 'Code',
    supportsEdit: true,
  })
}
