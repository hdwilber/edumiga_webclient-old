import { buildImageUrl } from './../../redux/utils'

export const Types = {
  boolean: {
    id: 1,
    default: false,
  },
  number: {
    id: 2,
    default: false,
  },
  string: {
    id: 3,
    default: '',
  },
  object: {
    id: 4,
    default: null,
  },
  array: {
    number: {
      id: 10,
    },
    string: {
      id: 11,
    },
    object: {
      id: 12,
    },
    default: [],
  },
  date: {
    id: 20,
    default: new Date(Date.now()),
  }
}

const isTypeArray = id => (id >= Types.array.number.id && id <= Types.array.object.id)

export function setDefault(type) {
  return isTypeArray(type.id) ? [] : type.default
}


export function parseImage (data) {
  return {
    file: null,
    url: data ? (buildImageUrl(data.url)): '',
    fakeUrl: '',
  }
}

export const defaultSpec = {
  image: {
    type: Types.object,
    parse: parseImage,
    build: function (data) {},
    save: function (data) {},
    default: {
      file: null,
      url: '',
      fakeUrl: '',
    }
  }
}
